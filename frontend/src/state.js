/**
 * state.js — Single source of truth for the user's financial profile.
 * All pages read from and write to this object.
 * On profile update, subscribers are notified automatically.
 */

// ══════════════════════════════════════════════════════════════════════════
// AUTH STATE
// ══════════════════════════════════════════════════════════════════════════

export const AuthState = {
  isLoggedIn: false,
  email: null,
  userId: null,

  init() {
    // Load from localStorage on startup
    const token = localStorage.getItem('access_token');
    const email = localStorage.getItem('user_email');
    const userId = localStorage.getItem('user_id');

    if (token && email) {
      this.isLoggedIn = true;
      this.email = email;
      this.userId = userId;
    }
  },

  logout() {
    this.isLoggedIn = false;
    this.email = null;
    this.userId = null;
    localStorage.removeItem('access_token');
    localStorage.removeItem('refresh_token');
    localStorage.removeItem('user_email');
    localStorage.removeItem('user_id');
  }
};

// Initialize auth state on load
AuthState.init();

// ══════════════════════════════════════════════════════════════════════════
// USER FINANCIAL STATE
// ══════════════════════════════════════════════════════════════════════════

export const UserState = {
  // ── Personal ──────────────────────────────────────
  name: '', age: 0, city: '', risk: 'moderate',

  // ── Income ────────────────────────────────────────
  income: 0, otherIncome: 0, hra: 0, rentPaid: 0,

  // ── Expenses (monthly) ────────────────────────────
  expRent: 0, expGroceries: 0, expTransport: 0,
  expFun: 0, expOther: 0, expEmi: 0,

  // ── Investments ───────────────────────────────────
  mf: 0, epf: 0, fd: 0, stocks: 0, emergency: 0, sip: 0,

  // ── Insurance & Tax ───────────────────────────────
  termCover: 0, healthCover: 0, premium: 0, invested80c: 0,

  // ── Goals ─────────────────────────────────────────
  fireAge: 50, goal: 'fire', note: '',
  goalType: '', goalLabel: '', goalAmount: 0, goalTimeline: 0, goalContext: '',

  // ── Computed ──────────────────────────────────────
  healthScore: 0,
  ready: false,

  // ── Subscribers ───────────────────────────────────
  _listeners: [],

  update(patch) {
    Object.assign(this, patch);
    this._listeners.forEach(fn => fn(this));
  },

  subscribe(fn) {
    this._listeners.push(fn);
  },

  // ── Derived helpers ───────────────────────────────
  get totalExpenses() {
    return this.expRent + this.expGroceries + this.expTransport
      + this.expFun + this.expOther + this.expEmi;
  },
  get takeHome() {
    return Math.round((this.income + this.otherIncome) * 0.75 / 12);
  },
  get surplus() {
    return this.takeHome - this.totalExpenses;
  },
  get netWorth() {
    return this.mf + this.epf + this.fd + this.stocks + this.emergency;
  },
  get requiredEmergency() {
    return this.totalExpenses * 6;
  },
  get remaining80c() {
    return Math.max(0, 150000 - this.invested80c);
  },
  get recommendedTermCover() {
    return this.income * 10;
  },

  /** Return a plain object safe to send to the backend */
  toJSON() {
    const keys = ['name','age','city','risk','income','otherIncome','hra','rentPaid',
      'expRent','expGroceries','expTransport','expFun','expOther','expEmi',
      'mf','epf','fd','stocks','emergency','sip',
      'termCover','healthCover','premium','invested80c',
      'fireAge','goal','note','healthScore','goalType','goalLabel','goalAmount','goalTimeline','goalContext'];
    return Object.fromEntries(keys.map(k => [k, this[k]]));
  },

  /** Reset all state to defaults */
  reset() {
    this.name = ''; this.age = 0; this.city = ''; this.risk = 'moderate';
    this.income = 0; this.otherIncome = 0; this.hra = 0; this.rentPaid = 0;
    this.expRent = 0; this.expGroceries = 0; this.expTransport = 0;
    this.expFun = 0; this.expOther = 0; this.expEmi = 0;
    this.mf = 0; this.epf = 0; this.fd = 0; this.stocks = 0; this.emergency = 0; this.sip = 0;
    this.termCover = 0; this.healthCover = 0; this.premium = 0; this.invested80c = 0;
    this.fireAge = 50; this.goal = 'fire'; this.note = '';
    this.goalType = ''; this.goalLabel = ''; this.goalAmount = 0; this.goalTimeline = 0; this.goalContext = '';
    this.healthScore = 0; this.ready = false;
    this._listeners.forEach(fn => fn(this));
  }
};
