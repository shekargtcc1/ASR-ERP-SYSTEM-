import { differenceInDays, differenceInMonths, differenceInYears, addMonths, getDaysInMonth } from 'date-fns';

export function calculateElapsedPeriod(startDate: Date, endDate: Date) {
  if (isNaN(startDate.getTime()) || isNaN(endDate.getTime()) || startDate > endDate) {
    return {
      years: 0,
      totalMonths: 0,
      totalWeeks: 0,
      totalDays: 0,
      completedMonths: 0,
      extraDays: 0
    };
  }

  const totalDays = differenceInDays(endDate, startDate);
  const totalMonths = differenceInMonths(endDate, startDate);
  const years = differenceInYears(endDate, startDate);
  
  const dateAfterMonths = addMonths(startDate, totalMonths);
  const extraDays = differenceInDays(endDate, dateAfterMonths);
  const totalWeeks = Math.floor(totalDays / 7);
  
  return {
    years,
    totalMonths,
    totalWeeks,
    totalDays,
    completedMonths: totalMonths,
    extraDays,
  };
}

export function calculateAdvancedInterest(
  principal: number, 
  interestRate: number, 
  loanProduct: string,
  startDate: Date, 
  endDate: Date
) {
  const elapsed = calculateElapsedPeriod(startDate, endDate);
  
  if (loanProduct === 'Daily Finance') {
    // Usually daily finance is flat fixed schedule, but if interest calculated on delay:
    return { ...elapsed, monthlyInterest: 0, dailyInterest: 0, extraDayInterest: 0, totalInterest: 0 };
  }

  if (loanProduct === 'Weekly Finance') {
    // Interest per week
    const weeklyInterest = principal * (interestRate / 100);
    const totalInterest = weeklyInterest * elapsed.totalWeeks;
    // Plus extra days if needed, but keeping it simple based on weeks for Weekly
    return { ...elapsed, weeklyInterest, totalInterest };
  }

  // Monthly / Yearly
  const monthlyInterest = principal * (interestRate / 100);
  
  let currentMonthDays = 30; // Fallback
  if (elapsed.totalMonths >= 0) {
    const dateAfterMonths = addMonths(startDate, elapsed.totalMonths);
    currentMonthDays = getDaysInMonth(dateAfterMonths) || 30;
  }
  
  const dailyInterest = currentMonthDays > 0 ? (monthlyInterest / currentMonthDays) : 0;
  const extraDayInterest = dailyInterest * elapsed.extraDays;
  const totalInterest = (monthlyInterest * elapsed.completedMonths) + extraDayInterest;

  return {
    ...elapsed,
    monthlyInterest,
    dailyInterest,
    extraDayInterest,
    totalInterest
  };
}
