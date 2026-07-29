import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/Card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../components/ui/Table';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { Badge } from '../components/ui/Badge';
import { useAppStore } from '../store';
import { Search, ReceiptText, MapPin, X } from 'lucide-react';
import { Loan, Customer } from '../types';
import { calculateAdvancedInterest } from '../lib/loanCalculator';

export function Collections() {
  const { collections, loans, customers, addCollection, currentUser } = useAppStore();
  const [searchTerm, setSearchTerm] = useState('');
  const [isCollectModalOpen, setIsCollectModalOpen] = useState(false);

  const getCustomer = (loanId: string) => {
    const loan = loans.find(l => l.id === loanId);
    return customers.find(c => c.id === loan?.customerId);
  };

  const filteredCollections = collections.filter(c => 
    c.receiptNumber.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Collections</h1>
          <p className="text-sm text-slate-500">Daily collections, receipts and payments</p>
        </div>
        <Button onClick={() => setIsCollectModalOpen(true)}>
          <ReceiptText size={18} className="mr-2" />
          Receive Payment
        </Button>
      </div>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between sm:px-6">
          <CardTitle>Recent Receipts</CardTitle>
          <div className="relative w-64">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
            <Input 
              placeholder="Search receipt #..." 
              className="pl-9 h-9 text-sm"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </CardHeader>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Receipt #</TableHead>
                <TableHead>Date</TableHead>
                <TableHead>Customer</TableHead>
                <TableHead>Loan No.</TableHead>
                <TableHead>Amount</TableHead>
                <TableHead>Mode</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredCollections.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} className="text-center py-8 text-slate-500">
                    No collections found.
                  </TableCell>
                </TableRow>
              ) : (
                filteredCollections.slice().reverse().map(col => {
                  const customer = getCustomer(col.loanId);
                  const loan = loans.find(l => l.id === col.loanId);
                  
                  return (
                    <TableRow key={col.id}>
                      <TableCell className="font-medium text-slate-900">{col.receiptNumber}</TableCell>
                      <TableCell className="text-slate-500">
                        {new Date(col.date).toLocaleDateString()}
                      </TableCell>
                      <TableCell>
                        <div className="font-medium text-slate-900">{customer?.name || 'Unknown'}</div>
                      </TableCell>
                      <TableCell className="text-slate-600">{loan?.loanNumber}</TableCell>
                      <TableCell className="font-bold text-emerald-600">₹{col.amountReceived}</TableCell>
                      <TableCell>
                        <Badge variant="outline">{col.paymentMode}</Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        <Button variant="ghost" size="sm" className="text-blue-600 hover:text-blue-700">
                          Print
                        </Button>
                      </TableCell>
                    </TableRow>
                  );
                })
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {isCollectModalOpen && (
        <CollectModal 
          loans={loans}
          customers={customers}
          agentId={currentUser?.id || 'sys-agent'}
          onClose={() => setIsCollectModalOpen(false)} 
          onAdd={(data) => {
            addCollection(data);
            setIsCollectModalOpen(false);
          }} 
        />
      )}
    </div>
  );
}

