/**
 * main.js — App entry point. Handles routing and page mounting.
 */
import { renderHeader }       from './components/Header.js';
import { renderSidebar }      from './components/Sidebar.js';
import { renderDashboard }    from './pages/Dashboard.js';
import { renderHealthScore }  from './pages/HealthScore.js';
import { renderFirePlanner }  from './pages/FirePlanner.js';
import { renderTaxWizard }    from './pages/TaxWizard.js';
import { renderLifeEvents }   from './pages/LifeEvents.js';
import { renderCouplePlanner } from './pages/CouplePlanner.js';
import { renderPortfolioXRay } from './pages/PortfolioXRay.js';
import { renderPersonalGoals } from './pages/PersonalGoals.js';
import { renderAIMentor }     from './pages/AIMentor.js';
import { renderWhatIf }       from './pages/WhatIf.js';
import { renderAuth }         from './pages/Auth.js';

const PAGES = {
  dashboard: renderDashboard,
  health:    renderHealthScore,
  fire:      renderFirePlanner,
  tax:       renderTaxWizard,
  life:      renderLifeEvents,
  couple:    renderCouplePlanner,
  portfolio: renderPortfolioXRay,
  goals:     renderPersonalGoals,
  whatif:    renderWhatIf,
  mentor:    renderAIMentor,
  auth:      renderAuth,
};

let currentPage = 'dashboard';

// Mobile menu state
let mobileMenuOpen = false;

// Theme state
function initTheme() {
  const savedTheme = localStorage.getItem('theme') || 'light';
  document.documentElement.setAttribute('data-theme', savedTheme);
  updateThemeIcon(savedTheme);
}

function toggleTheme() {
  const currentTheme = document.documentElement.getAttribute('data-theme') || 'light';
  const newTheme = currentTheme === 'light' ? 'dark' : 'light';
  document.documentElement.setAttribute('data-theme', newTheme);
  localStorage.setItem('theme', newTheme);
  updateThemeIcon(newTheme);
}

function updateThemeIcon(theme) {
  const btn = document.getElementById('theme-toggle');
  if (btn) {
    btn.textContent = theme === 'dark' ? '☀️' : '🌙';
    btn.setAttribute('aria-label', theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode');
  }
}

function toggleMobileMenu(open) {
  const sidebar = document.getElementById('sidebar');
  const overlay = document.getElementById('sidebar-overlay');
  const menuBtn = document.getElementById('mobile-menu-btn');

  mobileMenuOpen = open !== undefined ? open : !mobileMenuOpen;

  if (mobileMenuOpen) {
    sidebar.classList.add('open');
    overlay.classList.add('active');
    menuBtn.classList.add('active');
    document.body.style.overflow = 'hidden';
  } else {
    sidebar.classList.remove('open');
    overlay.classList.remove('active');
    menuBtn.classList.remove('active');
    document.body.style.overflow = '';
  }
}

function updateMobileNav(pageId) {
  const mobileNav = document.getElementById('mobile-nav');
  if (!mobileNav) return;

  mobileNav.querySelectorAll('.mobile-nav-item').forEach(btn => {
    if (btn.dataset.page === pageId) {
      btn.classList.add('active');
    } else {
      btn.classList.remove('active');
    }
  });
}

export function navigateTo(pageId) {
  if (!PAGES[pageId]) return;
  currentPage = pageId;
  const main = document.getElementById('main');
  main.innerHTML = '';

  // Create container div for page
  const container = document.createElement('div');
  container.id = 'page-' + pageId;
  main.appendChild(container);

  // Mount page
  PAGES[pageId](container);

  // Re-render sidebar with active state
  renderSidebar(pageId);

  // Update mobile bottom nav
  updateMobileNav(pageId);

  // Close mobile menu if open
  toggleMobileMenu(false);

  // Scroll to top
  main.scrollTop = 0;
}

// Boot
document.addEventListener('DOMContentLoaded', () => {
  // Initialize theme first (before render to avoid flash)
  initTheme();

  renderHeader();
  renderSidebar('dashboard');
  navigateTo('dashboard');

  // Theme toggle
  const themeToggle = document.getElementById('theme-toggle');
  if (themeToggle) {
    themeToggle.addEventListener('click', toggleTheme);
  }

  // Mobile menu toggle
  const menuBtn = document.getElementById('mobile-menu-btn');
  const overlay = document.getElementById('sidebar-overlay');

  if (menuBtn) {
    menuBtn.addEventListener('click', () => toggleMobileMenu());
  }

  if (overlay) {
    overlay.addEventListener('click', () => toggleMobileMenu(false));
  }

  // Mobile bottom nav
  const mobileNav = document.getElementById('mobile-nav');
  if (mobileNav) {
    mobileNav.querySelectorAll('.mobile-nav-item').forEach(btn => {
      btn.addEventListener('click', () => {
        navigateTo(btn.dataset.page);
      });
    });
  }

  // Close mobile menu on escape key
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && mobileMenuOpen) {
      toggleMobileMenu(false);
    }
  });

  // Handle resize - close mobile menu when switching to desktop
  window.addEventListener('resize', () => {
    if (window.innerWidth > 900 && mobileMenuOpen) {
      toggleMobileMenu(false);
    }
  });
});
