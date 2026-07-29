import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/Card';
import { useAppStore } from '../store';
import { ArrowUpRight, ArrowDownRight, Users, CreditCard, Banknote, Activity } from 'lucide-react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

export function Dashboard() {
  const { customers, loans, collections } = useAppStore();

  const totalOutstanding = loans.reduce((acc, loan) => acc + (loan.outstandingPrincipal ?? loan.amount ?? 0), 0);
  const totalFinanceIncome = loans.reduce((acc, loan) => acc + (loan.totalInterestCollected || 0), 0);
  const totalCollected = collections.reduce((acc, col) => acc + col.amountReceived, 0);
  const activeLoansCount = loans.filter(l => l.status === 'Running').length;

  const data = [
    { name: 'Jan', collected: 4000, target: 2400 },
    { name: 'Feb', collected: 3000, target: 1398 },
    { name: 'Mar', collected: 2000, target: 9800 },
    { name: 'Apr', collected: 2780, target: 3908 },
    { name: 'May', collected: 1890, target: 4800 },
    { name: 'Jun', collected: 2390, target: 3800 },
    { name: 'Jul', collected: 3490, target: 4300 },
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Dashboard</h1>
          <p className="text-sm text-slate-500">Overview of your finance operations</p>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard 
          title="Total Principal Out." 
          value={`₹${totalOutstanding.toLocaleString()}`} 
          trend="+2.5%" 
          trendUp={true} 
          icon={Activity} 
        />
        <StatCard 
          title="Total Finance Income" 
          value={`₹${totalFinanceIncome.toLocaleString()}`} 
          trend="+12%" 
          trendUp={true} 
          icon={Banknote} 
        />
        <StatCard 
          title="Active Loans" 
          value={activeLoansCount.toString()} 
          trend="-1.2%" 
          trendUp={false} 
          icon={CreditCard} 
        />
        <StatCard 
          title="Total Customers" 
          value={customers.length.toString()} 
          trend="+4.3%" 
          trendUp={true} 
          icon={Users} 
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Collection Trend</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-[300px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={data} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                  <defs>
                    <linearGradient id="colorCollected" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3}/>
                      <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                  <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: '#64748b', fontSize: 12 }} dy={10} />
                  <YAxis axisLine={false} tickLine={false} tick={{ fill: '#64748b', fontSize: 12 }} />
                  <Tooltip 
                    contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                  />
                  <Area type="monotone" dataKey="collected" stroke="#3b82f6" strokeWidth={2} fillOpacity={1} fill="url(#colorCollected)" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Recent Collections</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {collections.slice(0, 5).length === 0 ? (
                <p className="text-sm text-slate-500 text-center py-4">No recent collections</p>
              ) : (
                collections.slice(-5).reverse().map(col => {
                  const loan = loans.find(l => l.id === col.loanId);
                  const customer = customers.find(c => c.id === loan?.customerId);
                  return (
                    <div key={col.id} className="flex items-center justify-between pb-4 border-b border-slate-100 last:border-0 last:pb-0">
                      <div>
                        <p className="text-sm font-medium text-slate-900">{customer?.name || 'Unknown'}</p>
                        <p className="text-xs text-slate-500">{loan?.loanNumber}</p>
                      </div>
                      <div className="text-right">
                        <p className="text-sm font-bold text-emerald-600">+₹{col.amountReceived}</p>
                        <p className="text-xs text-slate-500">{new Date(col.date).toLocaleDateString()}</p>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

function StatCard({ title, value, trend, trendUp, icon: Icon }: any) {
  return (
    <Card>
      <CardContent className="p-6">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-slate-500 mb-1">{title}</p>
            <h4 className="text-2xl font-bold text-slate-900">{value}</h4>
          </div>
          <div className="h-12 w-12 bg-blue-50 text-blue-600 rounded-full flex items-center justify-center">
            <Icon size={24} />
          </div>
        </div>
        <div className="mt-4 flex items-center text-sm">
          <span className={`flex items-center font-medium ${trendUp ? 'text-emerald-600' : 'text-red-600'}`}>
            {trendUp ? <ArrowUpRight size={16} className="mr-1" /> : <ArrowDownRight size={16} className="mr-1" />}
            {trend}
          </span>
          <span className="text-slate-500 ml-2">vs last month</span>
        </div>
      </CardContent>
    </Card>
  );
}
