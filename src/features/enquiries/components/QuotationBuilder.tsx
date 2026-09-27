import React, { useState } from 'react';
import type { EnquiryDetail } from '../../../types';
import { Button } from '../../../components/ui/Button';
import { Badge } from '../../../components/ui/Badge';
import { enquiriesService } from '../../../services/enquiriesService';
import { useToast } from '../../../context/ToastContext';
import { packagesService } from '../../../services/packagesService';
import type { Package } from '../../../services/packagesService';
import { Plus, Trash2, FileText, RefreshCw, Download } from 'lucide-react';

interface Props {
  enquiry: EnquiryDetail;
  onUpdate: () => void;
}

export const QuotationBuilder: React.FC<Props> = ({ enquiry, onUpdate }) => {
  const [isCreating, setIsCreating] = useState(false);
  const [isRevision, setIsRevision] = useState(false);
  const [revisionId, setRevisionId] = useState<string | null>(null);

  const [packages, setPackages] = useState<Package[]>([]);
  React.useEffect(() => {
    packagesService.getPackages().then(setPackages).catch(console.error);
  }, []);

  const [lineItems, setLineItems] = useState<{ id: string; description: string; quantity: number; unitPrice: number; packageId?: string }[]>([]);
  const [discountAmount, setDiscountAmount] = useState(0);
  const [serviceChargeAmount, setServiceChargeAmount] = useState(0);
  const [taxAmount, setTaxAmount] = useState(0);
  const [notes, setNotes] = useState('');
  
  const [isSaving, setIsSaving] = useState(false);
  const { success, error } = useToast();

  const handleStartCreate = () => {
    setLineItems([{ id: Date.now().toString(), description: '', quantity: 1, unitPrice: 0 }]);
    setDiscountAmount(0);
    setServiceChargeAmount(0);
    setTaxAmount(0);
    setNotes('');
    setIsRevision(false);
    setRevisionId(null);
    setIsCreating(true);
  };

  const handleStartRevision = (q: any) => {
    // Clone line items (omit DB id to create new)
    const clonedItems = (q.lineItems || []).map((li: any, idx: number) => ({
      id: Date.now().toString() + idx,
      description: li.description,
      quantity: li.quantity,
      unitPrice: li.unitPrice,
      packageId: li.packageId
    }));
    setLineItems(clonedItems.length > 0 ? clonedItems : [{ id: Date.now().toString(), description: '', quantity: 1, unitPrice: 0 }]);
    setDiscountAmount(q.discountAmount || 0);
    setServiceChargeAmount(q.serviceChargeAmount || 0);
    setTaxAmount(q.taxAmount || 0);
    setNotes(q.notes || '');
    setIsRevision(true);
    setRevisionId(q.id);
    setIsCreating(true);
  };

  const handleAddLineItem = () => {
    setLineItems(prev => [...prev, { id: Date.now().toString(), description: '', quantity: 1, unitPrice: 0 }]);
  };

  const handleRemoveLineItem = (id: string) => {
    setLineItems(prev => prev.filter(item => item.id !== id));
  };

  const handleLineItemChange = (id: string, field: string, value: string | number) => {
    setLineItems(prev => prev.map(item => {
      if (item.id === id) {
        return { ...item, [field]: value };
      }
      return item;
    }));
  };

  const handleSave = async () => {
    if (lineItems.length === 0) {
      error('Please add at least one line item.');
      return;
    }

    if (lineItems.some(li => !li.description.trim())) {
      error('All line items must have a description.');
      return;
    }

    setIsSaving(true);
    try {
      const payload = {
        discountAmount: Number(discountAmount) || 0,
        serviceChargeAmount: Number(serviceChargeAmount) || 0,
        taxAmount: Number(taxAmount) || 0,
        notes,
        lineItems: lineItems.map(li => ({
          description: li.description,
          quantity: Number(li.quantity),
          unitPrice: Number(li.unitPrice),
          packageId: li.packageId || undefined
        }))
      };

      if (isRevision && revisionId) {
        await enquiriesService.createQuotationRevision(enquiry.id, revisionId, payload);
        success('Quotation revision created.');
      } else {
        await enquiriesService.createQuotation(enquiry.id, payload);
        success('Quotation created successfully.');
      }
      
      setIsCreating(false);
      onUpdate();
    } catch (err) {
      console.error(err);
      error('Failed to save quotation.');
    } finally {
      setIsSaving(false);
    }
  };

  const handleDownloadPdf = async (quotationId: string, refNumber: string) => {
    try {
      const blob = await enquiriesService.exportQuotationPdf(enquiry.id, quotationId);
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `Quotation_${refNumber}.pdf`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch (err) {
      console.error(err);
      error('Failed to download PDF.');
    }
  };

  // Calculations for UI preview
  const subTotal = lineItems.reduce((acc, curr) => acc + (Number(curr.quantity) * Number(curr.unitPrice)), 0);
  const grandTotal = subTotal + Number(serviceChargeAmount) + Number(taxAmount) - Number(discountAmount);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h3 className="font-title-lg">Quotations & Proformas</h3>
        {!isCreating && (
          <Button variant="primary" icon="add" onClick={handleStartCreate}>
            New Quotation
          </Button>
        )}
      </div>

      {isCreating && (
        <div className="bg-surface rounded-xl border border-outline-variant/60 shadow-sm overflow-hidden mb-6">
          <div className="bg-surface-container-lowest px-6 py-4 border-b border-outline-variant/60">
            <h4 className="font-title-md text-on-surface flex items-center gap-2">
              <FileText className="w-5 h-5 text-primary" />
              {isRevision ? 'Create Revision' : 'Quotation Builder'}
            </h4>
          </div>
          
          <div className="p-6 space-y-6">
            <div>
              <div className="flex items-center justify-between mb-3">
                <h5 className="font-medium text-on-surface">Line Items</h5>
                <Button variant="outline" onClick={handleAddLineItem} className="text-xs py-1 px-3">
                  <Plus className="w-4 h-4 mr-1"/> Add Item
                </Button>
              </div>
              
              <div className="border border-outline-variant rounded-lg overflow-hidden">
                <table className="w-full text-left text-sm">
                  <thead className="bg-surface-container-lowest border-b border-outline-variant">
                    <tr>
                      <th className="px-4 py-3 font-medium text-on-surface-variant w-[50%]">Description</th>
                      <th className="px-4 py-3 font-medium text-on-surface-variant w-[15%]">Qty</th>
                      <th className="px-4 py-3 font-medium text-on-surface-variant w-[15%]">Unit Price (PKR)</th>
                      <th className="px-4 py-3 font-medium text-on-surface-variant w-[15%] text-right">Total</th>
                      <th className="px-4 py-3 font-medium text-on-surface-variant w-[5%]"></th>
                    </tr>
                  </thead>
                  <tbody>
                    {lineItems.map((item) => (
                      <tr key={item.id} className="border-b border-outline-variant/50 last:border-0 bg-surface">
                        <td className="px-4 py-3 space-y-2">
                          <select 
                            className="w-full bg-transparent border-0 border-b border-transparent focus:border-primary focus:ring-0 px-0 py-1 text-sm text-on-surface-variant"
                            value={item.packageId || ''}
                            onChange={(e) => {
                              const pkgId = e.target.value;
                              const pkg = packages.find(p => p.id === pkgId);
                              handleLineItemChange(item.id, 'packageId', pkgId);
                              if (pkg) {
                                handleLineItemChange(item.id, 'description', pkg.name);
                                handleLineItemChange(item.id, 'unitPrice', pkg.price);
                              }
                            }}
                          >
                            <option value="">-- Select Package (Optional) --</option>
                            {packages.map(p => (
                              <option key={p.id} value={p.id}>{p.name} (PKR {p.price.toLocaleString()})</option>
                            ))}
                          </select>
                          <input 
                            type="text" 
                            className="w-full bg-transparent border-0 border-b border-transparent focus:border-primary focus:ring-0 px-0 py-1" 
                            placeholder="Custom description" 
                            value={item.description}
                            onChange={(e) => handleLineItemChange(item.id, 'description', e.target.value)}
                          />
                        </td>
                        <td className="px-4 py-3">
                          <input 
                            type="number" 
                            min="1"
                            className="w-full bg-transparent border-0 border-b border-transparent focus:border-primary focus:ring-0 px-0 py-1" 
                            value={item.quantity}
                            onChange={(e) => handleLineItemChange(item.id, 'quantity', e.target.value)}
                          />
                        </td>
                        <td className="px-4 py-3">
                          <input 
                            type="number" 
                            min="0"
                            className="w-full bg-transparent border-0 border-b border-transparent focus:border-primary focus:ring-0 px-0 py-1" 
                            value={item.unitPrice}
                            onChange={(e) => handleLineItemChange(item.id, 'unitPrice', e.target.value)}
                          />
                        </td>
                        <td className="px-4 py-3 text-right font-medium">
                          {((Number(item.quantity) || 0) * (Number(item.unitPrice) || 0)).toLocaleString()}
                        </td>
                        <td className="px-4 py-3 text-right">
                          <button 
                            onClick={() => handleRemoveLineItem(item.id)}
                            className="text-on-surface-variant hover:text-error transition-colors"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </td>
                      </tr>
                    ))}
                    {lineItems.length === 0 && (
                      <tr>
                        <td colSpan={5} className="px-4 py-8 text-center text-on-surface-variant italic">
                          No items added. Click 'Add Item' to start.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              <div className="space-y-4">
                <h5 className="font-medium text-on-surface mb-2">Additional Information</h5>
                <div className="space-y-4">
                  <label className="text-sm font-medium text-on-surface flex flex-col gap-1.5 w-full">
                    Terms & Notes
                    <textarea 
                      className="w-full h-32 px-3 py-2 bg-surface border border-outline-variant rounded-lg outline-none transition-all duration-200 text-on-surface text-sm focus:ring-2 focus:ring-primary/20 focus:border-primary resize-none"
                      placeholder="Enter terms, conditions, or specific notes for this quotation..."
                      value={notes}
                      onChange={(e) => setNotes(e.target.value)}
                    />
                  </label>
                </div>
              </div>
              
              <div className="bg-surface-container-lowest p-6 rounded-xl border border-outline-variant/40 space-y-4">
                <h5 className="font-medium text-on-surface mb-2">Summary</h5>
                
                <div className="flex justify-between items-center text-sm">
                  <span className="text-on-surface-variant">Subtotal</span>
                  <span className="font-medium">PKR {subTotal.toLocaleString()}</span>
                </div>
                
                <div className="flex justify-between items-center text-sm group">
                  <span className="text-on-surface-variant">Service Charge (+)</span>
                  <div className="flex items-center gap-2">
                    <span className="text-on-surface-variant text-xs">PKR</span>
                    <input 
                      type="number" 
                      min="0"
                      className="w-24 text-right bg-surface border border-outline-variant rounded px-2 py-1 text-sm focus:border-primary focus:ring-1 focus:ring-primary outline-none"
                      value={serviceChargeAmount}
                      onChange={e => setServiceChargeAmount(Number(e.target.value) || 0)}
                    />
                  </div>
                </div>

                <div className="flex justify-between items-center text-sm">
                  <span className="text-on-surface-variant">Tax (+)</span>
                  <div className="flex items-center gap-2">
                    <span className="text-on-surface-variant text-xs">PKR</span>
                    <input 
                      type="number" 
                      min="0"
                      className="w-24 text-right bg-surface border border-outline-variant rounded px-2 py-1 text-sm focus:border-primary focus:ring-1 focus:ring-primary outline-none"
                      value={taxAmount}
                      onChange={e => setTaxAmount(Number(e.target.value) || 0)}
                    />
                  </div>
                </div>

                <div className="flex justify-between items-center text-sm">
                  <span className="text-on-surface-variant">Discount (-)</span>
                  <div className="flex items-center gap-2">
                    <span className="text-on-surface-variant text-xs">PKR</span>
                    <input 
                      type="number" 
                      min="0"
                      className="w-24 text-right bg-surface border border-outline-variant rounded px-2 py-1 text-sm focus:border-primary focus:ring-1 focus:ring-primary outline-none"
                      value={discountAmount}
                      onChange={e => setDiscountAmount(Number(e.target.value) || 0)}
                    />
                  </div>
                </div>
                
                <div className="pt-4 mt-2 border-t border-outline-variant/50 flex justify-between items-center">
                  <span className="font-bold text-on-surface">Grand Total</span>
                  <span className="font-bold text-xl text-primary font-currency-num">PKR {Math.max(0, grandTotal).toLocaleString()}</span>
                </div>
              </div>
            </div>
            
            <div className="flex justify-end gap-3 pt-4 border-t border-outline-variant/40">
              <Button variant="outline" onClick={() => setIsCreating(false)} disabled={isSaving}>Cancel</Button>
              <Button variant="primary" onClick={handleSave} disabled={isSaving}>
                {isSaving ? 'Saving...' : 'Save Quotation'}
              </Button>
            </div>
          </div>
        </div>
      )}

      {enquiry.quotations.length === 0 ? (
        <div className="text-center py-10 bg-surface-container-lowest border border-dashed border-outline-variant rounded-xl">
          <div className="w-12 h-12 bg-primary-container text-on-primary-container rounded-full flex items-center justify-center mx-auto mb-3">
            <FileText className="w-6 h-6" />
          </div>
          <h3 className="font-medium text-on-surface mb-1">No Quotations Yet</h3>
          <p className="text-on-surface-variant text-sm mb-4">Create a customized quotation for this enquiry.</p>
          <Button variant="outline" onClick={handleStartCreate}>Build Quotation</Button>
        </div>
      ) : (
        <div className="space-y-4">
          {enquiry.quotations.sort((a,b) => b.version - a.version).map((q, idx) => {
            const isLatest = idx === 0;
            return (
              <div key={q.id} className={`bg-surface border ${isLatest ? 'border-primary/40 shadow-sm' : 'border-outline-variant/40'} p-5 rounded-xl flex flex-col md:flex-row justify-between gap-6`}>
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-1">
                    <div className="font-bold text-lg text-on-surface">{q.quotationReference}</div>
                    <Badge variant="neutral">v{q.version}</Badge>
                    {isLatest && <Badge variant="primary">Latest</Badge>}
                  </div>
                  <div className="text-on-surface-variant text-sm flex items-center gap-4 mb-3">
                    <span>Generated: {new Date(q.createdAt).toLocaleDateString()}</span>
                    <span>By: {q.creatorName}</span>
                  </div>
                  
                  {q.notes && (
                    <div className="bg-surface-container-lowest p-3 rounded text-sm text-on-surface-variant border border-outline-variant/30 mt-2">
                      <span className="font-medium text-on-surface block mb-1">Notes:</span>
                      {q.notes}
                    </div>
                  )}
                </div>
                
                <div className="flex flex-col items-end justify-between shrink-0 min-w-[200px]">
                  <div className="text-right mb-4">
                    <div className="text-sm text-on-surface-variant mb-1">Grand Total</div>
                    <div className="text-2xl font-bold font-currency-num text-success">PKR {(q.grandTotal || 0).toLocaleString()}</div>
                    <Badge variant={q.status === 'Accepted' ? 'success' : q.status === 'Sent' ? 'primary' : 'neutral'} className="mt-2">
                      {q.status}
                    </Badge>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    <Button variant="outline" className="text-sm py-1 px-3" onClick={() => handleDownloadPdf(q.id, q.quotationReference)}>
                      <Download className="w-4 h-4 mr-1.5" /> PDF
                    </Button>
                    {isLatest && !isCreating && (
                      <Button variant="secondary" className="text-sm py-1 px-3" onClick={() => handleStartRevision(q)}>
                        <RefreshCw className="w-4 h-4 mr-1.5" /> Revise
                      </Button>
                    )}
                    <Button variant="outline" className="text-sm py-1 px-3 text-error border-error/50 hover:bg-error/10 hover:border-error" onClick={async () => {
                      if(window.confirm('Are you sure you want to delete this quotation?')) {
                        try {
                          await enquiriesService.deleteQuotation(enquiry.id, q.id);
                          success('Quotation deleted successfully.');
                          onUpdate();
                        } catch(err) {
                          error('Failed to delete quotation.');
                        }
                      }
                    }}>
                      <Trash2 className="w-4 h-4 mr-1.5" /> Delete
                    </Button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
