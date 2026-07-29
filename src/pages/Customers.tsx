import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/Card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../components/ui/Table';
import { Badge } from '../components/ui/Badge';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { useAppStore } from '../store';
import { Plus, Search, MoreVertical, X } from 'lucide-react';

export function Customers() {
  const { customers, addCustomer } = useAppStore();
  const [searchTerm, setSearchTerm] = useState('');
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);

  const filteredCustomers = customers.filter(c => 
    c.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    c.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
    c.mobile.includes(searchTerm)
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Customers</h1>
          <p className="text-sm text-slate-500">Manage customer profiles and KYC details</p>
        </div>
        <Button onClick={() => setIsAddModalOpen(true)}>
          <Plus size={18} className="mr-2" />
          Add Customer
        </Button>
      </div>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between sm:px-6">
          <CardTitle>Customer Directory</CardTitle>
          <div className="relative w-64">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
            <Input 
              placeholder="Search by name, ID, phone..." 
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
                <TableHead>Customer ID</TableHead>
                <TableHead>Name</TableHead>
                <TableHead>Contact</TableHead>
                <TableHead>Aadhaar</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredCustomers.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} className="text-center py-8 text-slate-500">
                    No customers found.
                  </TableCell>
                </TableRow>
              ) : (
                filteredCustomers.map(customer => (
                  <TableRow key={customer.id}>
                    <TableCell className="font-medium text-slate-900">{customer.id}</TableCell>
                    <TableCell>
                      <div>
                        <div className="font-medium text-slate-900">{customer.name}</div>
                        <div className="text-xs text-slate-500">{customer.occupation}</div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div>
                        <div className="text-slate-900">{customer.mobile}</div>
                        <div className="text-xs text-slate-500 truncate max-w-[150px]">{customer.address}</div>
                      </div>
                    </TableCell>
                    <TableCell className="text-slate-600">{customer.aadhaar}</TableCell>
                    <TableCell>
                      <Badge variant={customer.status === 'Active' ? 'success' : 'secondary'}>
                        {customer.status}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <Button variant="ghost" size="icon">
                        <MoreVertical size={16} />
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
        <AddCustomerModal 
          onClose={() => setIsAddModalOpen(false)} 
          onAdd={(data) => {
            addCustomer(data);
            setIsAddModalOpen(false);
          }} 
        />
      )}
    </div>
  );
}

function AddCustomerModal({ onClose, onAdd }: { onClose: () => void, onAdd: (data: any) => void }) {
  const [formData, setFormData] = useState({
    name: '',
    mobile: '',
    aadhaar: '',
    pan: '',
    occupation: '',
    address: '',
    status: 'Active' as const
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onAdd(formData);
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/50 flex items-center justify-center p-4">
      <Card className="w-full max-w-2xl max-h-[90vh] flex flex-col">
        <div className="flex items-center justify-between p-6 border-b border-slate-100">
          <h2 className="text-xl font-bold text-slate-900">Add New Customer</h2>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600">
            <X size={20} />
          </button>
        </div>
        
        <div className="p-6 overflow-y-auto">
          <form id="add-customer-form" onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="text-sm font-medium text-slate-700">Full Name</label>
                <Input required value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} placeholder="e.g. John Doe" />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium text-slate-700">Mobile Number</label>
                <Input required value={formData.mobile} onChange={e => setFormData({...formData, mobile: e.target.value})} placeholder="e.g. +1 234 567 8900" />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium text-slate-700">Aadhaar Number</label>
                <Input required value={formData.aadhaar} onChange={e => setFormData({...formData, aadhaar: e.target.value})} placeholder="12-digit number" />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium text-slate-700">PAN Number</label>
                <Input required value={formData.pan} onChange={e => setFormData({...formData, pan: e.target.value})} placeholder="10-character alphanumeric" />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium text-slate-700">Occupation</label>
                <Input required value={formData.occupation} onChange={e => setFormData({...formData, occupation: e.target.value})} placeholder="e.g. Business Owner" />
              </div>
              <div className="space-y-2 md:col-span-2">
                <label className="text-sm font-medium text-slate-700">Residential Address</label>
                <Input required value={formData.address} onChange={e => setFormData({...formData, address: e.target.value})} placeholder="Full address" />
              </div>
            </div>
          </form>
        </div>
        
        <div className="p-6 border-t border-slate-100 flex justify-end gap-3 bg-slate-50 mt-auto">
          <Button type="button" variant="outline" onClick={onClose}>Cancel</Button>
          <Button type="submit" form="add-customer-form">Save Customer</Button>
        </div>
      </Card>
    </div>
  );
}
