import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { PageHeader } from '../../components/ui/PageHeader';
import { Button } from '../../components/ui/Button';
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, Legend, PieChart, Pie, Cell } from 'recharts';
import { financesService } from '../../services/financesService';
import { bookingsService } from '../../services/bookingsService';

export const Dashboard = () => {
  const navigate = useNavigate();
  const [finances, setFinances] = useState<any>(null);
  const [bookingsData, setBookingsData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [financeRes, bookingsRes] = await Promise.all([
          financesService.getOverview(),
          bookingsService.getBookings()
        ]);
        setFinances(financeRes);
        setBookingsData(bookingsRes.items || []);
      } catch (err) {
        console.error('Failed to load dashboard data', err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  if (loading) return <div className="p-8 text-center">Loading dashboard...</div>;

  const totalRevenue = finances?.totalRevenue || 0;
  const totalExpenses = finances?.totalExpenses || 0;
  const netProfit = finances?.netProfit || 0;
  const receivables = finances?.receivables || 0;
  const monthlyData = finances?.monthlyData || [];

  const confirmedBookingsCount = bookingsData.filter(b => b.status === 'Confirmed' || b.status === 'Completed').length;
  const totalBookingsCount = bookingsData.length;
  
  const upcomingBookings = bookingsData
    .filter(b => b.status === 'Confirmed')
    .sort((a, b) => new Date(a.dateStr).getTime() - new Date(b.dateStr).getTime())
    .slice(0, 2); // Show top 2 upcoming

  return (
    <div className="w-full px-4 md:px-8 py-6 bg-[#FAF8F5] min-h-screen">
      <div className="flex flex-col w-full space-y-6 md:space-y-8">
        
        <PageHeader 
          title="Command Center Overview"
          category="Business Pulse"
          icon="grid_view"
          description="Real-time pulse of operations, bookings, revenue and key actions."
          actions={
            <div className="flex overflow-x-auto md:flex-wrap items-center gap-2 pb-2 md:pb-0 w-full md:w-auto hide-scrollbar" style={{ scrollbarWidth: 'none' }}>
              <Button variant="primary" icon="add_circle" onClick={() => navigate('/app/bookings/new')} className="whitespace-nowrap shrink-0 !bg-[#5C0A1E]">New Booking</Button>
              <Button variant="outline" icon="person_add" onClick={() => navigate('/app/customers')} className="whitespace-nowrap shrink-0 !text-[#4a1420] !border-surface-variant">Add Customer</Button>
              <Button variant="outline" icon="payment" onClick={() => navigate('/app/payments/new')} className="whitespace-nowrap shrink-0 !text-[#4a1420] !border-surface-variant">Record Payment</Button>
            </div>
          }
        />

        {/* 2. KPI Cards Row */}
        <section className="grid grid-cols-2 lg:grid-cols-5 gap-3 md:gap-4">
          <div className="bg-white p-3.5 md:p-5 rounded-xl shadow-sm flex items-center gap-3 border-l-[3px] border-[#5C0A1E]">
            <div className="w-10 h-10 shrink-0 rounded-xl bg-[#5C0A1E]/10 flex items-center justify-center text-[#5C0A1E]">
              <span className="material-symbols-outlined text-[20px]">account_balance_wallet</span>
            </div>
            <div className="flex flex-col">
              <span className="text-[9px] md:text-label-sm uppercase text-on-surface-variant font-bold tracking-wider">
                Total Revenue
              </span>
              <div className="font-serif text-base md:text-headline-sm text-[#4a1420] font-bold">
                PKR {(totalRevenue / 1000000).toFixed(2)}M
              </div>
            </div>
          </div>

          <div className="bg-white p-3.5 md:p-5 rounded-xl shadow-sm flex items-center gap-3 border-l-[3px] border-[#5C0A1E]">
            <div className="w-10 h-10 shrink-0 rounded-xl bg-[#F2EFE9] flex items-center justify-center text-[#6e5e4f]">
              <span className="material-symbols-outlined text-[20px]">chair</span>
            </div>
            <div className="flex flex-col">
              <span className="text-[9px] md:text-label-sm uppercase text-on-surface-variant font-bold tracking-wider">
                Confirmed Bookings
              </span>
              <div className="font-serif text-base md:text-headline-sm text-[#4a1420] font-bold">
                {confirmedBookingsCount}
              </div>
            </div>
          </div>

          <div className="bg-white p-3.5 md:p-5 rounded-xl shadow-sm flex items-center gap-3 border-l-[3px] border-[#b0891d]">
            <div className="w-10 h-10 shrink-0 rounded-xl bg-[#b0891d]/10 flex items-center justify-center text-[#b0891d]">
              <span className="material-symbols-outlined text-[20px]">work_history</span>
            </div>
            <div className="flex flex-col">
              <span className="text-[9px] md:text-label-sm uppercase text-on-surface-variant font-bold tracking-wider">
                Outstanding
              </span>
              <div className="font-serif text-base md:text-headline-sm text-[#4a1420] font-bold">
                PKR {(receivables / 1000000).toFixed(2)}M
              </div>
            </div>
          </div>

          <div className="bg-white p-3.5 md:p-5 rounded-xl shadow-sm flex items-center gap-3 border-l-[3px] border-[#e02424]">
            <div className="w-10 h-10 shrink-0 rounded-xl bg-[#e02424]/10 flex items-center justify-center text-[#e02424]">
              <span className="material-symbols-outlined text-[20px]">receipt_long</span>
            </div>
            <div className="flex flex-col">
              <span className="text-[9px] md:text-label-sm uppercase text-on-surface-variant font-bold tracking-wider">
                Total Expenses
              </span>
              <div className="font-serif text-base md:text-headline-sm text-[#4a1420] font-bold">
                PKR {(totalExpenses / 1000000).toFixed(2)}M
              </div>
            </div>
          </div>

          <div className="col-span-2 lg:col-span-1 bg-white p-3.5 md:p-5 rounded-xl shadow-sm flex items-center gap-3 border-l-[3px] border-[#b0891d]">
            <div className="w-10 h-10 shrink-0 rounded-xl bg-[#b0891d]/10 flex items-center justify-center text-[#b0891d]">
              <span className="material-symbols-outlined text-[20px]">workspace_premium</span>
            </div>
            <div className="flex flex-col">
              <span className="text-[9px] md:text-label-sm uppercase text-on-surface-variant font-bold tracking-wider">
                Estimated Net Profit
              </span>
              <div className="font-serif text-base md:text-headline-sm text-[#4a1420] font-bold">
                PKR {(netProfit / 1000000).toFixed(2)}M
              </div>
            </div>
          </div>
        </section>

        {/* 3. Charts & Performance Row */}
        <section className="grid grid-cols-2 lg:grid-cols-12 gap-3 md:gap-6">
          <div className="col-span-1 lg:col-span-7 bg-white p-4 md:p-6 rounded-xl shadow-sm flex flex-col justify-between relative">
            <div>
              <div className="flex flex-wrap items-center justify-between gap-2 pb-2">
                <div className="w-full relative">
                  <h3 className="font-serif text-sm md:text-headline-sm font-bold text-[#4a1420]">
                    Revenue Overview
                  </h3>
                  <span className="material-symbols-outlined absolute right-0 top-0 text-on-surface-variant text-[16px] md:hidden">chevron_right</span>
                  <p className="font-body-sm text-body-sm text-on-surface-variant">
                    Monthly cash flow & profitability trajectory
                  </p>
                </div>
              </div>
              {/* Interactive Chart */}
              <div className="relative w-full h-64 pt-4">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={monthlyData}>
                    <XAxis dataKey="month" stroke="#8E928E" fontSize={12} tickLine={false} axisLine={false} />
                    <YAxis stroke="#8E928E" fontSize={12} tickLine={false} axisLine={false} tickFormatter={(val) => `Rs${val / 1000}k`} />
                    <Tooltip cursor={{ fill: 'rgba(0,0,0,0.05)' }} contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }} />
                    <Legend />
                    <Bar dataKey="revenue" fill="#695f4c" name="Revenue" radius={[4, 4, 0, 0]} />
                    <Bar dataKey="expenses" fill="#bdac96" name="Expenses" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>

          {/* Right Column: Booking Pipeline */}
          <div className="col-span-1 lg:col-span-5 bg-white p-4 md:p-6 rounded-xl shadow-sm flex flex-col justify-between relative">
            <div>
              <div className="pb-2 relative">
                <h3 className="font-serif text-sm md:text-headline-sm font-bold text-[#4a1420]">Booking Pipeline</h3>
                <span className="material-symbols-outlined absolute right-0 top-0 text-on-surface-variant text-[16px] md:hidden">chevron_right</span>
                <p className="text-[9px] md:text-body-sm text-on-surface-variant">Breakdown by status</p>
              </div>
              <div className="flex flex-col items-center gap-4 py-2">
                  <div className="relative w-40 h-40 flex items-center justify-center mt-2">
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={[
                            { name: 'Confirmed', value: confirmedBookingsCount || 1 },
                            { name: 'Pending', value: bookingsData.filter(b => b.status === 'Pending').length || 5 },
                            { name: 'In Progress', value: bookingsData.filter(b => b.status === 'In Progress' || b.status === 'Completed').length || 1 }
                          ]}
                          cx="50%"
                          cy="50%"
                          innerRadius={46}
                          outerRadius={75}
                          paddingAngle={0}
                          dataKey="value"
                          stroke="none"
                        >
                          <Cell key={`cell-0`} fill="#4a1420" />
                          <Cell key={`cell-1`} fill="#d4bca0" />
                          <Cell key={`cell-2`} fill="#b0891d" />
                        </Pie>
                      </PieChart>
                    </ResponsiveContainer>
                    <div className="absolute inset-0 flex flex-col items-center justify-center bg-white rounded-full m-auto w-[90px] h-[90px] shadow-sm pointer-events-none">
                      <span className="font-serif text-2xl font-bold text-[#4a1420] leading-none">{totalBookingsCount}</span>
                      <span className="text-[10px] text-on-surface-variant font-medium">Total</span>
                    </div>
                  </div>
                  <div className="space-y-2.5 w-full px-2 mt-2">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2.5">
                        <div className="w-3 h-3 rounded-full bg-[#4a1420]"></div>
                        <span className="text-[13px] text-on-surface-variant font-medium tracking-wide">Confirmed</span>
                      </div>
                      <span className="font-bold text-[13px] text-[#4a1420]">{confirmedBookingsCount}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2.5">
                        <div className="w-3 h-3 rounded-full bg-[#d4bca0]"></div>
                        <span className="text-[13px] text-on-surface-variant font-medium tracking-wide">Pending</span>
                      </div>
                      <span className="font-bold text-[13px] text-[#4a1420]">{bookingsData.filter(b => b.status === 'Pending').length}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2.5">
                        <div className="w-3 h-3 rounded-full bg-[#b0891d]"></div>
                        <span className="text-[13px] text-on-surface-variant font-medium tracking-wide">In Progress</span>
                      </div>
                      <span className="font-bold text-[13px] text-[#4a1420]">{bookingsData.filter(b => b.status === 'In Progress' || b.status === 'Completed').length}</span>
                    </div>
                  </div>
              </div>
            </div>
            <div className="pt-4 mt-1">
              <button 
                onClick={() => navigate('/app/bookings')}
                className="w-full bg-[#F2EFE9] p-3 rounded-lg flex items-center justify-between text-[#4a1420] hover:bg-[#e8e4db] transition-colors"
              >
                <span className="font-bold text-sm">View Pipeline</span>
                <span className="material-symbols-outlined text-[18px]">chevron_right</span>
              </button>
            </div>
          </div>
        </section>

        {/* 4. Upcoming Bookings */}
        <section className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          <div className="lg:col-span-8 bg-surface-container-lowest p-6 rounded-lg shadow-sm flex flex-col justify-between">
            <div>
              <div className="flex flex-wrap items-center justify-between pb-4">
                <div className="flex items-center gap-3">
                  <h3 className="font-headline-sm text-headline-sm text-primary">Upcoming Bookings</h3>
                </div>
                <Button variant="text" onClick={() => navigate('/app/bookings')}>View All Bookings</Button>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-left">
                  <thead>
                    <tr className="bg-surface-container-low text-on-surface-variant font-label-sm text-label-sm uppercase tracking-wider">
                      <th className="py-3 px-3">Date</th>
                      <th className="py-3 px-3">Event Type</th>
                      <th className="py-3 px-3">Guests</th>
                      <th className="py-3 px-3 text-right">Amount</th>
                      <th className="py-3 px-3 text-center">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-surface-container/50">
                    {upcomingBookings.length > 0 ? upcomingBookings.map((booking, idx) => (
                      <tr key={idx} className="hover:bg-surface-container-low/40 transition-colors cursor-pointer" onClick={() => navigate(`/app/bookings/${booking.id}`)}>
                        <td className="py-3.5 px-3 font-title-sm text-title-sm text-primary font-bold whitespace-nowrap">
                          {booking.dateStr}
                        </td>
                        <td className="py-3.5 px-3 font-body-sm text-body-sm text-on-surface">{booking.eventTitle || 'Event'}</td>
                        <td className="py-3.5 px-3 font-title-sm text-title-sm text-on-surface">{booking.guests}</td>
                        <td className="py-3.5 px-3 font-currency-num text-currency-num text-right text-on-surface">PKR {booking.totalAmount.toLocaleString()}</td>
                        <td className="py-3.5 px-3 text-center">
                          <span className="px-2.5 py-1 rounded font-label-sm text-label-sm font-semibold bg-surface-container text-on-surface">{booking.status}</span>
                        </td>
                      </tr>
                    )) : (
                      <tr>
                        <td colSpan={5} className="py-8 text-center text-on-surface-variant">No upcoming confirmed bookings</td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </section>

      </div>
    </div>
  );
};
