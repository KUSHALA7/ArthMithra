/**
 * CouplePlanner.js — Joint financial optimisation for couples.
 */
import { UserState } from '../state.js';
import { optimiseCouple } from '../api.js';
import { showLoading, hideLoading } from '../components/LoadingOverlay.js';
import { aiBox, createInsightCards } from '../utils.js';

export function renderCouplePlanner(container) {
  container.innerHTML = `
    <div class="page-hdr">
      <div class="page-title">Couple's Money Planner</div>
      <div class="page-sub">Optimise taxes, SIPs, and insurance across both incomes</div>
    </div>
    <div class="card" style="margin-bottom:1rem;">
      <div class="card-title">Partner Details</div>
      <div class="partner-grid">
        <div class="partner partner-a">
          <div class="partner-name pa-name">👩 Partner A</div>
          <div class="fg" style="margin-bottom:8px;"><label style="color:var(--blue);">Name</label><input id="cp-a-name" type="text" placeholder="Priya"/></div>
          <div class="fg" style="margin-bottom:8px;"><label style="color:var(--blue);">Annual Income (₹)</label><div class="pfx"><span class="pfx-sym">₹</span><input id="cp-a-income" type="number" placeholder="1800000"/></div></div>
          <div class="fg" style="margin-bottom:8px;"><label style="color:var(--blue);">80C Invested (₹)</label><div class="pfx"><span class="pfx-sym">₹</span><input id="cp-a-80c" type="number" value="0"/></div></div>
          <div class="fg"><label style="color:var(--blue);">NPS Contribution (₹)</label><div class="pfx"><span class="pfx-sym">₹</span><input id="cp-a-nps" type="number" value="0"/></div></div>
        </div>
        <div class="partner partner-b">
          <div class="partner-name pb-name">👨 Partner B</div>
          <div class="fg" style="margin-bottom:8px;"><label style="color:var(--violet);">Name</label><input id="cp-b-name" type="text" placeholder="Arjun"/></div>
          <div class="fg" style="margin-bottom:8px;"><label style="color:var(--violet);">Annual Income (₹)</label><div class="pfx"><span class="pfx-sym">₹</span><input id="cp-b-income" type="number" placeholder="2400000"/></div></div>
          <div class="fg" style="margin-bottom:8px;"><label style="color:var(--violet);">80C Invested (₹)</label><div class="pfx"><span class="pfx-sym">₹</span><input id="cp-b-80c" type="number" value="0"/></div></div>
          <div class="fg"><label style="color:var(--violet);">NPS Contribution (₹)</label><div class="pfx"><span class="pfx-sym">₹</span><input id="cp-b-nps" type="number" value="0"/></div></div>
        </div>
      </div>
      <div style="margin-top:1rem;">
        <div class="fg" style="margin-bottom:8px;"><label>Who pays the rent?</label>
          <select id="cp-hra">
            <option value="a">Partner A</option>
            <option value="b">Partner B</option>
            <option value="neither">Neither / Own home</option>
          </select>
        </div>
        <button class="btn btn-gold btn-full" id="couple-ai-btn">🤖 Optimise Our Joint Finances</button>
      </div>
    </div>
    <div class="card">
      <div class="card-title">AI Joint Financial Plan</div>
      <div id="couple-result" style="text-align:center;padding:1.5rem;color:var(--ink-60);font-size:13px;">
        Fill in both partners' details and click optimise.
      </div>
    </div>`;

  document.getElementById('couple-ai-btn').addEventListener('click', runCoupleAI);
}

async function runCoupleAI() {
  const g = id => parseFloat(document.getElementById(id)?.value) || 0;
  const s = id => document.getElementById(id)?.value || '';

  showLoading('Optimising your joint finances...');
  try {
    const plan = await optimiseCouple({
      profile:      UserState.toJSON(),
      partnerAName: s('cp-a-name') || 'Partner A',
      partnerBName: s('cp-b-name') || 'Partner B',
      partnerAIncome: g('cp-a-income'),
      partnerBIncome: g('cp-b-income'),
      partnerA80c:    g('cp-a-80c'),
      partnerB80c:    g('cp-b-80c'),
      partnerANps:    g('cp-a-nps'),
      partnerBNps:    g('cp-b-nps'),
      hraWho:         s('cp-hra'),
    });
    hideLoading();
    document.getElementById('couple-result').innerHTML =
      createInsightCards(UserState) + aiBox(plan, `${s('cp-a-name') || 'Partner A'} & ${s('cp-b-name') || 'Partner B'}`);
  } catch (e) {
    hideLoading();
    document.getElementById('couple-result').innerHTML = `<div class="alert alert-err">⚠️ ${e.message}</div>`;
  }
}
