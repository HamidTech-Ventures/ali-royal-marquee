import os

path = r'c:\My working\HamidTech_Ventures\Clients\marquee-management-system\frontend\src\features\bookings\BookingDetails.tsx'
with open(path, 'r', encoding='utf-8') as f:
    text = f.read()

target1 = '<Button variant="primary" icon="edit" onClick={() => navigate(`/app/bookings/${booking.id}/edit`)}>Edit Booking</Button>'
repl1 = target1 + '\n                <Button variant="outline" icon="print" onClick={handlePrintInvoice}>Print Invoice</Button>'

target2 = '<h3 className="font-title-lg">Payment History</h3>\n                <Button variant="primary" icon="add" onClick={() => setPaymentModalOpen(true)}>Record Payment</Button>'
repl2 = '<h3 className="font-title-lg">Payment History</h3>\n                <div className="flex gap-2">\n                  <Button variant="outline" icon="print" onClick={handlePrintInvoice}>Print Invoice</Button>\n                  <Button variant="primary" icon="add" onClick={() => setPaymentModalOpen(true)}>Record Payment</Button>\n                </div>'

text = text.replace(target1, repl1)
text = text.replace(target2, repl2)

with open(path, 'w', encoding='utf-8') as f:
    f.write(text)
print("BookingDetails.tsx updated")

path2 = r'c:\My working\HamidTech_Ventures\Clients\marquee-management-system\frontend\src\features\events\EventDetails.tsx'
with open(path2, 'r', encoding='utf-8') as f:
    text2 = f.read()

target3 = '              <div className="flex items-center justify-between mb-4">\n                <h3 className="font-title-lg">Event Payments</h3>\n                <Button variant="primary" icon="add" onClick={() => navigate(\'/app/payments\')}>Record Payment</Button>\n              </div>'
repl3 = '              <div className="flex items-center justify-between mb-4">\n                <h3 className="font-title-lg">Event Payments</h3>\n                <div className="flex gap-2">\n                  <Button variant="outline" icon="print" onClick={handlePrintInvoice}>Print Invoice</Button>\n                  <Button variant="primary" icon="add" onClick={() => navigate(\'/app/payments\')}>Record Payment</Button>\n                </div>\n              </div>'
text2 = text2.replace(target3, repl3)

func_event = '''
  const handlePrintInvoice = async () => {
    try {
      success('Generating Invoice...');
      const res = await bookingsService.generateInvoice(data.bookingId);
      window.open(res.url, '_blank');
    } catch (err: any) {
      error(err.response?.data?.message || 'Failed to generate invoice');
    }
  };
'''
target4 = '  const [loadingFinances, setLoadingFinances] = useState(false);'
repl4 = target4 + '\n' + func_event
text2 = text2.replace(target4, repl4)

target_import = "import type { ColumnDef } from '../../components/ui/DataGrid';"
repl_import = "import { bookingsService } from '../../services/api';\nimport { success, error } from '../../utils/toast';\n" + target_import
text2 = text2.replace(target_import, repl_import)


with open(path2, 'w', encoding='utf-8') as f:
    f.write(text2)
print("EventDetails.tsx updated")
