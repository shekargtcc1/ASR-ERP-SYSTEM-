import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { Customer, Loan, Collection, User, LoanProduct, CollectionMode } from './types';
import { calculateAdvancedInterest } from './lib/loanCalculator';

interface AppState {
  customers: Customer[];
  loans: Loan[];
  collections: Collection[];
  currentUser: User | null;
}

interface AppContextType extends AppState {
  addCustomer: (c: Omit<Customer, 'id' | 'createdAt'>) => void;
  addLoan: (l: Omit<Loan, 'id' | 'loanNumber' | 'status' | 'disbursementDate' | 'outstandingPrincipal' | 'totalInterestCollected'>) => void;
  addCollection: (c: Omit<Collection, 'id' | 'receiptNumber'>) => void;
}

const defaultState: AppState = {
  customers: [
    { id: 'CUST-001', name: 'Rajesh Kumar', aadhaar: '123456789012', pan: 'ABCDE1234F', mobile: '9876543210', occupation: 'Merchant', address: 'Hyderabad, TS', status: 'Active', createdAt: new Date().toISOString() },
    { id: 'CUST-002', name: 'Srinivas Reddy', aadhaar: '987654321098', pan: 'VWXYZ5678G', mobile: '9123456789', occupation: 'Farmer', address: 'Warangal, TS', status: 'Active', createdAt: new Date().toISOString() }
  ],
  loans: [
    { 
      id: 'L-001', 
      loanNumber: 'LN-54321', 
      customerId: 'CUST-001', 
      loanProduct: 'Monthly Finance', 
      collectionMode: 'Monthly',
      amount: 100000,
      processingFee: 0,
      netDisbursed: 100000,
      interestRate: 2, 
      tenure: 12, 
      emiAmount: 2000,
      totalRecoverable: 124000,
      status: 'Running', 
      disbursementDate: '2026-07-26T00:00:00.000Z', 
      outstandingPrincipal: 100000,
      totalInterestCollected: 0
    }
  ],
  collections: [
    { 
      id: 'COL-001', 
      receiptNumber: 'RCPT-123456', 
      loanId: 'L-001', 
      agentId: 'sys-agent',
      date: '2026-08-26T00:00:00.000Z',
      elapsedDays: 31,
      elapsedMonths: 1,
      extraDays: 0,
      amountReceived: 2000,
      principalCollected: 0,
      interestCollected: 2000,
      paymentMode: 'Cash', 
      location: { lat: 17.385, lng: 78.486 } 
    }
  ],
  currentUser: {
    id: 'u1',
    name: 'Admin User',
    role: 'Super Admin',
    email: 'admin@finance.local',
    branchId: 'b1',
  },
};

const AppContext = createContext<AppContextType | undefined>(undefined);

export function AppProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<AppState>(() => {
    const saved = localStorage.getItem('finance_erp_state');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        return defaultState;
      }
    }
    return defaultState;
  });

  useEffect(() => {
    localStorage.setItem('finance_erp_state', JSON.stringify(state));
  }, [state]);

  const addCustomer = (customerData: Omit<Customer, 'id' | 'createdAt'>) => {
    const newCustomer: Customer = {
      ...customerData,
      id: `CUST-${Date.now()}`,
      createdAt: new Date().toISOString(),
    };
    setState(prev => ({ ...prev, customers: [...prev.customers, newCustomer] }));
  };

  const addLoan = (loanData: Omit<Loan, 'id' | 'loanNumber' | 'status' | 'disbursementDate' | 'outstandingPrincipal' | 'totalInterestCollected'>) => {
    const newLoan: Loan = {
      ...loanData,
      id: `L-${Date.now()}`,
      loanNumber: `LN-${Math.floor(10000 + Math.random() * 90000)}`,
      status: 'Running',
      disbursementDate: new Date().toISOString(),
      outstandingPrincipal: loanData.amount,
      totalInterestCollected: 0,
    };
    setState(prev => ({ ...prev, loans: [...prev.loans, newLoan] }));
  };

  const addCollection = (collectionData: Omit<Collection, 'id' | 'receiptNumber'>) => {
    const newCollection: Collection = {
      ...collectionData,
      id: `COL-${Date.now()}`,
      receiptNumber: `RCPT-${Math.floor(100000 + Math.random() * 900000)}`,
    };
    
    setState(prev => {
      const updatedLoans = prev.loans.map(loan => {
        if (loan.id === newCollection.loanId) {
          return {
            ...loan,
            outstandingPrincipal: Math.max(0, loan.outstandingPrincipal - newCollection.principalCollected),
            totalInterestCollected: loan.totalInterestCollected + newCollection.interestCollected
          };
        }
        return loan;
      });
      return {
        ...prev,
        collections: [...prev.collections, newCollection],
        loans: updatedLoans
      };
    });
  };

  return (
    <AppContext.Provider value={{ ...state, addCustomer, addLoan, addCollection }}>
      {children}
    </AppContext.Provider>
  );
}

export function useAppStore() {
  const context = useContext(AppContext);
  if (context === undefined) {
    throw new Error('useAppStore must be used within an AppProvider');
  }
  return context;
}

