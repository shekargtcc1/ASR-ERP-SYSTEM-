import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/Card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../components/ui/Table';
import { Badge } from '../components/ui/Badge';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { useAppStore } from '../store';
import { Plus, Search, MoreVertical, X, Eye } from 'lucide-react';
import { Customer, Loan, LoanProduct, CollectionMode } from '../types';

export function Loans() {
  const { loans, customers, addLoan, collections } = useAppStore();
  const [searchTerm, setSearchTerm] = useState('');
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [selectedLedgerLoan, setSelectedLedgerLoan] = useState<Loan | null>(null);

  const getCustomerName = (id: string) => customers.find(c => c.id === id)?.name || 'Unknown';

  const filteredLoans = loans.filter(l => 
    l.loanNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
    getCustomerName(l.customerId).toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getStatusBadgeVariant = (status: string) => {
    switch(status) {
      case 'Running': return 'success';
      case 'Closed': return 'secondary';
      case 'Overdue': return 'destructive';
      case 'Default': return 'destructive';
      default: return 'default';
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Loans</h1>
          <p className="text-sm text-slate-500">Manage active loans, approvals, and terms</p>
        </div>
        <Button onClick={() => setIsAddModalOpen(true)}>
          <Plus size={18} className="mr-2" />
          New Loan
        </Button>
      </div>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between sm:px-6">
          <CardTitle>Loan Accounts</CardTitle>
          <div className="relative w-64">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
            <Input 
              placeholder="Search by loan #, customer..." 
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
                <TableHead>Loan No.</TableHead>
                <TableHead>Customer</TableHead>
                <TableHead>Product</TableHead>
                <TableHead>Amount</TableHead>
                <TableHead>Outstanding</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredLoans.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} className="text-center py-8 text-slate-500">
                    No loans found.
                  </TableCell>
                </TableRow>
              ) : (
                filteredLoans.map(loan => (
                  <TableRow key={loan.id}>
                    <TableCell className="font-medium text-slate-900">{loan.loanNumber}</TableCell>
                    <TableCell>
                      <div className="font-medium text-slate-900">{getCustomerName(loan.customerId)}</div>
                      <div className="text-xs text-slate-500">{loan.customerId}</div>
                    </TableCell>
                    <TableCell>
                      <div className="text-slate-900">{loan.loanProduct}</div>
                      <div className="text-xs text-slate-500">{loan.interestRate}% Interest</div>
                    </TableCell>
                    <TableCell className="text-slate-900">₹{loan.amount.toLocaleString()}</TableCell>
                    <TableCell className="font-semibold text-slate-900">
                      ₹{(loan.outstandingPrincipal ?? loan.amount ?? 0).toLocaleString()}
                    </TableCell>
                    <TableCell>
                      <Badge variant={getStatusBadgeVariant(loan.status)}>
                        {loan.status}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <Button variant="ghost" size="sm" onClick={() => setSelectedLedgerLoan(loan)}>
                        <Eye size={16} className="mr-2" />
                        Ledger
                      </Button>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {isAddModalOpen && (
        <AddLoanModal 
          customers={customers}
          onClose={() => setIsAddModalOpen(false)} 
          onAdd={(data) => {
            addLoan(data);
            setIsAddModalOpen(false);
          }} 
        />
      )}

      {selectedLedgerLoan && (
        <LedgerModal 
          loan={selectedLedgerLoan} 
          customer={customers.find(c => c.id === selectedLedgerLoan.customerId)!}
          collections={collections.filter(c => c.loanId === selectedLedgerLoan.id)}
          onClose={() => setSelectedLedgerLoan(null)}
        />
      )}
    </div>
  );
}

function LedgerModal({ loan, customer, collections, onClose }: { loan: Loan, customer: Customer, collections: any[], onClose: () => void }) {
  let runningBal = loan.amount;

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/50 flex items-center justify-center p-4">
      <Card className="w-full max-w-4xl max-h-[90vh] flex flex-col">
        <div className="flex items-center justify-between p-6 border-b border-slate-100">
          <div>
            <h2 className="text-xl font-bold text-slate-900">Borrower Ledger</h2>
            <p className="text-sm text-slate-500">Loan: {loan.loanNumber} | Customer: {customer?.name}</p>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600">
            <X size={20} />
          </button>
        </div>
        
        <div className="p-6 overflow-y-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Date</TableHead>
                <TableHead>Receipt No.</TableHead>
                <TableHead className="text-right">Principal Collected</TableHead>
                <TableHead className="text-right">Interest Collected</TableHead>
                <TableHead className="text-right">Total Collection</TableHead>
                <TableHead className="text-right">Principal Balance</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              <TableRow>
                <TableCell>{new Date(loan.disbursementDate).toLocaleDateString()}</TableCell>
                <TableCell className="text-slate-500">Disbursement</TableCell>
                <TableCell className="text-right">-</TableCell>
                <TableCell className="text-right">-</TableCell>
                <TableCell className="text-right">-</TableCell>
                <TableCell className="text-right font-bold">₹{runningBal.toLocaleString()}</TableCell>
              </TableRow>
              {collections.map(c => {
                runningBal -= c.principalCollected;
                return (
                  <TableRow key={c.id}>
                    <TableCell>{new Date(c.date).toLocaleDateString()}</TableCell>
                    <TableCell>{c.receiptNumber}</TableCell>
                    <TableCell className="text-right text-emerald-600">₹{c.principalCollected.toLocaleString()}</TableCell>
                    <TableCell className="text-right text-emerald-600">₹{c.interestCollected.toLocaleString()}</TableCell>
                    <TableCell className="text-right font-semibold">₹{c.amountReceived.toLocaleString()}</TableCell>
                    <TableCell className="text-right font-bold text-slate-900">₹{runningBal.toLocaleString()}</TableCell>
                  </TableRow>
                )
              })}
            </TableBody>
          </Table>
        </div>
      </Card>
    </div>
  );
}

function AddLoanModal({ onClose, onAdd, customers }: { onClose: () => void, onAdd: (data: any) => void, customers: Customer[] }) {
  const [formData, setFormData] = useState({
    customerId: '',
    loanProduct: 'Monthly Finance' as LoanProduct,
    collectionMode: 'Monthly' as CollectionMode,
    amount: '',
    processingFee: '',
    interestRate: '2',
    tenure: '12',
  });

  const [calcs, setCalcs] = useState({
    netDisbursed: 0,
    emiAmount: 0,
    totalRecoverable: 0,
    financeIncome: 0,
  });

  useEffect(() => {
    const principal = Number(formData.amount) || 0;
    const fee = Number(formData.processingFee) || 0;
    const rate = Number(formData.interestRate) || 0;
    const tenure = Number(formData.tenure) || 0;
    
    const net = principal - fee;
    let emi = 0;
    let total = 0;
    let income = 0;

    if (formData.loanProduct === 'Daily Finance') {
      // EMI = total principal / days. Income = processing fee.
      emi = principal / (tenure || 1);
      total = principal;
      income = fee;
    } else if (formData.loanProduct === 'Weekly Finance') {
      const weeklyInterest = principal * (rate / 100);
      income = (weeklyInterest * tenure) + fee;
      total = principal + (weeklyInterest * tenure);
      emi = total / (tenure || 1);
    } else if (formData.loanProduct === 'Monthly Finance' || formData.loanProduct === 'Yearly Finance') {
      // Typically just pay interest, principal paid at end
      const periodInterest = principal * (rate / 100);
      income = (periodInterest * tenure) + fee;
      total = principal + (periodInterest * tenure);
      emi = periodInterest; // Monthly/Yearly interest only
    }

    setCalcs({
      netDisbursed: net,
      emiAmount: emi,
      totalRecoverable: total,
      financeIncome: income,
    });
  }, [formData]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.customerId) return alert("Please select a customer");
    
    onAdd({
      customerId: formData.customerId,
      loanProduct: formData.loanProduct,
      collectionMode: formData.collectionMode,
      amount: Number(formData.amount) || 0,
      processingFee: Number(formData.processingFee) || 0,
      interestRate: Number(formData.interestRate) || 0,
      tenure: Number(formData.tenure) || 0,
      netDisbursed: calcs.netDisbursed,
      emiAmount: calcs.emiAmount,
      totalRecoverable: calcs.totalRecoverable,
    });
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/50 flex items-center justify-center p-4">
      <Card className="w-full max-w-3xl max-h-[90vh] flex flex-col">
        <div className="flex items-center justify-between p-6 border-b border-slate-100">
          <h2 className="text-xl font-bold text-slate-900">Create New Loan</h2>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600">
            <X size={20} />
          </button>
        </div>
        
        <div className="p-6 overflow-y-auto">
          <form id="add-loan-form" onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              
              {/* Left Column: Inputs */}
              <div className="space-y-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium text-slate-700">Select Borrower</label>
                  <select 
                    required
                    className="flex h-10 w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-600"
                    value={formData.customerId}
                    onChange={e => setFormData({...formData, customerId: e.target.value})}
                  >
                    <option value="" disabled>Select a borrower</option>
                    {customers.map(c => (
                      <option key={c.id} value={c.id}>{c.name} ({c.id})</option>
                    ))}
                  </select>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium text-slate-700">Loan Product</label>
                  <select 
                    required
                    className="flex h-10 w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-600"
                    value={formData.loanProduct}
                    onChange={e => {
                      const p = e.target.value as LoanProduct;
                      const mode = p === 'Daily Finance' ? 'Daily' : p === 'Weekly Finance' ? 'Weekly' : p === 'Yearly Finance' ? 'Yearly' : 'Monthly';
                      setFormData({...formData, loanProduct: p, collectionMode: mode});
                    }}
                  >
                    <option value="Daily Finance">Daily Finance</option>
                    <option value="Weekly Finance">Weekly Finance</option>
                    <option value="Monthly Finance">Monthly Finance</option>
                    <option value="Yearly Finance">Yearly Finance</option>
                  </select>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium text-slate-700">Collection Mode</label>
                  <select 
                    required
                    className="flex h-10 w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-600"
                    value={formData.collectionMode}
                    onChange={e => setFormData({...formData, collectionMode: e.target.value as CollectionMode})}
                  >
                    <option value="Daily">Daily</option>
                    <option value="Weekly">Weekly</option>
                    <option value="Monthly">Monthly</option>
                    <option value="Yearly">Yearly</option>
                  </select>
                </div>
                
                <div className="space-y-2">
                  <label className="text-sm font-medium text-slate-700">Principal Amount (₹)</label>
                  <Input required type="number" value={formData.amount} onChange={e => setFormData({...formData, amount: e.target.value})} placeholder="e.g. 100000" />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-slate-700">Interest Rate (%)</label>
                    <select 
                      className="flex h-10 w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-600"
                      value={formData.interestRate}
                      onChange={e => setFormData({...formData, interestRate: e.target.value})}
                    >
                      {[0, 1, 2, 3, 4, 5, 6, 8, 10].map(r => (
                        <option key={r} value={r}>{r}%</option>
                      ))}
                    </select>
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-slate-700">Tenure ({formData.collectionMode}s)</label>
                    <Input required type="number" value={formData.tenure} onChange={e => setFormData({...formData, tenure: e.target.value})} placeholder="e.g. 12" />
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium text-slate-700">Processing Fee / Deduction (₹)</label>
                  <Input type="number" value={formData.processingFee} onChange={e => setFormData({...formData, processingFee: e.target.value})} placeholder="e.g. 1000" />
                </div>
              </div>

              {/* Right Column: Auto Calculations */}
              <div className="bg-slate-50 p-6 rounded-xl border border-slate-200 flex flex-col justify-center space-y-6">
                <div>
                  <h3 className="text-sm font-bold text-slate-500 uppercase tracking-wider mb-4">Calculation Summary</h3>
                  
                  <div className="space-y-3">
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-slate-600">Principal Amount</span>
                      <span className="font-medium">₹{Number(formData.amount || 0).toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between items-center text-red-500">
                      <span className="text-sm">Less Processing Fee</span>
                      <span className="font-medium">-₹{Number(formData.processingFee || 0).toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between items-center border-t border-slate-200 pt-2">
                      <span className="text-sm font-bold text-slate-900">Net Amount Disbursed</span>
                      <span className="font-bold text-emerald-600 text-lg">₹{calcs.netDisbursed.toLocaleString()}</span>
                    </div>
                  </div>
                </div>

                <div className="border-t border-slate-200 pt-4 space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-slate-600">Collection / EMI Amount</span>
                    <span className="font-bold text-blue-600">₹{calcs.emiAmount.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-slate-600">Total Recoverable</span>
                    <span className="font-bold text-slate-900">₹{calcs.totalRecoverable.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-slate-600">Expected Finance Income</span>
                    <span className="font-bold text-slate-900">₹{calcs.financeIncome.toLocaleString()}</span>
                  </div>
                </div>

              </div>

            </div>
          </form>
        </div>
        
        <div className="p-6 border-t border-slate-100 flex justify-end gap-3 bg-slate-50 mt-auto">
          <Button type="button" variant="outline" onClick={onClose}>Cancel</Button>
          <Button type="submit" form="add-loan-form">Create Loan</Button>
        </div>
      </Card>
    </div>
  );
}
