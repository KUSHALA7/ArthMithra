/**
 * WhatIf.js — Interactive What-If Simulator
 * Users can adjust variables and see real-time impact on FIRE date, wealth, etc.
 */
import { UserState } from '../state.js';
import { navigateTo } from '../main.js';
import { fmtRupee, fmt } from '../utils.js';
import { calculateWhatIf, compareScenarios, getWhatIfInsights } from '../utils/whatIfCalculator.js';
import { createNetWorthChart, createSIPProjectionChart } from '../utils/charts.js';

export function renderWhatIf(container) {
  if (!UserState.ready) {
    container.innerHTML = `
      <div class="page-hdr">
        <div class="page-title">What-If Simulator</div>
      </div>
      <div style="text-align:center;padding:2rem;">
        <p style="color:var(--ink-60);font-size:13px;">Complete your profile first to use the simulator.</p>
        <button class="btn btn-gold" style="margin-top:1rem;" id="go-profile">Set Up Profile →</button>
      </div>`;
    container.querySelector('#go-profile').addEventListener('click', () => navigateTo('health'));
    return;
  }

  const U = UserState;

  // Ensure valid profile values
  const baseIncome = Math.max(10000, U.income / 12 || 50000);
  const baseExpense = Math.max(5000, U.totalExpenses || 30000);

  // Calculate slider bounds with safety checks
  const incomeMin = Math.max(5000, Math.round(baseIncome * 0.3));
  const incomeMax = Math.round(baseIncome * 3);
  const incomeVal = Math.round(baseIncome);

  const expenseMin = Math.max(2000, Math.round(baseExpense * 0.3));
  const expenseMax = Math.round(baseExpense * 3);
  const expenseVal = Math.round(baseExpense);

  // Ensure min < max and value is in range
  console.log('Income:', { min: incomeMin, val: incomeVal, max: incomeMax });
  console.log('Expense:', { min: expenseMin, val: expenseVal, max: expenseMax });

  const currentResults = calculateWhatIf(U, {
    monthlyIncome: incomeVal,
    monthlyExpense: expenseVal,
    sipAmount: U.sip || 5000,
    fireAge: U.fireAge || 60,
    currentAge: U.age || 30
  });

  container.innerHTML = `
    <div class="page-hdr">
      <div class="page-title">🎯 What-If Simulator</div>
      <div class="page-sub">Adjust variables & see real-time impact on your financial goals</div>
    </div>

    <div class="g2">
      <!-- Left: Input Controls -->
      <div class="card">
        <div class="card-title">⚙️ Adjust Your Scenario</div>

        <!-- Monthly Income Slider -->
        <div style="margin-bottom:1.5rem;">
          <label style="font-size:11px;font-weight:600;text-transform:uppercase;color:var(--ink-60);display:block;margin-bottom:6px;">
            Monthly Income
            <span id="income-val" style="float:right;color:var(--gold);font-weight:700;"> ₹${fmt(incomeVal)}</span>
          </label>
          <input type="range" id="income-slider"
            min="${incomeMin}"
            max="${incomeMax}"
            value="${incomeVal}"
            step="1000"
            style="width:100%;cursor:pointer;"
            oninput="window._updateWhatIf()"/>
          <div style="font-size:11px;color:var(--ink-60);margin-top:4px;display:flex;justify-content:space-between;">
            <span>₹${fmt(incomeMin)}</span>
            <span>₹${fmt(incomeMax)}</span>
          </div>
        </div>

        <!-- Monthly Expense Slider -->
        <div style="margin-bottom:1.5rem;">
          <label style="font-size:11px;font-weight:600;text-transform:uppercase;color:var(--ink-60);display:block;margin-bottom:6px;">
            Monthly Expenses
            <span id="expense-val" style="float:right;color:var(--crimson);font-weight:700;"> ₹${fmt(expenseVal)}</span>
          </label>
          <input type="range" id="expense-slider"
            min="${expenseMin}"
            max="${expenseMax}"
            value="${expenseVal}"
            step="1000"
            style="width:100%;cursor:pointer;"
            oninput="window._updateWhatIf()"/>
          <div style="font-size:11px;color:var(--ink-60);margin-top:4px;display:flex;justify-content:space-between;">
            <span>₹${fmt(expenseMin)}</span>
            <span>₹${fmt(expenseMax)}</span>
          </div>
        </div>

        <!-- SIP Amount Slider -->
        <div style="margin-bottom:1.5rem;">
          <label style="font-size:11px;font-weight:600;text-transform:uppercase;color:var(--ink-60);display:block;margin-bottom:6px;">
            Monthly SIP
            <span id="sip-val" style="float:right;color:var(--emerald-mid);font-weight:700;"> ₹${fmt(U.sip || 5000)}</span>
          </label>
          <input type="range" id="sip-slider"
            min="1000"
            max="100000"
            value="${U.sip || 5000}"
            step="500"
            style="width:100%;cursor:pointer;"
            oninput="window._updateWhatIf()"/>
          <div style="font-size:11px;color:var(--ink-60);margin-top:4px;display:flex;justify-content:space-between;">
            <span>₹1K</span>
            <span>₹100K</span>
          </div>
        </div>

        <!-- Investment Return Slider -->
        <div style="margin-bottom:1.5rem;">
          <label style="font-size:11px;font-weight:600;text-transform:uppercase;color:var(--ink-60);display:block;margin-bottom:6px;">
            Annual Return %
            <span id="return-val" style="float:right;color:var(--blue);font-weight:700;"> 12%</span>
          </label>
          <input type="range" id="return-slider"
            min="5"
            max="20"
            value="12"
            step="0.5"
            style="width:100%;cursor:pointer;"
            oninput="window._updateWhatIf()"/>
          <div style="font-size:11px;color:var(--ink-60);margin-top:4px;display:flex;justify-content:space-between;">
            <span>5%</span>
            <span>20%</span>
          </div>
        </div>

        <!-- FIRE Age Target Slider -->
        <div style="margin-bottom:0;">
          <label style="font-size:11px;font-weight:600;text-transform:uppercase;color:var(--ink-60);display:block;margin-bottom:6px;">
            Target FIRE Age
            <span id="fire-age-val" style="float:right;color:var(--gold);font-weight:700;"> ${U.fireAge}</span>
          </label>
          <input type="range" id="fire-age-slider"
            min="35"
            max="70"
            value="${U.fireAge}"
            style="width:100%;cursor:pointer;"
            oninput="window._updateWhatIf()"/>
          <div style="font-size:11px;color:var(--ink-60);margin-top:4px;display:flex;justify-content:space-between;">
            <span>35 yrs</span>
            <span>70 yrs</span>
          </div>
        </div>
      </div>

      <!-- Right: Results & Insights -->
      <div>
        <div class="card" style="margin-bottom:1rem;">
          <div class="card-title">📊 Current vs What-If</div>
          <div id="comparison-results"></div>
        </div>

        <div class="card">
          <div class="card-title">💡 Key Insights</div>
          <div id="insights-container"></div>
        </div>
      </div>
    </div>

    <!-- Charts Section -->
    <div class="g2" style="margin-top:1rem;">
      <div class="card">
        <div class="card-title">📈 Net Worth Projection (What-If)</div>
        <div style="position:relative;height:300px;">
          <canvas id="whatif-networth-chart"></canvas>
        </div>
      </div>

      <div class="card">
        <div class="card-title">💰 SIP Growth (What-If)</div>
        <div style="position:relative;height:300px;">
          <canvas id="whatif-sip-chart"></canvas>
        </div>
      </div>
    </div>
  `;

  // Store current results for comparison
  window._currentResults = currentResults;
  window._chartInstances = { networth: null, sip: null }; // Store chart instances
  window._updateWhatIf = () => updateWhatIf(U);

  // Setup event listeners for all sliders
  setTimeout(() => {
    const incomeSlider = document.getElementById('income-slider');
    const expenseSlider = document.getElementById('expense-slider');
    const sipSlider = document.getElementById('sip-slider');
    const returnSlider = document.getElementById('return-slider');
    const fireAgeSlider = document.getElementById('fire-age-slider');

    if (incomeSlider) {
      incomeSlider.addEventListener('input', window._updateWhatIf);
      incomeSlider.addEventListener('change', window._updateWhatIf);
    }
    if (expenseSlider) {
      expenseSlider.addEventListener('input', window._updateWhatIf);
      expenseSlider.addEventListener('change', window._updateWhatIf);
    }
    if (sipSlider) {
      sipSlider.addEventListener('input', window._updateWhatIf);
      sipSlider.addEventListener('change', window._updateWhatIf);
    }
    if (returnSlider) {
      returnSlider.addEventListener('input', window._updateWhatIf);
      returnSlider.addEventListener('change', window._updateWhatIf);
    }
    if (fireAgeSlider) {
      fireAgeSlider.addEventListener('input', window._updateWhatIf);
      fireAgeSlider.addEventListener('change', window._updateWhatIf);
    }

    console.log('✅ All sliders initialized');
  }, 50);

  // Initial render
  console.log('🚀 Initial chart render starting...');
  updateWhatIf(U);
}

