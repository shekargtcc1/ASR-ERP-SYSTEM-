export type Role = 'Super Admin' | 'Branch Manager' | 'Collection Agent' | 'Accountant';

export interface User {
  id: string;
  name: string;
  role: Role;
  email: string;
  branchId: string;
}

export interface Customer {
  id: string;
  photo?: string;
  aadhaar: string;
  pan: string;
  name: string;
  address: string;
  occupation: string;
  mobile: string;
  status: 'Active' | 'Inactive';
  createdAt: string;
}

export type LoanProduct = 'Daily Finance' | 'Weekly Finance' | 'Monthly Finance' | 'Yearly Finance';
export type CollectionMode = 'Daily' | 'Weekly' | 'Monthly' | 'Yearly';

export interface Loan {
  id: string;
  loanNumber: string;
  customerId: string;
  loanProduct: LoanProduct;
  collectionMode: CollectionMode;
  amount: number; // Principal Amount
  processingFee: number;
  netDisbursed: number;
  interestRate: number; // e.g., 2 for 2%
  tenure: number; // numeric value of days/weeks/months/years based on product
  emiAmount: number; // Installment / Collection Amount
  totalRecoverable: number;
  status: 'Running' | 'Closed' | 'Overdue' | 'Default';
  disbursementDate: string; // Borrower Loan Date
  
  // Tracking
  outstandingPrincipal: number;
  totalInterestCollected: number;
}

export interface Collection {
  id: string;
  receiptNumber: string;
  loanId: string;
  agentId: string;
  date: string; // Receipt Date
  
  // Calculation snapshot
  elapsedDays: number;
  elapsedMonths: number;
  extraDays: number;
  
  // Financials
  amountReceived: number;
  principalCollected: number;
  interestCollected: number;
  
  paymentMode: 'Cash' | 'UPI' | 'Bank' | 'Cheque';
  location?: { lat: number; lng: number };
}

