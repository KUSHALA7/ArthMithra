/**
 * riskGauge.js — Financial risk visualization
 */

/**
 * Calculate risk score based on profile
 */
export function calculateRiskScore(profile) {
  let score = 50; // Start at medium

  // Emergency fund too low = higher risk
  const emergencyMonths = profile.emergency / Math.max(1, profile.totalExpenses);
  if (emergencyMonths < 3) score += 20;
  else if (emergencyMonths < 6) score += 10;
  else if (emergencyMonths >= 6) score -= 10;

  // Insurance gap = higher risk
  const termGap = profile.income * 10 - profile.termCover;
  if (termGap > profile.income * 5) score += 20;
  else if (termGap > 0) score += 10;

  const healthGap = 300000 - profile.healthCover;
  if (healthGap > 100000) score += 15;

  // High debt = higher risk
  const debtRatio = profile.expEmi / Math.max(1, profile.takeHome);
  if (debtRatio > 0.5) score += 25;
  else if (debtRatio > 0.3) score += 15;
  else if (debtRatio > 0.1) score += 5;

  // High investments = lower risk
  const investmentRatio = (profile.mf + profile.stocks) / Math.max(1, profile.netWorth);
  if (investmentRatio > 0.6) score -= 15;
  else if (investmentRatio > 0.3) score -= 10;

  return Math.max(20, Math.min(100, score));
}

/**
 * Get risk level and color
 */
export function getRiskLevel(score) {
  if (score >= 75) return { level: 'HIGH', color: '#C0392B', icon: '🔴' };
  if (score >= 50) return { level: 'MEDIUM', color: '#E5A84B', icon: '🟡' };
  return { level: 'LOW', color: '#2E9C6E', icon: '🟢' };
}

/**
 * Create SVG risk gauge
 */
export function createRiskGaugeSVG(score) {
  const riskInfo = getRiskLevel(score);

  // SVG gauge
  const gaugeHTML = `
    <div style="display:flex;align-items:center;gap:1.5rem;">
      <div style="flex-shrink:0;">
        <svg width="180" height="110" viewBox="0 0 180 110" style="filter:drop-shadow(0 2px 4px rgba(0,0,0,0.1));">
          <!-- Gauge background -->
          <path d="M 20 100 Q 90 20, 160 100" fill="none" stroke="#EEEAE0" stroke-width="12" stroke-linecap="round"/>

          <!-- Gauge fill (0-100) -->
          <path d="M 20 100 Q 90 20, 160 100" fill="none" stroke="${riskInfo.color}" stroke-width="12" stroke-linecap="round"
            stroke-dasharray="${(score / 100) * 240}" stroke-dashoffset="0"
            style="transition: stroke-dasharray 0.6s ease;"/>

          <!-- Gauge markers -->
          <text x="25" y="108" font-size="11" fill="#999" text-anchor="middle">Low</text>
          <text x="90" y="15" font-size="11" fill="#999" text-anchor="middle">High</text>
          <text x="155" y="108" font-size="11" fill="#999" text-anchor="middle">Risk</text>

          <!-- Needle -->
          <g transform="translate(90, 100)">
            <line x1="0" y1="0" x2="0" y2="${-70}" stroke="${riskInfo.color}" stroke-width="3" stroke-linecap="round"
              style="transform-origin: center; transition: transform 0.6s ease;"
              transform="rotate(${(score - 50) * 1.8})"/>
            <circle cx="0" cy="0" r="6" fill="${riskInfo.color}"/>
          </g>
        </svg>
      </div>

      <div>
        <div style="font-size:2rem;font-weight:700;color:${riskInfo.color};">${score}</div>
        <div style="font-size:13px;font-weight:600;color:${riskInfo.color};text-transform:uppercase;letter-spacing:0.05em;">${riskInfo.level}</div>
        <div style="font-size:12px;color:var(--ink-60);margin-top:6px;max-width:200px;">
          ${getRiskMessage(score)}
        </div>
      </div>
    </div>
  `;

  return gaugeHTML;
}

/**
 * Get contextual risk message
 */
function getRiskMessage(score) {
  if (score >= 80) return '⚠️ Critical: Immediate action needed on insurance & emergency fund';
  if (score >= 65) return '⚠️ High: Review debt levels and insurance coverage';
  if (score >= 50) return '🟡 Moderate: Build emergency fund to 6 months';
  if (score >= 35) return '✅ Good: Continue regular investments and SIPs';
  return '🟢 Low: You\'re on track! Focus on wealth growth';
}

/**
 * Create risk breakdown component
 */
export function createRiskBreakdown(profile) {
  const factors = [];

  // Emergency fund check
  const emergencyMonths = profile.emergency / Math.max(1, profile.totalExpenses);
  factors.push({
    label: 'Emergency Fund',
    status: emergencyMonths >= 6 ? 'good' : emergencyMonths >= 3 ? 'medium' : 'bad',
    value: `${emergencyMonths.toFixed(1)} months`,
    target: '6 months'
  });

  // Insurance check
  const termGap = profile.income * 10 - profile.termCover;
  factors.push({
    label: 'Term Insurance',
    status: termGap <= 0 ? 'good' : termGap < profile.income * 3 ? 'medium' : 'bad',
    value: `₹${(profile.termCover / 100000).toFixed(1)}L`,
    target: `₹${(profile.income * 10 / 100000).toFixed(1)}L`
  });

  // Health insurance
  factors.push({
    label: 'Health Insurance',
    status: profile.healthCover >= 500000 ? 'good' : profile.healthCover >= 300000 ? 'medium' : 'bad',
    value: `₹${(profile.healthCover / 100000).toFixed(1)}L`,
    target: '₹10L'
  });

  // Debt ratio
  const debtRatio = profile.expEmi / Math.max(1, profile.takeHome);
  factors.push({
    label: 'Debt Ratio',
    status: debtRatio <= 0.1 ? 'good' : debtRatio <= 0.3 ? 'medium' : 'bad',
    value: `${(debtRatio * 100).toFixed(0)}%`,
    target: '< 10%'
  });

  return factors.map(f => {
    const icon = f.status === 'good' ? '🟢' : f.status === 'medium' ? '🟡' : '🔴';
    const color = f.status === 'good' ? '#2E9C6E' : f.status === 'medium' ? '#E5A84B' : '#C0392B';
    return `
      <div style="display:flex;align-items:center;justify-content:space-between;padding:10px 0;border-bottom:1px solid rgba(0,0,0,0.05);">
        <div style="display:flex;gap:8px;align-items:center;">
          <div style="font-size:16px;">${icon}</div>
          <div>
            <div style="font-weight:600;font-size:13px;color:var(--ink);">${f.label}</div>
            <div style="font-size:11px;color:var(--ink-60);">Target: ${f.target}</div>
          </div>
        </div>
        <div style="font-weight:600;color:${color};font-size:13px;">${f.value}</div>
      </div>
    `;
  }).join('');
}
