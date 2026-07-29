import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/Card';
import { Input } from '../components/ui/Input';
import { Button } from '../components/ui/Button';
import { Badge } from '../components/ui/Badge';
import { differenceInDays, differenceInMonths, differenceInYears, addMonths, getDaysInMonth } from 'date-fns';

export function Calculators() {
  const [activeTab, setActiveTab] = useState<'advanced' | 'daily'>('advanced');

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Finance Calculators</h1>
        <p className="text-sm text-slate-500">Calculate advanced interest and daily finance plans</p>
      </div>

      <div className="flex space-x-2 border-b border-slate-200 pb-px">
        <button
          className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors ${
            activeTab === 'advanced' ? 'border-blue-600 text-blue-600' : 'border-transparent text-slate-500 hover:text-slate-700'
          }`}
          onClick={() => setActiveTab('advanced')}
        >
          Advanced Interest Calculator
        </button>
        <button
          className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors ${
            activeTab === 'daily' ? 'border-blue-600 text-blue-600' : 'border-transparent text-slate-500 hover:text-slate-700'
          }`}
          onClick={() => setActiveTab('daily')}
        >
          Daily Finance (100-Day)
        </button>
      </div>

      {activeTab === 'advanced' && <AdvancedInterestCalculator />}
      {activeTab === 'daily' && <DailyFinanceCalculator />}
    </div>
  );
}

