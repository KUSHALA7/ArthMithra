/**
 * whatIfCalculator.js — Real-time financial simulation engine
 */

/**
 * Calculate what-if scenarios based on user inputs
 */
export function calculateWhatIf(profile, scenarios) {
  const {
    monthlyIncome = profile.income / 12,
    monthlyExpense = profile.totalExpenses,
    savingsPercentage = 30,
    sipAmount = profile.sip || 5000,
    investmentReturn = 12, // 12% annual
    fireAge = profile.fireAge || 60,
    currentAge = profile.age,
    emergencyFundMonths = 6
  } = scenarios;

  const results = {};

  // 1. Monthly surplus
  const monthlySurplus = monthlyIncome - monthlyExpense;
  const monthlyInvestment = Math.min(sipAmount, monthlySurplus);
  results.monthlySurplus = monthlySurplus;
  results.monthlyInvestment = monthlyInvestment;

  // 2. Annual figures
  const annualIncome = monthlyIncome * 12;
  const annualExpense = monthlyExpense * 12;
  const annualInvestment = monthlyInvestment * 12;
  results.annualIncome = annualIncome;
  results.annualExpense = annualExpense;
  results.annualInvestment = annualInvestment;

  // 3. Emergency fund target
  const emergencyFundNeeded = monthlyExpense * emergencyFundMonths;
  const monthsToEmergencyFund = emergencyFundNeeded / Math.max(1, monthlyInvestment);
  results.emergencyFundNeeded = emergencyFundNeeded;
  results.monthsToEmergencyFund = Math.ceil(monthsToEmergencyFund);

  // 4. FIRE corpus needed (25x annual expense = 4% withdrawal)
  const fireCorpusNeeded = annualExpense * 25;
  results.fireCorpusNeeded = fireCorpusNeeded;

  // 5. SIP projection (compound interest)
  const monthlyReturn = investmentReturn / 12 / 100;
  let sipValue = profile.mf + profile.stocks; // Starting value
  const yearsToFire = fireAge - currentAge;
  const monthsToFire = yearsToFire * 12;

  // Calculate month by month
  const monthlyData = [];
  for (let month = 0; month <= monthsToFire && month <= 300; month++) { // 25 years max
    sipValue = sipValue * (1 + monthlyReturn) + monthlyInvestment;
    if (month % 12 === 0) {
      monthlyData.push({
        month: month,
        year: Math.floor(month / 12),
        value: Math.round(sipValue),
        age: currentAge + Math.floor(month / 12)
      });
    }
  }
  results.sipProjection = monthlyData;
  results.projectedFireCorpus = Math.round(sipValue);

  // 6. FIRE timeline
  let fireMonths = 0;
  let fireCorpusValue = profile.mf + profile.stocks;
  while (fireCorpusValue < fireCorpusNeeded && fireMonths < 600) {
    fireCorpusValue = fireCorpusValue * (1 + monthlyReturn) + monthlyInvestment;
    fireMonths++;
  }
  const fireYears = Math.round(fireMonths / 12 * 10) / 10;
  const fireAgeActual = currentAge + fireYears;
  results.yearsToFire = fireYears;
  results.fireAgeActual = Math.round(fireAgeActual);
  results.achievesFire = fireAgeActual <= fireAge;

  // 7. Net worth projection (12 months)
  const netWorthProjection = [];
  let projectedNetWorth = profile.netWorth;
  for (let month = 1; month <= 12; month++) {
    projectedNetWorth += monthlySurplus;
    netWorthProjection.push({
      month: month,
      value: Math.round(projectedNetWorth)
    });
  }
  results.netWorthProjection = netWorthProjection;

  // 8. Expense impact
  const savingsRate = monthlySurplus / monthlyIncome * 100;
  results.savingsRate = Math.round(savingsRate * 10) / 10;

  // 9. Tax implications (rough)
  const taxableIncome = annualIncome;
  const taxAfterDeductions = Math.max(0, (taxableIncome - 75000) * 0.2); // Simple estimate
  results.estimatedTax = Math.round(taxAfterDeductions);
  results.takeHome = annualIncome - results.estimatedTax;

  return results;
}

/**
 * Generate comparison between current and what-if scenario
 */
export function compareScenarios(current, whatIf) {
  return {
    surplusDiff: whatIf.monthlySurplus - current.monthlySurplus,
    investmentDiff: whatIf.monthlyInvestment - current.monthlyInvestment,
    yearsToFireDiff: current.yearsToFire - whatIf.yearsToFire,
    fireAgeDiff: current.fireAgeActual - whatIf.fireAgeActual,
    fireCorpusDiff: whatIf.projectedFireCorpus - current.projectedFireCorpus,
    savingsRateDiff: whatIf.savingsRate - current.savingsRate
  };
}

/**
 * Get actionable insights from what-if scenario
 */
export function getWhatIfInsights(current, whatIf, diff) {
  const insights = [];

  if (diff.yearsToFireDiff > 0.5) {
    insights.push({
      type: 'positive',
      icon: '🎉',
      text: `You can retire ${Math.round(diff.yearsToFireDiff * 10) / 10} years EARLIER! Age ${whatIf.fireAgeActual} instead of ${current.fireAgeActual}`
    });
  } else if (diff.yearsToFireDiff < -0.5) {
    insights.push({
      type: 'warning',
      icon: '⏰',
      text: `FIRE will take ${Math.round(Math.abs(diff.yearsToFireDiff) * 10) / 10} years longer. Plan accordingly.`
    });
  }

  if (diff.surplusDiff > 10000) {
    insights.push({
      type: 'positive',
      icon: '💰',
      text: `Extra ₹${Math.round(diff.surplusDiff).toLocaleString('en-IN')} monthly surplus = ₹${Math.round(diff.fireCorpusDiff / 100000)}L more wealth`
    });
  } else if (diff.surplusDiff < -10000) {
    insights.push({
      type: 'warning',
      icon: '⚠️',
      text: `Lower surplus of ₹${Math.round(Math.abs(diff.surplusDiff)).toLocaleString('en-IN')}/month = slower wealth growth`
    });
  }

  if (whatIf.savingsRate > 50) {
    insights.push({
      type: 'excellent',
      icon: '🌟',
      text: `Exceptional savings rate of ${whatIf.savingsRate}%! You're on the fast-track to FIRE.`
    });
  } else if (whatIf.savingsRate < 10) {
    insights.push({
      type: 'critical',
      icon: '🚨',
      text: `Very low savings rate (${whatIf.savingsRate}%). Need to increase income or reduce expenses.`
    });
  }

  if (diff.investmentDiff > 5000) {
    insights.push({
      type: 'positive',
      icon: '📈',
      text: `Additional ₹${Math.round(diff.investmentDiff).toLocaleString('en-IN')} monthly investment boosts FIRE wealth by ₹${Math.round(diff.fireCorpusDiff / 100000)}L`
    });
  }

  return insights;
}