async function updateWhatIf(profile) {
  // Get slider values with proper integer parsing
  const incomeSlider = document.getElementById('income-slider');
  const expenseSlider = document.getElementById('expense-slider');
  const sipSlider = document.getElementById('sip-slider');
  const returnSlider = document.getElementById('return-slider');
  const fireAgeSlider = document.getElementById('fire-age-slider');

  const income = incomeSlider ? Math.round(parseFloat(incomeSlider.value)) : Math.round(profile.income / 12);
  const expense = expenseSlider ? Math.round(parseFloat(expenseSlider.value)) : Math.round(profile.totalExpenses);
  const sip = sipSlider ? Math.round(parseFloat(sipSlider.value)) : 5000;
  const returnRate = returnSlider ? parseFloat(returnSlider.value) : 12;
  const fireAge = fireAgeSlider ? Math.round(parseFloat(fireAgeSlider.value)) : profile.fireAge;

  // Update display values
  const incomeValEl = document.getElementById('income-val');
  const expenseValEl = document.getElementById('expense-val');
  const sipValEl = document.getElementById('sip-val');
  const returnValEl = document.getElementById('return-val');
  const fireAgeValEl = document.getElementById('fire-age-val');

  if (incomeValEl) incomeValEl.textContent = `₹${fmt(income)}`;
  if (expenseValEl) expenseValEl.textContent = `₹${fmt(expense)}`;
  if (sipValEl) sipValEl.textContent = `₹${fmt(sip)}`;
  if (returnValEl) returnValEl.textContent = `${returnRate.toFixed(1)}%`;
  if (fireAgeValEl) fireAgeValEl.textContent = `${fireAge}`;

  // Calculate what-if scenario
  const whatIfResults = calculateWhatIf(profile, {
    monthlyIncome: income,
    monthlyExpense: expense,
    sipAmount: sip,
    investmentReturn: returnRate,
    fireAge: fireAge,
    currentAge: profile.age
  });

  // Compare with current
  const comparison = compareScenarios(window._currentResults, whatIfResults);
  const insights = getWhatIfInsights(window._currentResults, whatIfResults, comparison);

  // Render comparison
  renderComparison(whatIfResults, comparison);

  // Render insights
  renderInsights(insights);

  // Update charts
  try {
    console.log('📊 Starting chart update...');

    // Destroy old charts if they exist
    if (window._chartInstances) {
      if (window._chartInstances.networth) {
        console.log('Destroying old networth chart...');
        window._chartInstances.networth.destroy();
      }
      if (window._chartInstances.sip) {
        console.log('Destroying old SIP chart...');
        window._chartInstances.sip.destroy();
      }
    }

    // Recreate canvas elements for fresh charts
    const networthContainer = document.querySelector('[id*="whatif-networth"]')?.parentElement;
    const sipContainer = document.querySelector('[id*="whatif-sip"]')?.parentElement;

    console.log('Containers found:', { netloss: !!networthContainer, sip: !!sipContainer });

    if (networthContainer) {
      networthContainer.innerHTML = '<canvas id="whatif-networth-chart"></canvas>';
      const networthCanvas = document.getElementById('whatif-networth-chart');
      console.log('Networth canvas:', !!networthCanvas);

      if (networthCanvas) {
        console.log('Creating networth chart with surplus:', income - expense);
        const chart = await createNetWorthChart(networthCanvas, {
          ...profile,
          netWorth: profile.netWorth,
          surplus: income - expense
        });
        console.log('Networth chart created:', !!chart);
        window._chartInstances.networth = chart;
      }
    }

    if (sipContainer) {
      sipContainer.innerHTML = '<canvas id="whatif-sip-chart"></canvas>';
      const sipCanvas = document.getElementById('whatif-sip-chart');
      console.log('SIP canvas:', !!sipCanvas);

      if (sipCanvas) {
        console.log('Creating SIP chart with SIP:', sip);
        const chart = await createSIPProjectionChart(sipCanvas, {
          ...profile,
          sip: sip
        });
        console.log('SIP chart created:', !!chart);
        window._chartInstances.sip = chart;
      }
    }

    console.log('✅ Charts updated successfully');
  } catch (err) {
    console.error('❌ Chart update error:', err);
    console.error('Stack:', err.stack);
  }
}