function AdvancedInterestCalculator() {
  const [principal, setPrincipal] = useState(100000);
  const [rate, setRate] = useState(2);
  const [startDate, setStartDate] = useState('2026-07-26');
  const [endDate, setEndDate] = useState('2026-08-31');
  const [interestType, setInterestType] = useState('Monthly'); // Daily, Monthly, Yearly

  const calculate = () => {
    const start = new Date(startDate);
    const end = new Date(endDate);
    
    if (isNaN(start.getTime()) || isNaN(end.getTime()) || start > end) return null;

    const totalDays = differenceInDays(end, start);
    
    if (interestType === 'Daily') {
      const dailyInterest = principal * (rate / 100);
      const totalInterest = dailyInterest * totalDays;
      return {
        type: 'Daily',
        dailyInterest,
        totalInterest,
        totalDays,
        settlement: principal + totalInterest
      };
    }

    if (interestType === 'Yearly') {
      const years = totalDays / 365;
      const yearlyInterest = principal * (rate / 100);
      const totalInterest = yearlyInterest * years;
      return {
        type: 'Yearly',
        yearlyInterest,
        totalInterest,
        years: years.toFixed(2),
        settlement: principal + totalInterest
      };
    }

    // Advanced Monthly Logic
    const years = differenceInYears(end, start);
    const totalMonths = differenceInMonths(end, start);
    
    const dateAfterMonths = addMonths(start, totalMonths);
    const extraDays = differenceInDays(end, dateAfterMonths);
    
    const totalWeeks = Math.floor(totalDays / 7);
    
    const monthlyInterest = principal * (rate / 100);
    
    const currentMonthDays = getDaysInMonth(dateAfterMonths);
    const dailyInterest = monthlyInterest / currentMonthDays;
    
    const extraDayInterest = dailyInterest * extraDays;
    const totalInterest = (monthlyInterest * totalMonths) + extraDayInterest;

    return {
      type: 'Monthly',
      years,
      totalMonths,
      totalWeeks,
      totalDays,
      completedMonths: totalMonths,
      extraDays,
      monthlyInterest,
      dailyInterest,
      extraDayInterest,
      totalInterest,
      settlementAmount: principal + totalInterest
    };
  };

  const res = calculate();

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      <Card className="lg:col-span-1">
        <CardHeader>
          <CardTitle>Configuration</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <label className="text-sm font-medium text-slate-700">Principal Amount (₹)</label>
            <Input type="number" value={principal} onChange={e => setPrincipal(Number(e.target.value))} />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium text-slate-700">Interest Rate (%)</label>
            <div className="flex gap-2 mb-2 flex-wrap">
              {[1, 2, 3, 4, 5, 6, 8, 10].map(r => (
                <Badge 
                  key={r} 
                  variant={rate === r ? 'default' : 'outline'}
                  className="cursor-pointer"
                  onClick={() => setRate(r)}
                >
                  {r}%
                </Badge>
              ))}
            </div>
            <Input type="number" step="0.1" value={rate} onChange={e => setRate(Number(e.target.value))} />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium text-slate-700">Interest Type</label>
            <select 
              className="flex h-10 w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-600"
              value={interestType}
              onChange={e => setInterestType(e.target.value)}
            >
              <option value="Daily">Daily</option>
              <option value="Monthly">Monthly</option>
              <option value="Yearly">Yearly</option>
            </select>
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium text-slate-700">Loan Start Date</label>
            <Input type="date" value={startDate} onChange={e => setStartDate(e.target.value)} />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium text-slate-700">Receipt / End Date</label>
            <Input type="date" value={endDate} onChange={e => setEndDate(e.target.value)} />
          </div>
        </CardContent>
      </Card>

      <Card className="lg:col-span-2">
        <CardHeader>
          <CardTitle>Calculation Results</CardTitle>
        </CardHeader>
        <CardContent>
          {!res ? (
            <p className="text-slate-500">Please enter valid dates (Start Date must be before End Date).</p>
          ) : res.type === 'Monthly' ? (
            <div className="space-y-6">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 bg-slate-50 p-4 rounded-lg border border-slate-100">
                <div>
                  <p className="text-xs text-slate-500">Total Years</p>
                  <p className="text-lg font-semibold text-slate-900">{res.years}</p>
                </div>
                <div>
                  <p className="text-xs text-slate-500">Total Months</p>
                  <p className="text-lg font-semibold text-slate-900">{res.totalMonths}</p>
                </div>
                <div>
                  <p className="text-xs text-slate-500">Total Weeks</p>
                  <p className="text-lg font-semibold text-slate-900">{res.totalWeeks}</p>
                </div>
                <div>
                  <p className="text-xs text-slate-500">Total Days</p>
                  <p className="text-lg font-semibold text-slate-900">{res.totalDays}</p>
                </div>
              </div>

              <div className="space-y-4">
                <h4 className="text-sm font-bold text-slate-900 uppercase tracking-wider">Elapsed Period Details</h4>
                <div className="grid grid-cols-2 gap-y-2 text-sm border-b border-slate-100 pb-4">
                  <div className="text-slate-600">Completed Months:</div>
                  <div className="font-medium text-right text-slate-900">{res.completedMonths}</div>
                  <div className="text-slate-600">Extra Days:</div>
                  <div className="font-medium text-right text-slate-900">{res.extraDays}</div>
                </div>

                <h4 className="text-sm font-bold text-slate-900 uppercase tracking-wider">Interest Breakdown</h4>
                <div className="grid grid-cols-2 gap-y-2 text-sm border-b border-slate-100 pb-4">
                  <div className="text-slate-600">Monthly Interest:</div>
                  <div className="font-medium text-right text-slate-900">₹{res.monthlyInterest.toFixed(2)}</div>
                  <div className="text-slate-600">Daily Interest (Current Month):</div>
                  <div className="font-medium text-right text-slate-900">₹{res.dailyInterest.toFixed(2)}</div>
                  <div className="text-slate-600">Extra Day Interest:</div>
                  <div className="font-medium text-right text-slate-900">₹{res.extraDayInterest.toFixed(2)}</div>
                  <div className="text-slate-600 text-base font-semibold mt-2">Total Interest:</div>
                  <div className="font-bold text-right text-red-600 text-base mt-2">₹{res.totalInterest.toFixed(2)}</div>
                </div>

                <h4 className="text-sm font-bold text-slate-900 uppercase tracking-wider">Settlement</h4>
                <div className="grid grid-cols-2 gap-y-2 text-base">
                  <div className="text-slate-600">Principal Balance:</div>
                  <div className="font-medium text-right text-slate-900">₹{principal.toLocaleString()}</div>
                  <div className="text-slate-900 font-bold mt-2">Total Payable Amount:</div>
                  <div className="font-bold text-right text-emerald-600 text-xl mt-1">₹{res.settlementAmount.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</div>
                </div>
              </div>
            </div>
          ) : (
            <div className="space-y-4 text-sm">
              <div className="grid grid-cols-2 gap-y-2 border-b border-slate-100 pb-4">
                <div className="text-slate-600">Total Days:</div>
                <div className="font-medium text-right text-slate-900">{res.totalDays}</div>
                {res.type === 'Yearly' && (
                  <>
                    <div className="text-slate-600">Total Years:</div>
                    <div className="font-medium text-right text-slate-900">{res.years}</div>
                    <div className="text-slate-600">Yearly Interest:</div>
                    <div className="font-medium text-right text-slate-900">₹{res.yearlyInterest.toFixed(2)}</div>
                  </>
                )}
                {res.type === 'Daily' && (
                  <>
                    <div className="text-slate-600">Per Day Interest:</div>
                    <div className="font-medium text-right text-slate-900">₹{res.dailyInterest.toFixed(2)}</div>
                  </>
                )}
              </div>
              <div className="grid grid-cols-2 gap-y-2 text-base">
                <div className="text-slate-600">Principal Amount:</div>
                <div className="font-medium text-right text-slate-900">₹{principal.toLocaleString()}</div>
                <div className="text-slate-600">Total Interest:</div>
                <div className="font-medium text-right text-red-600">₹{res.totalInterest.toFixed(2)}</div>
                <div className="text-slate-900 font-bold mt-2">Total Payable Amount:</div>
                <div className="font-bold text-right text-emerald-600 text-xl mt-1">₹{res.settlement.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</div>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

function DailyFinanceCalculator() {
  const [faceValue, setFaceValue] = useState(10000);
  const [upfrontDeduction, setUpfrontDeduction] = useState(1000);
  const [tenureDays, setTenureDays] = useState(100);

  const netDisbursed = faceValue - upfrontDeduction;
  const dailyCollection = faceValue / tenureDays;

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      <Card className="lg:col-span-1">
        <CardHeader>
          <CardTitle>Configuration</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <label className="text-sm font-medium text-slate-700">Loan Amount (Face Value)</label>
            <Input type="number" value={faceValue} onChange={e => setFaceValue(Number(e.target.value))} />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium text-slate-700">Upfront Deduction</label>
            <Input type="number" value={upfrontDeduction} onChange={e => setUpfrontDeduction(Number(e.target.value))} />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium text-slate-700">Tenure (Days)</label>
            <div className="flex gap-2 mb-2 flex-wrap">
              {[50, 100, 120, 150, 200].map(days => (
                <Badge 
                  key={days} 
                  variant={tenureDays === days ? 'default' : 'outline'}
                  className="cursor-pointer"
                  onClick={() => setTenureDays(days)}
                >
                  {days}
                </Badge>
              ))}
            </div>
            <Input type="number" value={tenureDays} onChange={e => setTenureDays(Number(e.target.value))} />
          </div>
        </CardContent>
      </Card>

      <Card className="lg:col-span-2">
        <CardHeader>
          <CardTitle>Daily Finance Profile</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-6">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 bg-slate-50 p-4 rounded-lg border border-slate-100">
               <div>
                <p className="text-xs text-slate-500">Face Value</p>
                <p className="text-lg font-semibold text-slate-900">₹{faceValue.toLocaleString()}</p>
              </div>
              <div>
                <p className="text-xs text-slate-500">Net Cash Given</p>
                <p className="text-lg font-bold text-emerald-600">₹{netDisbursed.toLocaleString()}</p>
              </div>
              <div>
                <p className="text-xs text-slate-500">Daily EMI</p>
                <p className="text-lg font-semibold text-blue-600">₹{dailyCollection.toFixed(2)}</p>
              </div>
              <div>
                <p className="text-xs text-slate-500">Finance Income</p>
                <p className="text-lg font-semibold text-slate-900">₹{upfrontDeduction.toLocaleString()}</p>
              </div>
            </div>

            <div className="space-y-4">
              <h4 className="text-sm font-bold text-slate-900 uppercase tracking-wider">Repayment Schedule Overview</h4>
              <div className="grid grid-cols-2 gap-y-2 text-sm border-b border-slate-100 pb-4">
                <div className="text-slate-600">Total Collection:</div>
                <div className="font-medium text-right text-slate-900">₹{faceValue.toLocaleString()}</div>
                <div className="text-slate-600">Tenure:</div>
                <div className="font-medium text-right text-slate-900">{tenureDays} Days</div>
              </div>
              <p className="text-sm text-slate-500">
                This module creates a {tenureDays}-day schedule. Every daily payment of ₹{dailyCollection.toFixed(2)} reduces the outstanding balance until ₹{faceValue.toLocaleString()} is fully recovered.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
