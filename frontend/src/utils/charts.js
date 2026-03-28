/**
 * charts.js — Chart.js wrapper for financial visualizations
 */

// Load Chart.js from CDN
export function loadChartJS() {
  return new Promise((resolve, reject) => {
    if (window.Chart) {
      resolve();
      return;
    }
    const script = document.createElement('script');
    script.src = 'https://cdn.jsdelivr.net/npm/chart.js@4.4.0/dist/chart.umd.js';
    script.onload = resolve;
    script.onerror = reject;
    document.head.appendChild(script);
  });
}

/**
 * Create a net worth timeline graph
 */
export async function createNetWorthChart(container, profile) {
  console.log('📈 createNetWorthChart called with:', { container: !!container, surplus: profile.surplus });
  await loadChartJS();

  const ctx = container.getContext('2d');
  console.log('Got canvas context:', !!ctx);

  // Generate 12-month projection
  const months = [];
  const netWorthData = [];
  const today = new Date();

  let currentNetWorth = profile.netWorth || 0;
  const monthlyIncrease = profile.surplus || 0;

  for (let i = 0; i < 12; i++) {
    const date = new Date(today.getFullYear(), today.getMonth() + i, 1);
    months.push(date.toLocaleDateString('en-IN', { month: 'short', year: '2-digit' }));
    netWorthData.push(Math.round(currentNetWorth + (monthlyIncrease * i)));
  }

  console.log('Chart data:', { months, netWorthData: netWorthData.slice(0, 3) });

  const chart = new window.Chart(ctx, {
    type: 'line',
    data: {
      labels: months,
      datasets: [{
        label: 'Net Worth Projection',
        data: netWorthData,
        borderColor: '#2E9C6E',
        backgroundColor: 'rgba(46, 156, 110, 0.05)',
        borderWidth: 3,
        fill: true,
        tension: 0.4,
        pointRadius: 4,
        pointBackgroundColor: '#2E9C6E',
        pointBorderColor: '#fff',
        pointBorderWidth: 2,
        pointHoverRadius: 6,
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: true,
      plugins: {
        legend: { display: false },
        tooltip: {
          backgroundColor: 'rgba(13, 17, 23, 0.8)',
          titleColor: 'white',
          bodyColor: 'white',
          callbacks: {
            label: (context) => `₹${(context.value / 100000).toFixed(1)}L`
          }
        }
      },
      scales: {
        y: {
          beginAtZero: true,
          ticks: {
            color: '#999',
            callback: (value) => `₹${(value / 100000).toFixed(0)}L`
          },
          grid: { color: 'rgba(0,0,0,0.05)' }
        },
        x: {
          ticks: { color: '#999' },
          grid: { display: false }
        }
      }
    }
  });

  console.log('Chart instance created and returned:', !!chart);
  return chart;
}

/**
 * Create expense breakdown pie chart
 */
export async function createExpensePieChart(container, profile) {
  await loadChartJS();

  const ctx = container.getContext('2d');

  const expenses = {
    'Rent/Housing': profile.rent || 0,
    'Food': profile.food || 0,
    'Transportation': profile.transport || 0,
    'Insurance': profile.premium || 0,
    'Entertainment': profile.entertainment || 0,
    'Utilities': profile.utilities || 0,
    'Other': Math.max(0, profile.totalExpenses - (profile.rent + profile.food + profile.transport + profile.premium + profile.entertainment + profile.utilities))
  };

  const labels = Object.keys(expenses).filter(k => expenses[k] > 0);
  const data = labels.map(k => expenses[k]);

  const colors = [
    '#C9933A', '#2E9C6E', '#1E4D9B', '#C0392B',
    '#5C3D99', '#E5A84B', '#FF6B6B'
  ];

  return new window.Chart(ctx, {
    type: 'doughnut',
    data: {
      labels: labels,
      datasets: [{
        data: data,
        backgroundColor: colors.slice(0, labels.length),
        borderColor: 'white',
        borderWidth: 2
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: true,
      plugins: {
        legend: {
          position: 'bottom',
          labels: {
            color: '#666',
            padding: 15,
            font: { size: 12 }
          }
        },
        tooltip: {
          backgroundColor: 'rgba(13, 17, 23, 0.8)',
          titleColor: 'white',
          bodyColor: 'white',
          callbacks: {
            label: (context) => {
              const total = data.reduce((a, b) => a + b, 0);
              const percent = ((context.value / total) * 100).toFixed(1);
              return `₹${context.value.toLocaleString('en-IN')} (${percent}%)`;
            }
          }
        }
      }
    }
  });
}

/**
 * Create asset allocation chart
 */
export async function createAssetAllocationChart(container, profile) {
  await loadChartJS();

  const ctx = container.getContext('2d');

  const assets = {
    'Emergency Fund': profile.emergency || 0,
    'Mutual Funds': profile.mf || 0,
    'Stocks': profile.stocks || 0,
    'Fixed Deposits': profile.fd || 0,
    'Gold': profile.gold || 0,
    'Crypto': profile.crypto || 0
  };

  const labels = Object.keys(assets).filter(k => assets[k] > 0);
  const data = labels.map(k => assets[k]);

  const colors = [
    '#3FB950', '#56D364', '#7EE9C4', '#A371F7', '#F85149', '#FB8500'
  ];

  return new window.Chart(ctx, {
    type: 'bar',
    data: {
      labels: labels,
      datasets: [{
        label: 'Asset Value',
        data: data,
        backgroundColor: colors.slice(0, labels.length),
        borderRadius: 8,
        borderSkipped: false
      }]
    },
    options: {
      indexAxis: 'y',
      responsive: true,
      maintainAspectRatio: true,
      plugins: {
        legend: { display: false },
        tooltip: {
          backgroundColor: 'rgba(13, 17, 23, 0.8)',
          titleColor: 'white',
          bodyColor: 'white',
          callbacks: {
            label: (context) => `₹${(context.value / 100000).toFixed(1)}L`
          }
        }
      },
      scales: {
        x: {
          ticks: {
            color: '#999',
            callback: (value) => `₹${(value / 100000).toFixed(0)}L`
          },
          grid: { color: 'rgba(0,0,0,0.05)' }
        },
        y: {
          ticks: { color: '#666', font: { size: 12 } },
          grid: { display: false }
        }
      }
    }
  });
}

/**
 * Create SIP projection chart
 */
export async function createSIPProjectionChart(container, profile) {
  console.log('💰 createSIPProjectionChart called with:', { container: !!container, sip: profile.sip });
  await loadChartJS();

  const ctx = container.getContext('2d');
  console.log('Got SIP canvas context:', !!ctx);

  const months = [];
  const principalData = [];
  const returnsData = [];

  const sipAmount = profile.sip || 0;
  const annualReturn = 12; // 12% annual return
  const monthlyReturn = annualReturn / 12 / 100;

  let principal = 0;
  let value = 0;

  for (let i = 0; i < 60; i++) { // 5 years
    months.push(`M${i + 1}`);
    principal += sipAmount;
    value = principal;

    for (let j = 0; j < i; j++) {
      value += (sipAmount * Math.pow(1 + monthlyReturn, i - j));
    }

    principalData.push(principal);
    returnsData.push(Math.max(0, value - principal));
  }

  console.log('SIP chart data prepared:', { months: months.length, final: principalData[principalData.length - 1] });

  const chart = new window.Chart(ctx, {
    type: 'bar',
    data: {
      labels: months,
      datasets: [
        {
          label: 'Principal',
          data: principalData,
          backgroundColor: '#C9933A'
        },
        {
          label: 'Returns',
          data: returnsData,
          backgroundColor: '#2E9C6E'
        }
      ]
    },
    options: {
      responsive: true,
      maintainAspectRatio: true,
      scales: {
        x: {
          stacked: true,
          ticks: { color: '#999', maxTicksLimit: 12 },
          grid: { display: false }
        },
        y: {
          stacked: true,
          ticks: {
            color: '#999',
            callback: (value) => `₹${(value / 100000).toFixed(0)}L`
          },
          grid: { color: 'rgba(0,0,0,0.05)' }
        }
      },
      plugins: {
        legend: {
          labels: { color: '#666', padding: 15 }
        },
        tooltip: {
          backgroundColor: 'rgba(13, 17, 23, 0.8)',
          titleColor: 'white',
          bodyColor: 'white'
        }
      }
    }
  });

  console.log('SIP chart instance created and returned:', !!chart);
  return chart;
}