function CollectModal({ onClose, onAdd, loans, customers, agentId }: any) {
  const [formData, setFormData] = useState({
    loanId: '',
    receiptDate: new Date().toISOString().split('T')[0],
    amountReceived: '',
    principalCollected: '',
    interestCollected: '',
    paymentMode: 'Cash' as const
  });

  const [calcStats, setCalcStats] = useState<any>(null);
  const activeLoans = loans.filter((l: Loan) => l.status === 'Running' || l.status === 'Overdue');
  const selectedLoanData = activeLoans.find((l: Loan) => l.id === formData.loanId);
  const selectedCustomer = selectedLoanData ? customers.find((c: Customer) => c.id === selectedLoanData.customerId) : null;

  useEffect(() => {
    if (selectedLoanData && formData.receiptDate) {
      const loanDate = new Date(selectedLoanData.disbursementDate);
      const receiptDate = new Date(formData.receiptDate);
      
      const stats = calculateAdvancedInterest(
        selectedLoanData.amount,
        selectedLoanData.interestRate,
        selectedLoanData.loanProduct,
        loanDate,
        receiptDate
      );
      setCalcStats(stats);
      
      // Auto-suggest amounts based on product
      if (selectedLoanData.loanProduct === 'Daily Finance') {
        setFormData(prev => ({ 
          ...prev, 
          amountReceived: selectedLoanData.emiAmount.toFixed(0), 
          principalCollected: selectedLoanData.emiAmount.toFixed(0), 
          interestCollected: '0' 
        }));
      } else {
        // Suggest total interest due minus already collected interest
        const interestDue = Math.max(0, stats.totalInterest - selectedLoanData.totalInterestCollected);
        setFormData(prev => ({ 
          ...prev, 
          amountReceived: interestDue.toFixed(0), 
          interestCollected: interestDue.toFixed(0),
          principalCollected: '0'
        }));
      }
    } else {
      setCalcStats(null);
    }
  }, [formData.loanId, formData.receiptDate]);

  const handleAmountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setFormData(prev => {
      const amt = Number(val) || 0;
      let iColl = 0;
      let pColl = 0;
      
      if (selectedLoanData?.loanProduct === 'Daily Finance') {
        pColl = amt;
      } else {
        const interestDue = calcStats ? Math.max(0, calcStats.totalInterest - (selectedLoanData?.totalInterestCollected || 0)) : 0;
        iColl = Math.min(amt, interestDue);
        pColl = Math.max(0, amt - iColl);
      }
      
      return { 
        ...prev, 
        amountReceived: val, 
        interestCollected: iColl.toString(), 
        principalCollected: pColl.toString() 
      };
    });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.loanId) return alert("Select a loan");
    if (!calcStats) return alert("Calculation not complete");
    
    onAdd({
      loanId: formData.loanId,
      agentId,
      date: new Date(formData.receiptDate).toISOString(),
      amountReceived: parseFloat(formData.amountReceived) || 0,
      principalCollected: parseFloat(formData.principalCollected) || 0,
      interestCollected: parseFloat(formData.interestCollected) || 0,
      paymentMode: formData.paymentMode,
      elapsedDays: calcStats.totalDays,
      elapsedMonths: calcStats.totalMonths,
      extraDays: calcStats.extraDays,
      location: { lat: 17.3850, lng: 78.4867 }
    });
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/50 flex items-center justify-center p-4">
      <Card className="w-full max-w-4xl max-h-[90vh] flex flex-col">
        <div className="flex items-center justify-between p-6 border-b border-slate-100">
          <h2 className="text-xl font-bold text-slate-900">Receive Payment</h2>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600">
            <X size={20} />
          </button>
        </div>
        
        <div className="p-6 overflow-y-auto">
          <form id="collect-form" onSubmit={handleSubmit} className="space-y-6">
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {/* Left Column */}
              <div className="space-y-6">
                <div className="space-y-2">
                  <label className="text-sm font-medium text-slate-700">Select Loan</label>
                  <select 
                    required
                    className="flex h-10 w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-600"
                    value={formData.loanId}
                    onChange={e => setFormData({...formData, loanId: e.target.value})}
                  >
                    <option value="" disabled>Search or select loan...</option>
                    {activeLoans.map((l: Loan) => {
                      const c = customers.find((cust: Customer) => cust.id === l.customerId);
                      return (
                        <option key={l.id} value={l.id}>
                          {l.loanNumber} - {c?.name}
                        </option>
                      );
                    })}
                  </select>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium text-slate-700">Receipt Date</label>
                  <Input required type="date" value={formData.receiptDate} onChange={e => setFormData({...formData, receiptDate: e.target.value})} />
                </div>
                
                <div className="space-y-2">
                  <label className="text-sm font-medium text-slate-700">Total Amount Received (₹)</label>
                  <Input 
                    required 
                    type="number" 
                    step="0.01" 
                    value={formData.amountReceived} 
                    onChange={handleAmountChange} 
                    placeholder="e.g. 1000" 
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-slate-700">Interest Portion (₹)</label>
                    <Input required type="number" value={formData.interestCollected} onChange={e => setFormData({...formData, interestCollected: e.target.value})} />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-slate-700">Principal Portion (₹)</label>
                    <Input required type="number" value={formData.principalCollected} onChange={e => setFormData({...formData, principalCollected: e.target.value})} />
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium text-slate-700">Payment Mode</label>
                  <select 
                    className="flex h-10 w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-600"
                    value={formData.paymentMode}
                    onChange={e => setFormData({...formData, paymentMode: e.target.value as any})}
                  >
                    <option value="Cash">Cash</option>
                    <option value="UPI">UPI</option>
                    <option value="Bank">Bank Transfer</option>
                    <option value="Cheque">Cheque</option>
                  </select>
                </div>
              </div>

              {/* Right Column (Calculations) */}
              <div className="bg-slate-50 p-6 rounded-xl border border-slate-200 flex flex-col justify-center">
                <h3 className="text-sm font-bold text-slate-500 uppercase tracking-wider mb-4">Live Calculations</h3>
                
                {!selectedLoanData || !calcStats ? (
                  <p className="text-sm text-slate-500 text-center py-8">Select a loan to view automated calculations based on the dates.</p>
                ) : (
                  <div className="space-y-4">
                    <div className="grid grid-cols-2 gap-3 text-sm">
                      <div className="text-slate-500">Borrower:</div>
                      <div className="font-medium text-right text-slate-900">{selectedCustomer?.name}</div>

                      <div className="text-slate-500">Loan Product:</div>
                      <div className="font-medium text-right text-slate-900">{selectedLoanData.loanProduct}</div>
                      
                      <div className="text-slate-500">Principal Outstanding:</div>
                      <div className="font-medium text-right text-slate-900">₹{(selectedLoanData.outstandingPrincipal ?? selectedLoanData.amount ?? 0).toLocaleString()}</div>
                      
                      <div className="text-slate-500">Interest Rate:</div>
                      <div className="font-medium text-right text-slate-900">{selectedLoanData.interestRate}%</div>
                      
                      <div className="col-span-2 border-t border-slate-200 my-2"></div>
                      
                      <div className="text-slate-500">Elapsed Time:</div>
                      <div className="font-medium text-right text-slate-900">
                        {calcStats.years > 0 ? `${calcStats.years}Y ` : ''}
                        {calcStats.completedMonths % 12 > 0 ? `${calcStats.completedMonths % 12}M ` : ''}
                        {calcStats.extraDays > 0 ? `${calcStats.extraDays}D` : ''}
                        {calcStats.totalDays === 0 ? '0 Days' : ''}
                      </div>

                      <div className="text-slate-500">Total Days:</div>
                      <div className="font-medium text-right text-slate-900">{calcStats.totalDays} Days</div>
                      
                      <div className="col-span-2 border-t border-slate-200 my-2"></div>

                      <div className="text-slate-500">Gross Interest Accrued:</div>
                      <div className="font-medium text-right text-slate-900">₹{calcStats.totalInterest.toFixed(2)}</div>
                      
                      <div className="text-slate-500">Previously Paid:</div>
                      <div className="font-medium text-right text-emerald-600">-₹{selectedLoanData.totalInterestCollected.toFixed(2)}</div>

                      <div className="col-span-2 border-t border-slate-200 my-2"></div>
                      
                      <div className="text-slate-700 font-bold text-base">Interest Pending:</div>
                      <div className="font-bold text-right text-rose-600 text-base">
                        ₹{Math.max(0, calcStats.totalInterest - selectedLoanData.totalInterestCollected).toFixed(2)}
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>

          </form>
        </div>
        
        <div className="p-6 border-t border-slate-100 flex justify-end gap-3 bg-slate-50 mt-auto">
          <Button type="button" variant="outline" onClick={onClose}>Cancel</Button>
          <Button type="submit" form="collect-form">Generate Receipt</Button>
        </div>
      </Card>
    </div>
  );
}
