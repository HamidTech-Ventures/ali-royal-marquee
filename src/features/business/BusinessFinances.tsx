import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { PageHeader } from '../../components/ui/PageHeader';
import { Button } from '../../components/ui/Button';
import { TrendingUp } from 'lucide-react';
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip as RechartsTooltip, Legend, LineChart, Line } from 'recharts';
import { financesService } from '../../services/financesService';
import { useToast } from '../../context/ToastContext';

export const BusinessFinances = () => {
  const navigate = useNavigate();
  const { error } = useToast();
  
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState<any>(null);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const result = await financesService.getOverview();
        setData(result);
      } catch (err) {
        error('Failed to load financial overview');
      } finally {
        setLoading(false);
      }
    };
    
    fetchData();
  }, []);

  if (loading || !data) {
    return <div className="p-8 text-center text-on-surface-variant">Loading financials...</div>;
  }

  const { totalRevenue, totalExpenses, netProfit, receivables, monthlyData } = data;

  return (
    <div className="w-full px-8 py-8 space-y-8">
      <PageHeader 
        title="Business Financials"
        category="Finance & Profitability"
        icon="account_balance"
        description="Comprehensive view of revenue, expenses, profit margins, and cash flow."
        actions={
          <>
            <Button variant="outline" onClick={() => navigate('/app/reports')}>View Full Reports</Button>
            <Button variant="primary" icon="payments" onClick={() => navigate('/app/payments', { state: { fromBusiness: true } })}>Manage Payments</Button>
          </>
        }
      />

      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-4">
        <div className="bg-surface border border-outline-variant/40 rounded-xl p-5 shadow-sm">
          <div className="text-xs text-on-surface-variant uppercase tracking-wider mb-1">Total Revenue (YTD)</div>
          <div className="text-2xl font-currency-num font-bold text-on-surface">PKR {(totalRevenue/1000000).toFixed(2)}M</div>
          <div className="text-xs text-success flex items-center mt-2"><TrendingUp className="w-3 h-3 mr-1" /></div>
        </div>
        <div className="bg-surface border border-outline-variant/40 rounded-xl p-5 shadow-sm">
          <div className="text-xs text-on-surface-variant uppercase tracking-wider mb-1">Total Expenses</div>
          <div className="text-2xl font-currency-num font-bold text-on-surface">PKR {(totalExpenses/1000000).toFixed(2)}M</div>
          <div className="text-xs text-error flex items-center mt-2"><TrendingUp className="w-3 h-3 mr-1" /></div>
        </div>
        <div className="bg-primary-container text-on-primary-container border border-outline-variant/40 rounded-xl p-5 shadow-sm">
          <div className="text-xs uppercase tracking-wider mb-1 opacity-80">Net Profit</div>
          <div className="text-2xl font-currency-num font-bold">PKR {(netProfit/1000000).toFixed(2)}M</div>
          <div className="text-xs flex items-center mt-2 opacity-90"><TrendingUp className="w-3 h-3 mr-1" /></div>
        </div>
        <div className="bg-surface border border-outline-variant/40 rounded-xl p-5 shadow-sm relative overflow-hidden">
          <div className="absolute left-0 top-0 bottom-0 w-1 bg-error"></div>
          <div className="text-xs text-on-surface-variant uppercase tracking-wider mb-1">Receivables</div>
          <div className="text-2xl font-currency-num font-bold text-error">PKR {(receivables/1000000).toFixed(2)}M</div>
        </div>
        <div className="bg-surface border border-outline-variant/40 rounded-xl p-5 shadow-sm relative overflow-hidden hidden lg:block">
          <div className="absolute left-0 top-0 bottom-0 w-1 bg-warning"></div>
          <div className="text-xs text-on-surface-variant uppercase tracking-wider mb-1">Payables</div>
          <div className="text-2xl font-currency-num font-bold text-warning">PKR 0.00M</div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="bg-surface rounded-xl border border-outline-variant/40 p-6 shadow-sm">
          <h3 className="font-title-lg mb-6">Revenue vs Expense</h3>
          <div className="h-[300px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={monthlyData} margin={{ top: 5, right: 20, bottom: 5, left: 0 }}>
                <XAxis dataKey="month" axisLine={false} tickLine={false} tick={{fill: '#71717a', fontSize: 12}} dy={10} />
                <YAxis axisLine={false} tickLine={false} tick={{fill: '#71717a', fontSize: 12}} tickFormatter={(value) => `${value/1000000}M`} />
                <RechartsTooltip cursor={{fill: 'rgba(0,0,0,0.05)'}} contentStyle={{borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)'}} />
                <Legend iconType="circle" wrapperStyle={{fontSize: '12px', paddingTop: '20px'}} />
                <Bar dataKey="revenue" name="Revenue" fill="#a78b5a" radius={[4, 4, 0, 0]} />
                <Bar dataKey="expenses" name="Expenses" fill="#f87171" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
        <div className="bg-surface rounded-xl border border-outline-variant/40 p-6 shadow-sm">
          <h3 className="font-title-lg mb-6">Profit Trend</h3>
          <div className="h-[300px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={monthlyData} margin={{ top: 5, right: 20, bottom: 5, left: 0 }}>
                <XAxis dataKey="month" axisLine={false} tickLine={false} tick={{fill: '#71717a', fontSize: 12}} dy={10} />
                <YAxis axisLine={false} tickLine={false} tick={{fill: '#71717a', fontSize: 12}} tickFormatter={(value) => `${value/1000000}M`} />
                <RechartsTooltip contentStyle={{borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)'}} />
                <Line type="monotone" dataKey="profit" name="Net Profit" stroke="#10b981" strokeWidth={3} dot={{r: 4, strokeWidth: 2}} activeDot={{r: 6}} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
};
