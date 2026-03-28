/**
 * utils.js — Shared helpers used across all pages.
 */

// ── Number Formatters ─────────────────────────────────────────────────────

export function fmt(n) {
  if (!n || isNaN(n)) return '0';
  if (n >= 10000000) return (n / 10000000).toFixed(2) + 'Cr';
  if (n >= 100000)   return (n / 100000).toFixed(1) + 'L';
  if (n >= 1000)     return (n / 1000).toFixed(0) + 'K';
  return Math.round(n).toString();
}

export function fmtRupee(n) {
  return '₹' + fmt(n);
}

export function fmtCr(n) {
  if (!n || isNaN(n)) return '₹0';
  if (n >= 10000000) return '₹' + (n / 10000000).toFixed(2) + 'Cr';
  if (n >= 100000)   return '₹' + (n / 100000).toFixed(1) + 'L';
  return '₹' + fmt(n);
}

// ── AI Text Formatter ─────────────────────────────────────────────────────

export function formatAI(text) {
  if (!text) return '';

  // Split into lines for processing
  const lines = text.split('\n');
  let html = '';
  let inList = false;
  let listType = null; // 'ul' or 'ol'

  for (let i = 0; i < lines.length; i++) {
    let line = lines[i].trim();
    if (!line) {
      // Empty line - close any open list and add spacing
      if (inList) {
        html += `</${listType}>`;
        inList = false;
        listType = null;
      }
      continue;
    }

    // Format inline elements
    line = line
      .replace(/\*\*\*(.*?)\*\*\*/g, '<strong><em>$1</em></strong>') // Bold italic
      .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>') // Bold
      .replace(/(?<!\*)\*([^*]+)\*(?!\*)/g, '<em>$1</em>') // Italic (single asterisk)
      .replace(/`([^`]+)`/g, '<code>$1</code>'); // Inline code

    // Check for headers
    if (line.startsWith('### ')) {
      if (inList) { html += `</${listType}>`; inList = false; listType = null; }
      html += `<h4 class="ai-h4">${line.slice(4)}</h4>`;
      continue;
    }
    if (line.startsWith('## ')) {
      if (inList) { html += `</${listType}>`; inList = false; listType = null; }
      html += `<h3 class="ai-h3">${line.slice(3)}</h3>`;
      continue;
    }
    if (line.startsWith('# ')) {
      if (inList) { html += `</${listType}>`; inList = false; listType = null; }
      html += `<h3 class="ai-h3">${line.slice(2)}</h3>`;
      continue;
    }

    // Check for bullet list (*, -, or •)
    const bulletMatch = line.match(/^[-*•]\s+(.+)$/);
    if (bulletMatch) {
      if (!inList || listType !== 'ul') {
        if (inList) html += `</${listType}>`;
        html += '<ul class="ai-list">';
        inList = true;
        listType = 'ul';
      }
      html += `<li>${bulletMatch[1]}</li>`;
      continue;
    }

    // Check for numbered list (1. or 1))
    const numMatch = line.match(/^(\d+)[.)]\s+(.+)$/);
    if (numMatch) {
      if (!inList || listType !== 'ol') {
        if (inList) html += `</${listType}>`;
        html += '<ol class="ai-list">';
        inList = true;
        listType = 'ol';
      }
      html += `<li>${numMatch[2]}</li>`;
      continue;
    }

    // Regular paragraph
    if (inList) {
      html += `</${listType}>`;
      inList = false;
      listType = null;
    }
    html += `<p>${line}</p>`;
  }

  // Close any open list
  if (inList) {
    html += `</${listType}>`;
  }

  return html || '<p>' + text + '</p>';
}

// ── AI Insight Box ────────────────────────────────────────────────────────

export function aiBox(content, label = '') {
  return `
    <div class="ai-box">
      <div class="ai-box-hdr">
        <div class="ai-chip">ArthMitra AI</div>
        ${label ? `<div style="font-size:11px;color:var(--ink-30);">${label}</div>` : ''}
      </div>
      ${formatAI(content)}
    </div>`;
}

// ── Smart Insights Cards ──────────────────────────────────────────────────

export function createInsightCards(profile) {
  const cards = [];

  // 1. Risk Assessment
  const riskScore = (profile.mf + profile.stocks) / Math.max(1, profile.netWorth) * 100;
  const riskLevel = riskScore >= 60 ? 'High' : riskScore >= 35 ? 'Moderate' : 'Conservative';
  const riskEmoji = riskScore >= 60 ? '🔴' : riskScore >= 35 ? '🟡' : '🟢';
  const riskColor = riskScore >= 60 ? '#C0392B' : riskScore >= 35 ? '#D4A574' : '#2E9C6E';

  cards.push({
    icon: '⚠️',
    title: 'Risk Profile',
    value: riskLevel,
    detail: `${Math.round(riskScore)}% in equities`,
    color: riskColor,
    emoji: riskEmoji
  });

  // 2. Emergency Fund
  const emergencyNeeded = profile.totalExpenses * 6;
  const emergencyStatus = profile.emergency >= emergencyNeeded ? 'Strong' :
                          profile.emergency >= emergencyNeeded * 0.5 ? 'Adequate' : 'Critical';
  const emergencyEmoji = profile.emergency >= emergencyNeeded ? '🟢' :
                         profile.emergency >= emergencyNeeded * 0.5 ? '🟡' : '🔴';
  const emergencyColor = profile.emergency >= emergencyNeeded ? '#2E9C6E' :
                         profile.emergency >= emergencyNeeded * 0.5 ? '#D4A574' : '#C0392B';
  const emergencyMonths = Math.round((profile.emergency / Math.max(1, profile.totalExpenses)) * 10) / 10;

  cards.push({
    icon: '🛡️',
    title: 'Emergency Fund',
    value: emergencyStatus,
    detail: `${emergencyMonths} months covered`,
    color: emergencyColor,
    emoji: emergencyEmoji
  });

  // 3. Savings Rate
  const monthlyIncome = profile.income / 12 || 0;
  const monthlyExpense = profile.totalExpenses || 0;
  const surplus = monthlyIncome - monthlyExpense;
  const savingsRate = monthlyIncome > 0 ? (surplus / monthlyIncome * 100) : 0;
  const savingsStatus = savingsRate >= 50 ? 'Exceptional' :
                        savingsRate >= 30 ? 'Healthy' :
                        savingsRate >= 10 ? 'Moderate' : 'Low';
  const savingsEmoji = savingsRate >= 50 ? '🟢' :
                       savingsRate >= 30 ? '🟢' :
                       savingsRate >= 10 ? '🟡' : '🔴';
  const savingsColor = savingsRate >= 50 ? '#2E9C6E' :
                       savingsRate >= 30 ? '#2E9C6E' :
                       savingsRate >= 10 ? '#D4A574' : '#C0392B';

  cards.push({
    icon: '💰',
    title: 'Savings Rate',
    value: savingsStatus,
    detail: `${Math.round(savingsRate)}% of income`,
    color: savingsColor,
    emoji: savingsEmoji
  });

  // 4. Wealth Growth
  const investmentSpeed = profile.sip > 0 ? 'Active' : 'Inactive';
  const investmentColor = profile.sip > 0 && savingsRate >= 20 ? '#2E9C6E' :
                          profile.sip > 0 ? '#D4A574' : '#C0392B';
  const investmentEmoji = profile.sip > 0 && savingsRate >= 20 ? '🟢' :
                          profile.sip > 0 ? '🟡' : '🔴';

  cards.push({
    icon: '📈',
    title: 'Wealth Building',
    value: investmentSpeed,
    detail: `₹${fmt(profile.sip)}/month SIP`,
    color: investmentColor,
    emoji: investmentEmoji
  });

  // 5. Insurance Coverage
  const hasTermCover = profile.termCover > 0;
  const hasHealthCover = profile.healthCover > 300000;
  const insuranceStatus = hasTermCover && hasHealthCover ? 'Protected' :
                          hasTermCover || hasHealthCover ? 'Partial' : 'Unprotected';
  const insuranceEmoji = hasTermCover && hasHealthCover ? '🟢' :
                         hasTermCover || hasHealthCover ? '🟡' : '🔴';
  const insuranceColor = hasTermCover && hasHealthCover ? '#2E9C6E' :
                         hasTermCover || hasHealthCover ? '#D4A574' : '#C0392B';

  cards.push({
    icon: '🏥',
    title: 'Insurance',
    value: insuranceStatus,
    detail: `Coverage: ${hasTermCover ? '✓ Term' : '○ Term'} ${hasHealthCover ? '✓ Health' : '○ Health'}`,
    color: insuranceColor,
    emoji: insuranceEmoji
  });

  // 6. Tax Optimization
  const tax80cUtilized = (profile.invested80c / 150000) * 100;
  const taxStatus = profile.invested80c >= 150000 ? 'Optimized' :
                    profile.invested80c >= 100000 ? 'Good' :
                    profile.invested80c >= 50000 ? 'Partial' : 'Low';
  const taxEmoji = profile.invested80c >= 150000 ? '🟢' :
                   profile.invested80c >= 100000 ? '🟢' :
                   profile.invested80c >= 50000 ? '🟡' : '🔴';
  const taxColor = profile.invested80c >= 150000 ? '#2E9C6E' :
                   profile.invested80c >= 100000 ? '#2E9C6E' :
                   profile.invested80c >= 50000 ? '#D4A574' : '#C0392B';

  cards.push({
    icon: '💳',
    title: 'Tax Efficiency',
    value: taxStatus,
    detail: `${Math.round(Math.min(100, tax80cUtilized))}% of 80C limit`,
    color: taxColor,
    emoji: taxEmoji
  });

  // Generate HTML
  const html = `
    <div class="insights-container">
      <div style="font-size:13px;font-weight:600;color:var(--ink-60);margin-bottom:12px;text-transform:uppercase;letter-spacing:0.5px;">
        📊 Your Financial Snapshot
      </div>
      <div class="insights-grid">
        ${cards.map(card => `
          <div class="insight-card" style="border-left-color:${card.color};">
            <div class="insight-header">
              <span class="insight-emoji">${card.emoji}</span>
              <span class="insight-title">${card.title}</span>
            </div>
            <div class="insight-value" style="color:${card.color};">${card.value}</div>
            <div class="insight-detail">${card.detail}</div>
          </div>
        `).join('')}
      </div>
    </div>
  `;

  return html;
}

// ── Score Calculators ─────────────────────────────────────────────────────

export function calcEmergencyScore(U) {
  const req = U.totalExpenses * 6;
  return Math.min(100, Math.round((U.emergency / Math.max(1, req)) * 100));
}

export function calcInsuranceScore(U) {
  const gap = Math.max(0, U.income * 10 - U.termCover);
  return gap > 0
    ? (U.healthCover > 300000 ? 40 : 20)
    : (U.healthCover > 300000 ? 90 : 65);
}

export function calcInvestmentScore(U) {
  const nw = U.netWorth;
  return Math.min(100,
    Math.round(((U.mf + U.stocks) / Math.max(1, nw)) * 100) + (U.sip > 0 ? 30 : 0)
  );
}

export function calcDebtScore(U) {
  return U.expEmi > 0
    ? Math.max(20, 100 - Math.round((U.expEmi / Math.max(1, U.takeHome)) * 200))
    : 95;
}

export function calcTaxScore(U) {
  return Math.min(100,
    Math.round((U.invested80c / 150000) * 60)
    + (U.premium > 0 ? 20 : 0)
    + (U.hra > 0 ? 20 : 0)
  );
}

export function calcRetirementScore(U) {
  return Math.min(100,
    Math.round((U.netWorth / Math.max(1, U.income)) * 20) + (U.sip > 0 ? 40 : 0)
  );
}

export function calcOverallScore(U) {
  return Math.round((
    calcEmergencyScore(U) +
    calcInsuranceScore(U) +
    Math.min(100, calcInvestmentScore(U)) +
    calcDebtScore(U) +
    calcTaxScore(U) +
    calcRetirementScore(U)
  ) / 6);
}

// ── FIRE Math ─────────────────────────────────────────────────────────────

export function calcRequiredSIP(target, annualReturn, months) {
  const r = annualReturn / 12;
  if (r === 0) return target / months;
  return target * r / (Math.pow(1 + r, months) - 1);
}

// ── Tax Calculators ───────────────────────────────────────────────────────

export function calcTaxOld(taxable) {
  let tax = 0;
  if (taxable <= 250000) return 0;
  if (taxable <= 500000)   tax = (taxable - 250000) * 0.05;
  else if (taxable <= 1000000) tax = 12500 + (taxable - 500000) * 0.20;
  else tax = 112500 + (taxable - 1000000) * 0.30;
  return Math.round(tax * 1.04);
}

export function calcTaxNew(taxable) {
  let tax = 0;
  if (taxable <= 300000) return 0;
  if (taxable <= 700000)   tax = (taxable - 300000) * 0.05;
  else if (taxable <= 1000000) tax = 20000 + (taxable - 700000) * 0.10;
  else if (taxable <= 1200000) tax = 50000 + (taxable - 1000000) * 0.15;
  else if (taxable <= 1500000) tax = 80000 + (taxable - 1200000) * 0.20;
  else tax = 140000 + (taxable - 1500000) * 0.30;
  return Math.round(tax * 1.04);
}

// ── Score Ring SVG ────────────────────────────────────────────────────────

export function scoreRingSVG(score, size = 110) {
  const r = size * 0.4;
  const circ = 2 * Math.PI * r;
  const offset = circ - (score / 100) * circ;
  const color = score >= 75 ? 'var(--emerald-mid)' : score >= 50 ? 'var(--gold)' : 'var(--crimson)';
  const label = score >= 75 ? 'Strong' : score >= 50 ? 'Good' : 'Needs Work';
  const cx = size / 2, cy = size / 2;
  return `
    <div class="ring-wrap" style="width:${size}px;height:${size}px;">
      <svg width="${size}" height="${size}" viewBox="0 0 ${size} ${size}">
        <circle cx="${cx}" cy="${cy}" r="${r}" fill="none" stroke="var(--surface-3)" stroke-width="9"/>
        <circle cx="${cx}" cy="${cy}" r="${r}" fill="none" stroke="${color}" stroke-width="9"
          stroke-dasharray="${circ.toFixed(1)}" stroke-dashoffset="${offset.toFixed(1)}" stroke-linecap="round"/>
      </svg>
      <div class="ring-center">
        <div class="ring-num" style="color:${color};">${score}</div>
        <div class="ring-lbl">${label}</div>
      </div>
    </div>`;
}

// ── Dimension Bar Row ─────────────────────────────────────────────────────

export function dimRow(label, value) {
  const color = value >= 70 ? 'var(--emerald-mid)' : value >= 45 ? 'var(--gold)' : 'var(--crimson)';
  return `
    <div class="dim">
      <div class="dim-lbl">${label}</div>
      <div class="dim-bar"><div class="dim-fill" style="width:${value}%;background:${color};"></div></div>
      <div class="dim-val" style="color:${color};">${value}</div>
    </div>`;
}

// ── Metric Card ───────────────────────────────────────────────────────────

export function metricCard(label, value, sub = '', color = '') {
  return `
    <div class="metric">
      <div class="metric-lbl">${label}</div>
      <div class="metric-val" ${color ? `style="color:${color};"` : ''}>${value}</div>
      ${sub ? `<div class="metric-sub">${sub}</div>` : ''}
    </div>`;
}

// ── Alert ─────────────────────────────────────────────────────────────────

export function alert(type, icon, message) {
  return `<div class="alert alert-${type}">${icon}<div>${message}</div></div>`;
}
