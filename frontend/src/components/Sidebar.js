/**
 * Sidebar.js — Left navigation + user profile card.
 */
import { UserState, AuthState } from '../state.js';
import { fmt } from '../utils.js';
import { navigateTo } from '../main.js';

const NAV_ITEMS = [
  { section: 'Overview' },
  { id: 'dashboard',  icon: '📊', label: 'Dashboard' },
  { section: 'Tools' },
  { id: 'health',     icon: '💚', label: 'Health Score',    badge: false },
  { id: 'fire',       icon: '🔥', label: 'FIRE Planner' },
  { id: 'whatif',     icon: '🎯', label: 'What-If Simulator' },
  { id: 'goals',      icon: '🎯', label: 'Personal Goals' },
  { id: 'tax',        icon: '🧾', label: 'Tax Wizard',      badge: true  },
  { id: 'life',       icon: '🎪', label: 'Life Events' },
  { id: 'couple',     icon: '💑', label: 'Couple Planner' },
  { id: 'portfolio',  icon: '📈', label: 'Portfolio X-Ray' },
  { section: 'AI' },
  { id: 'mentor',     icon: '🤖', label: 'AI Mentor' },
];

export function renderSidebar(activeId = 'dashboard') {
  const sidebar = document.getElementById('sidebar');

  const items = NAV_ITEMS.map(item => {
    if (item.section) {
      return `<div class="nav-section">${item.section}</div>`;
    }
    const isActive = item.id === activeId;
    const badge = item.badge && UserState.ready && UserState.remaining80c > 0
      ? `<span class="nav-badge">!</span>` : '';
    return `
      <button class="nav-item ${isActive ? 'active' : ''}" data-page="${item.id}">
        <span class="nav-icon">${item.icon}</span>
        ${item.label}
        ${badge}
      </button>`;
  }).join('');

  const U = UserState;

  // Auth section
  const authSection = AuthState.isLoggedIn
    ? `<button class="nav-item" data-page="auth" style="padding:8px 12px;background:var(--emerald-light);border-radius:8px;margin-bottom:8px;width:100%;text-align:left;border:none;cursor:pointer;">
        <div style="display:flex;align-items:center;gap:8px;">
          <div style="width:28px;height:28px;background:var(--emerald);border-radius:50%;display:flex;align-items:center;justify-content:center;color:white;font-size:12px;font-weight:600;">
            ${AuthState.email ? AuthState.email[0].toUpperCase() : '?'}
          </div>
          <div style="flex:1;min-width:0;">
            <div style="font-size:11px;font-weight:600;color:var(--emerald);overflow:hidden;text-overflow:ellipsis;white-space:nowrap;">${AuthState.email}</div>
            <div style="font-size:10px;color:var(--emerald-mid);">Click to manage account</div>
          </div>
        </div>
       </button>`
    : `<button class="nav-item" data-page="auth" style="background:var(--gold-light);margin-bottom:8px;">
        <span class="nav-icon">🔐</span>
        Sign In / Sign Up
       </button>`;

  const userSection = `
    <div class="sidebar-user">
      ${authSection}
      <div class="user-card">
        <div class="user-name">${U.ready ? U.name : 'Set up profile →'}</div>
        <div class="user-sub">${U.ready ? `${U.age} · ${U.city} · ₹${fmt(U.income)}/yr` : 'Complete onboarding'}</div>
        <div class="user-score">
          <span style="font-size:10px;color:var(--ink-30);">Score</span>
          <div class="score-bar">
            <div class="score-fill" style="width:${U.healthScore}%"></div>
          </div>
          <span class="score-num">${U.ready ? U.healthScore : '—'}</span>
        </div>
      </div>
    </div>`;

  sidebar.innerHTML = items + userSection;

  // Bind clicks
  sidebar.querySelectorAll('.nav-item[data-page]').forEach(btn => {
    btn.addEventListener('click', () => navigateTo(btn.dataset.page));
  });
}