function renderComparison(whatIfResults, diff) {
  const container = document.getElementById('comparison-results');
  if (!container) return;

  const icon = diff.yearsToFireDiff > 0 ? '📉' : '📈';
  const color = diff.yearsToFireDiff > 0 ? 'var(--emerald-mid)' : 'var(--crimson)';

  const html = `
    <div style="padding:12px;background:rgba(0,0,0,0.02);border-radius:8px;margin-bottom:12px;animation:slideInRight 0.4s ease 0.1s both;">
      <div style="font-size:11px;color:var(--ink-60);margin-bottom:2px;">Monthly Surplus</div>
      <div style="font-size:18px;font-weight:700;color:var(--ink);">₹${fmt(whatIfResults.monthlySurplus)}</div>
      <div style="font-size:11px;color:var(--ink-60);margin-top:4px;">Savings Rate: ${whatIfResults.savingsRate}%</div>
    </div>

    <div style="padding:12px;background:rgba(0,0,0,0.02);border-radius:8px;margin-bottom:12px;animation:slideInRight 0.4s ease 0.2s both;">
      <div style="font-size:11px;color:var(--ink-60);margin-bottom:2px;">FIRE Timeline</div>
      <div style="font-size:18px;font-weight:700;color:${color};">${icon} ${whatIfResults.yearsToFire} years</div>
      <div style="font-size:11px;color:var(--ink-60);margin-top:4px;">Retire at age ${whatIfResults.fireAgeActual}</div>
    </div>

    <div style="padding:12px;background:rgba(0,0,0,0.02);border-radius:8px;animation:slideInRight 0.4s ease 0.3s both;">
      <div style="font-size:11px;color:var(--ink-60);margin-bottom:2px;">Projected FIRE Corpus</div>
      <div style="font-size:18px;font-weight:700;color:var(--gold);">₹${fmt(whatIfResults.projectedFireCorpus / 100000)}L</div>
      <div style="font-size:11px;color:var(--ink-60);margin-top:4px;">Needed: ₹${fmt(whatIfResults.fireCorpusNeeded / 100000)}L</div>
    </div>
  `;

  container.innerHTML = html;
}

function renderInsights(insights) {
  const container = document.getElementById('insights-container');
  if (!container) return;

  if (!insights || insights.length === 0) {
    container.innerHTML = '<div style="color:var(--ink-60);font-size:12px;">Adjust sliders to see insights...</div>';
    return;
  }

  const html = insights.map(insight => `
    <div style="padding:10px;border-left:3px solid ${
      insight.type === 'positive' ? 'var(--emerald-mid)' :
      insight.type === 'excellent' ? 'var(--gold)' :
      insight.type === 'warning' ? 'var(--crimson)' :
      'var(--gold)'
    };background:rgba(0,0,0,0.02);border-radius:4px;margin-bottom:8px;font-size:12px;">
      <div style="margin-bottom:2px;font-weight:500;">${insight.icon} ${insight.text}</div>
    </div>
  `).join('');

  container.innerHTML = html;
}
