/**
 * api.js — Every backend call lives here.
 * All functions return the parsed JSON response data.
 */

const BASE = import.meta.env.VITE_API_URL || 'http://localhost:8000';

async function post(path, body) {
  const res = await fetch(`${BASE}${path}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body)
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.detail || `API error ${res.status}`);
  }
  return res.json();
}

async function get(path) {
  try {
    const res = await fetch(`${BASE}${path}`);
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.detail || `API error ${res.status}`);
    }
    const data = await res.json();
    return data;
  } catch (error) {
    console.error(`GET ${path} failed:`, error);
    throw error;
  }
}

// ── Health Score ───────────────────────────────────────────────────────────
export async function assessHealth(profile) {
  const data = await post('/api/health/assess', profile);
  return data.assessment;
}

// ── FIRE Planner ──────────────────────────────────────────────────────────
export async function analyseFire({ profile, fireAge, expectedReturn, withdrawalRate, inflationRate }) {
  const data = await post('/api/fire/analyse', { profile, fireAge, expectedReturn, withdrawalRate, inflationRate });
  return data.analysis;
}

// ── Tax Wizard ────────────────────────────────────────────────────────────
export async function analyseTax({ profile, grossSalary, invested80c, npsContribution, premium80d, homeLoanInterest, hraExemption }) {
  const data = await post('/api/tax/analyse', { profile, grossSalary, invested80c, npsContribution, premium80d, homeLoanInterest, hraExemption });
  return data.recommendations;
}

// ── Life Events ───────────────────────────────────────────────────────────
export async function adviseLifeEvent({ profile, event, amount, context }) {
  const data = await post('/api/life/advise', { profile, event, amount, context });
  return data.advice;
}

// ── Couple Planner ────────────────────────────────────────────────────────
export async function optimiseCouple(payload) {
  const data = await post('/api/couple/optimise', payload);
  return data.plan;
}

// ── Portfolio X-Ray ───────────────────────────────────────────────────────
export async function xrayPortfolio({ profile, funds }) {
  const data = await post('/api/portfolio/xray', { profile, funds });
  return data;   // { analysis, totalValue, weightedXirr }
}

// ── Personal Goals ────────────────────────────────────────────────────────
export async function analyzeGoals({ profile, goalType, goalLabel, goalAmount, timeline }) {
  const data = await post('/api/goals/analyze', { profile, goalType, goalLabel, goalAmount, timeline });
  return data.analysis;
}

// ── AI Mentor Chat ────────────────────────────────────────────────────────
export async function sendChatMessage({ profile, history }) {
  const data = await post('/api/chat/message', { profile, history });
  return data.reply;
}

// ══════════════════════════════════════════════════════════════════════════
// MARKET DATA APIs (Free - No API key required)
// ══════════════════════════════════════════════════════════════════════════

// ── Market Indices ────────────────────────────────────────────────────────
export async function getMarketIndices() {
  return get('/api/stocks/indices');
}

// ── Gold Price ────────────────────────────────────────────────────────────
export async function getGoldPrice() {
  return get('/api/stocks/gold');
}

// ── Stock Data ────────────────────────────────────────────────────────────
export async function getStockPrice(symbol) {
  return get(`/api/stocks/${symbol}`);
}

export async function getStockHistory(symbol, period = '1mo') {
  return get(`/api/stocks/${symbol}/history?period=${period}`);
}

export async function getPopularStocks() {
  return get('/api/stocks/popular');
}

// ── Mutual Fund Data ──────────────────────────────────────────────────────
export async function searchMutualFunds(query) {
  return get(`/api/mf/search?q=${encodeURIComponent(query)}`);
}

export async function getMutualFundNAV(schemeCode) {
  return get(`/api/mf/${schemeCode}/latest`);
}

export async function getMutualFundReturns(schemeCode) {
  return get(`/api/mf/${schemeCode}/returns`);
}

export async function getPopularFunds() {
  return get('/api/mf/popular');
}

// ══════════════════════════════════════════════════════════════════════════
// AUTHENTICATION APIs (Requires Supabase)
// ══════════════════════════════════════════════════════════════════════════

export async function authStatus() {
  return get('/api/auth/status');
}

export async function signUp(email, password) {
  return post('/api/auth/signup', { email, password });
}

export async function signIn(email, password) {
  return post('/api/auth/signin', { email, password });
}

export async function signOut() {
  const token = localStorage.getItem('access_token');
  const res = await fetch(`${BASE}/api/auth/signout`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    }
  });
  return res.json();
}

export async function getCurrentUser() {
  const token = localStorage.getItem('access_token');
  if (!token) return { error: 'No token' };
  const res = await fetch(`${BASE}/api/auth/me`, {
    headers: { 'Authorization': `Bearer ${token}` }
  });
  return res.json();
}

export async function resetPassword(email) {
  return post('/api/auth/reset-password', { email });
}

export async function deleteAccount() {
  const token = localStorage.getItem('access_token');
  if (!token) return { error: 'No token' };
  const res = await fetch(`${BASE}/api/auth/delete-account`, {
    method: 'DELETE',
    headers: { 'Authorization': `Bearer ${token}` }
  });
  return res.json();
}

// ══════════════════════════════════════════════════════════════════════════
// USER PROFILE APIs (Requires Supabase + Auth)
// ══════════════════════════════════════════════════════════════════════════

export async function saveUserProfile(profileData) {
  const token = localStorage.getItem('access_token');
  const res = await fetch(`${BASE}/api/profile`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    },
    body: JSON.stringify(profileData)
  });
  return res.json();
}

export async function getUserProfile() {
  const token = localStorage.getItem('access_token');
  const res = await fetch(`${BASE}/api/profile`, {
    headers: { 'Authorization': `Bearer ${token}` }
  });
  return res.json();
}
