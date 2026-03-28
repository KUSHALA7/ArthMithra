/**
 * Auth.js — Sign In / Sign Up page with modern UI
 */
import { signIn, signUp, authStatus, resetPassword, getUserProfile, deleteAccount } from '../api.js';
import { navigateTo } from '../main.js';
import { AuthState, UserState } from '../state.js';
import { fmt } from '../utils.js';

export async function renderAuth(container) {
  // Check if auth is configured
  let authConfigured = false;
  try {
    const status = await authStatus();
    authConfigured = status.configured;
  } catch (e) {
    authConfigured = false;
  }

  if (!authConfigured) {
    container.innerHTML = `
      <div style="min-height:80vh;display:flex;align-items:center;justify-content:center;">
        <div class="card" style="max-width:400px;text-align:center;padding:2rem;">
          <div style="width:60px;height:60px;background:var(--gold);border-radius:12px;display:flex;align-items:center;justify-content:center;margin:0 auto 1.5rem;font-size:28px;color:white;font-weight:700;">₹</div>
          <div style="font-size:24px;font-weight:700;margin-bottom:8px;"><span style="color:var(--ink);">Arth</span><span style="color:var(--gold);">Mitra</span></div>
          <div style="font-size:14px;color:var(--ink-60);margin-bottom:1.5rem;">Authentication Not Configured</div>
          <div style="font-size:13px;color:var(--ink-40);margin-bottom:1.5rem;">
            Add SUPABASE_URL and SUPABASE_ANON_KEY to backend/.env
          </div>
          <button class="btn btn-ghost" onclick="window.location.href='/'">← Back to Dashboard</button>
        </div>
      </div>`;
    return;
  }

  // Check if already logged in
  if (AuthState.isLoggedIn) {
    await renderAccountPage(container);
    return;
  }

  // Show modern login/signup form
  container.innerHTML = `
    <div style="min-height:80vh;display:flex;align-items:center;justify-content:center;padding:2rem;">
      <div class="card" style="max-width:400px;width:100%;padding:2rem;">
        <!-- Logo -->
        <div style="text-align:center;margin-bottom:2rem;">
          <div style="width:56px;height:56px;background:var(--gold);border-radius:12px;display:flex;align-items:center;justify-content:center;margin:0 auto 1rem;font-size:24px;color:white;font-weight:700;">₹</div>
          <div style="font-size:20px;font-weight:700;"><span style="color:var(--ink);">Arth</span><span style="color:var(--gold);">Mitra</span></div>
        </div>

        <!-- Welcome Text -->
        <div id="welcome-text" style="text-align:center;margin-bottom:1.5rem;">
          <div style="font-size:22px;font-weight:600;color:var(--ink);margin-bottom:4px;">Welcome Back</div>
          <div style="font-size:14px;color:var(--ink-60);">Sign in to continue</div>
        </div>

        <form id="auth-form">
          <div style="margin-bottom:1rem;">
            <label style="display:block;font-size:12px;font-weight:600;color:var(--ink-60);margin-bottom:6px;text-transform:uppercase;letter-spacing:0.5px;">Email</label>
            <input type="email" id="email" required style="width:100%;padding:12px 14px;border:1px solid var(--ink-10);border-radius:8px;font-size:14px;transition:border-color 0.2s;" placeholder="you@example.com">
          </div>

          <div style="margin-bottom:1rem;">
            <label style="display:block;font-size:12px;font-weight:600;color:var(--ink-60);margin-bottom:6px;text-transform:uppercase;letter-spacing:0.5px;">Password</label>
            <input type="password" id="password" required minlength="6" style="width:100%;padding:12px 14px;border:1px solid var(--ink-10);border-radius:8px;font-size:14px;transition:border-color 0.2s;" placeholder="••••••••">
          </div>

          <div id="confirm-group" style="display:none;margin-bottom:1rem;">
            <label style="display:block;font-size:12px;font-weight:600;color:var(--ink-60);margin-bottom:6px;text-transform:uppercase;letter-spacing:0.5px;">Confirm Password</label>
            <input type="password" id="confirm-password" style="width:100%;padding:12px 14px;border:1px solid var(--ink-10);border-radius:8px;font-size:14px;transition:border-color 0.2s;" placeholder="••••••••">
          </div>

          <div id="auth-error" style="display:none;background:var(--crimson-light);color:var(--crimson);padding:12px;border-radius:8px;margin-bottom:1rem;font-size:13px;text-align:center;"></div>
          <div id="auth-success" style="display:none;background:var(--emerald-light);color:var(--emerald);padding:12px;border-radius:8px;margin-bottom:1rem;font-size:13px;text-align:center;"></div>

          <button type="submit" class="btn btn-gold" style="width:100%;padding:12px;font-size:15px;font-weight:600;" id="submit-btn">Sign In</button>
        </form>

        <!-- Toggle Sign In/Up -->
        <div id="toggle-auth" style="text-align:center;margin-top:1.25rem;">
          <span style="font-size:13px;color:var(--ink-60);">Don't have an account? </span>
          <a href="#" id="toggle-link" style="font-size:13px;color:var(--gold);text-decoration:none;font-weight:600;">Sign Up</a>
        </div>

        <!-- Forgot Password -->
        <div id="forgot-link" style="text-align:center;margin-top:0.75rem;">
          <a href="#" id="forgot-password-link" style="font-size:13px;color:var(--ink-40);text-decoration:none;">Forgot password?</a>
        </div>

        <!-- Divider -->
        <div style="display:flex;align-items:center;margin:1.5rem 0;">
          <div style="flex:1;height:1px;background:var(--ink-10);"></div>
          <span style="padding:0 1rem;font-size:12px;color:var(--ink-40);">or</span>
          <div style="flex:1;height:1px;background:var(--ink-10);"></div>
        </div>

        <!-- Continue as Guest -->
        <button id="guest-btn" style="width:100%;padding:12px;border:1px solid var(--ink-20);border-radius:8px;background:transparent;font-size:14px;font-weight:500;color:var(--ink);cursor:pointer;transition:all 0.2s;">
          Continue as Guest
        </button>
        <div style="text-align:center;margin-top:0.75rem;font-size:11px;color:var(--ink-40);">
          Guest data is stored locally and won't sync across devices
        </div>
      </div>
    </div>

    <!-- Forgot Password Modal -->
    <div id="forgot-modal" style="display:none;position:fixed;top:0;left:0;right:0;bottom:0;background:rgba(0,0,0,0.5);z-index:1000;align-items:center;justify-content:center;">
      <div class="card" style="max-width:400px;width:90%;margin:auto;padding:1.5rem;position:relative;">
        <button id="close-forgot-modal" style="position:absolute;top:12px;right:12px;border:none;background:none;font-size:20px;cursor:pointer;color:var(--ink-40);">×</button>
        <div style="font-weight:600;font-size:18px;margin-bottom:8px;">Reset Password</div>
        <div style="font-size:13px;color:var(--ink-60);margin-bottom:1.5rem;">
          Enter your email address and we'll send you a link to reset your password.
        </div>
        <form id="forgot-form">
          <div style="margin-bottom:1rem;">
            <label style="display:block;font-size:12px;font-weight:600;color:var(--ink-60);margin-bottom:6px;text-transform:uppercase;letter-spacing:0.5px;">Email</label>
            <input type="email" id="forgot-email" required style="width:100%;padding:12px 14px;border:1px solid var(--ink-10);border-radius:8px;font-size:14px;" placeholder="you@example.com">
          </div>
          <div id="forgot-error" style="display:none;background:var(--crimson-light);color:var(--crimson);padding:12px;border-radius:8px;margin-bottom:1rem;font-size:13px;text-align:center;"></div>
          <div id="forgot-success" style="display:none;background:var(--emerald-light);color:var(--emerald);padding:12px;border-radius:8px;margin-bottom:1rem;font-size:13px;text-align:center;"></div>
          <button type="submit" class="btn btn-gold" style="width:100%;padding:12px;font-size:15px;" id="forgot-submit-btn">Send Reset Link</button>
        </form>
      </div>
    </div>`;

  // State
  let isSignUp = false;
  const welcomeText = container.querySelector('#welcome-text');
  const confirmGroup = container.querySelector('#confirm-group');
  const forgotLink = container.querySelector('#forgot-link');
  const submitBtn = container.querySelector('#submit-btn');
  const toggleLink = container.querySelector('#toggle-link');
  const toggleAuth = container.querySelector('#toggle-auth');

  // Toggle between Sign In and Sign Up
  toggleLink.addEventListener('click', (e) => {
    e.preventDefault();
    isSignUp = !isSignUp;

    if (isSignUp) {
      welcomeText.innerHTML = `
        <div style="font-size:22px;font-weight:600;color:var(--ink);margin-bottom:4px;">Create Account</div>
        <div style="font-size:14px;color:var(--ink-60);">Sign up to get started</div>`;
      confirmGroup.style.display = 'block';
      forgotLink.style.display = 'none';
      submitBtn.textContent = 'Create Account';
      toggleAuth.innerHTML = `
        <span style="font-size:13px;color:var(--ink-60);">Already have an account? </span>
        <a href="#" id="toggle-link" style="font-size:13px;color:var(--gold);text-decoration:none;font-weight:600;">Sign In</a>`;
    } else {
      welcomeText.innerHTML = `
        <div style="font-size:22px;font-weight:600;color:var(--ink);margin-bottom:4px;">Welcome Back</div>
        <div style="font-size:14px;color:var(--ink-60);">Sign in to continue</div>`;
      confirmGroup.style.display = 'none';
      forgotLink.style.display = 'block';
      submitBtn.textContent = 'Sign In';
      toggleAuth.innerHTML = `
        <span style="font-size:13px;color:var(--ink-60);">Don't have an account? </span>
        <a href="#" id="toggle-link" style="font-size:13px;color:var(--gold);text-decoration:none;font-weight:600;">Sign Up</a>`;
    }

    // Re-attach toggle listener
    container.querySelector('#toggle-link').addEventListener('click', arguments.callee.bind(null, e));
  });

  // Guest button
  container.querySelector('#guest-btn').addEventListener('click', () => {
    navigateTo('dashboard');
  });

  // Forgot Password Modal
  const forgotModal = container.querySelector('#forgot-modal');
  const forgotPasswordLink = container.querySelector('#forgot-password-link');
  const closeForgotModal = container.querySelector('#close-forgot-modal');
  const forgotForm = container.querySelector('#forgot-form');
  const forgotError = container.querySelector('#forgot-error');
  const forgotSuccess = container.querySelector('#forgot-success');
  const forgotSubmitBtn = container.querySelector('#forgot-submit-btn');

  forgotPasswordLink.addEventListener('click', (e) => {
    e.preventDefault();
    forgotModal.style.display = 'flex';
    forgotError.style.display = 'none';
    forgotSuccess.style.display = 'none';
  });

  closeForgotModal.addEventListener('click', () => {
    forgotModal.style.display = 'none';
  });

  forgotModal.addEventListener('click', (e) => {
    if (e.target === forgotModal) {
      forgotModal.style.display = 'none';
    }
  });

  forgotForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    forgotError.style.display = 'none';
    forgotSuccess.style.display = 'none';

    const email = container.querySelector('#forgot-email').value;
    forgotSubmitBtn.disabled = true;
    forgotSubmitBtn.textContent = 'Sending...';

    try {
      const result = await resetPassword(email);
      if (result.error) {
        throw new Error(result.error);
      }
      forgotSuccess.textContent = 'Password reset email sent! Check your inbox.';
      forgotSuccess.style.display = 'block';
      forgotSubmitBtn.textContent = 'Email Sent';
    } catch (err) {
      forgotError.textContent = err.message || 'Failed to send reset email';
      forgotError.style.display = 'block';
      forgotSubmitBtn.textContent = 'Send Reset Link';
    }

    forgotSubmitBtn.disabled = false;
  });

  // Form submission
  const form = container.querySelector('#auth-form');
  const errorEl = container.querySelector('#auth-error');
  const successEl = container.querySelector('#auth-success');

  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    errorEl.style.display = 'none';
    successEl.style.display = 'none';

    const email = container.querySelector('#email').value;
    const password = container.querySelector('#password').value;

    if (isSignUp) {
      const confirmPass = container.querySelector('#confirm-password').value;
      if (password !== confirmPass) {
        errorEl.textContent = 'Passwords do not match';
        errorEl.style.display = 'block';
        return;
      }
    }

    submitBtn.disabled = true;
    submitBtn.textContent = isSignUp ? 'Creating...' : 'Signing in...';

    try {
      if (isSignUp) {
        const result = await signUp(email, password);
        if (result.error) {
          throw new Error(result.error);
        }
        successEl.textContent = 'Account created! You can now sign in.';
        successEl.style.display = 'block';
        submitBtn.textContent = 'Create Account';

        // Switch to sign in after successful signup
        setTimeout(() => {
          isSignUp = false;
          welcomeText.innerHTML = `
            <div style="font-size:22px;font-weight:600;color:var(--ink);margin-bottom:4px;">Welcome Back</div>
            <div style="font-size:14px;color:var(--ink-60);">Sign in to continue</div>`;
          confirmGroup.style.display = 'none';
          forgotLink.style.display = 'block';
          submitBtn.textContent = 'Sign In';
          toggleAuth.innerHTML = `
            <span style="font-size:13px;color:var(--ink-60);">Don't have an account? </span>
            <a href="#" id="toggle-link" style="font-size:13px;color:var(--gold);text-decoration:none;font-weight:600;">Sign Up</a>`;
        }, 2000);
      } else {
        const result = await signIn(email, password);
        if (result.error) {
          throw new Error(result.error);
        }
        // Save tokens
        localStorage.setItem('access_token', result.access_token);
        localStorage.setItem('refresh_token', result.refresh_token);
        localStorage.setItem('user_email', result.email);
        localStorage.setItem('user_id', result.user_id);

        // Update auth state
        AuthState.isLoggedIn = true;
        AuthState.email = result.email;
        AuthState.userId = result.user_id;

        // Load user profile from cloud
        await loadUserProfile();

        successEl.textContent = 'Signed in successfully!';
        successEl.style.display = 'block';

        setTimeout(() => navigateTo('dashboard'), 800);
      }
    } catch (err) {
      errorEl.textContent = err.message || 'Authentication failed';
      errorEl.style.display = 'block';
      submitBtn.textContent = isSignUp ? 'Create Account' : 'Sign In';
    }

    submitBtn.disabled = false;
  });
}

async function renderAccountPage(container) {
  container.innerHTML = `
    <div style="min-height:80vh;display:flex;align-items:center;justify-content:center;padding:2rem;">
      <div class="card" style="max-width:450px;width:100%;padding:2rem;">
        <!-- Profile Header -->
        <div style="text-align:center;margin-bottom:1.5rem;">
          <div style="width:70px;height:70px;background:linear-gradient(135deg, var(--gold) 0%, var(--gold-dark, #c4941a) 100%);border-radius:50%;display:flex;align-items:center;justify-content:center;margin:0 auto 1rem;font-size:28px;color:white;font-weight:600;">
            ${AuthState.email ? AuthState.email[0].toUpperCase() : '?'}
          </div>
          <div style="font-size:18px;font-weight:600;color:var(--ink);">${AuthState.email || 'User'}</div>
          <div style="font-size:13px;color:var(--emerald);display:flex;align-items:center;justify-content:center;gap:4px;margin-top:4px;">
            <span style="width:6px;height:6px;background:var(--emerald);border-radius:50%;"></span>
            Logged in
          </div>
        </div>

        <!-- Stored Profile Section -->
        <div style="background:var(--surface-2, #f8f9fa);border-radius:12px;padding:1rem;margin-bottom:1.5rem;">
          <div style="font-weight:600;font-size:14px;margin-bottom:12px;display:flex;align-items:center;gap:8px;color:var(--ink);">
            <span>📊</span> Your Saved Profile
          </div>
          <div id="profile-data" style="font-size:13px;color:var(--ink-60);">
            <div style="text-align:center;padding:1rem;">Loading profile...</div>
          </div>
        </div>

        <!-- Action Buttons -->
        <div style="display:flex;flex-direction:column;gap:10px;">
          <button class="btn btn-gold" style="width:100%;padding:12px;font-size:14px;font-weight:600;" id="sync-btn">
            <span style="margin-right:6px;">☁️</span> Sync Profile to Cloud
          </button>

          <!-- Export Buttons -->
          <div style="display:grid;grid-template-columns:1fr 1fr;gap:8px;">
            <button class="btn btn-ghost" style="padding:10px;font-size:13px;" id="export-json-btn">
              <span style="margin-right:4px;">📄</span> Export JSON
            </button>
            <button class="btn btn-ghost" style="padding:10px;font-size:13px;" id="export-pdf-btn">
              <span style="margin-right:4px;">📑</span> Export PDF
            </button>
          </div>

          <button id="logout-btn" style="width:100%;padding:12px;border:1px solid var(--crimson-light);border-radius:8px;background:transparent;font-size:14px;font-weight:500;color:var(--crimson);cursor:pointer;transition:all 0.2s;">
            Sign Out
          </button>
        </div>

        <!-- Danger Zone -->
        <div style="margin-top:1.5rem;padding-top:1.5rem;border-top:1px solid var(--ink-10);">
          <div style="font-size:11px;font-weight:600;text-transform:uppercase;letter-spacing:0.05em;color:var(--crimson);margin-bottom:10px;">
            Danger Zone
          </div>
          <button id="delete-account-btn" style="width:100%;padding:12px;border:1px solid var(--crimson);border-radius:8px;background:transparent;font-size:14px;font-weight:500;color:var(--crimson);cursor:pointer;transition:all 0.2s;">
            🗑️ Delete Account & Data
          </button>
        </div>
      </div>
    </div>

    <!-- Delete Confirmation Modal -->
    <div id="delete-modal" style="display:none;position:fixed;top:0;left:0;right:0;bottom:0;background:rgba(0,0,0,0.6);z-index:1000;align-items:center;justify-content:center;">
      <div class="card" style="max-width:400px;width:90%;margin:auto;padding:1.5rem;position:relative;">
        <div style="text-align:center;margin-bottom:1rem;">
          <div style="font-size:48px;margin-bottom:8px;">⚠️</div>
          <div style="font-weight:600;font-size:18px;color:var(--crimson);margin-bottom:4px;">Delete Account?</div>
          <div style="font-size:13px;color:var(--ink-60);">
            This will permanently delete your profile and all data. This action cannot be undone.
          </div>
        </div>
        <div style="background:var(--crimson-light);border-radius:8px;padding:10px;margin-bottom:1rem;">
          <div style="font-size:12px;color:var(--crimson);text-align:center;">
            Type <strong>DELETE</strong> to confirm
          </div>
          <input type="text" id="delete-confirm-input" style="width:100%;padding:10px;border:1px solid var(--crimson);border-radius:6px;font-size:14px;text-align:center;margin-top:8px;" placeholder="Type DELETE">
        </div>
        <div style="display:flex;gap:10px;">
          <button id="cancel-delete-btn" class="btn btn-ghost" style="flex:1;padding:12px;">Cancel</button>
          <button id="confirm-delete-btn" style="flex:1;padding:12px;border:none;border-radius:8px;background:var(--crimson);color:white;font-size:14px;font-weight:600;cursor:pointer;opacity:0.5;" disabled>Delete Forever</button>
        </div>
      </div>
    </div>`;

  container.querySelector('#logout-btn').addEventListener('click', handleLogout);
  container.querySelector('#sync-btn').addEventListener('click', handleSyncProfile);
  container.querySelector('#export-json-btn').addEventListener('click', handleExportJSON);
  container.querySelector('#export-pdf-btn').addEventListener('click', handleExportPDF);

  // Delete account handlers
  const deleteModal = container.querySelector('#delete-modal');
  const deleteInput = container.querySelector('#delete-confirm-input');
  const confirmDeleteBtn = container.querySelector('#confirm-delete-btn');

  container.querySelector('#delete-account-btn').addEventListener('click', () => {
    deleteModal.style.display = 'flex';
    deleteInput.value = '';
    confirmDeleteBtn.disabled = true;
    confirmDeleteBtn.style.opacity = '0.5';
  });

  container.querySelector('#cancel-delete-btn').addEventListener('click', () => {
    deleteModal.style.display = 'none';
  });

  deleteModal.addEventListener('click', (e) => {
    if (e.target === deleteModal) deleteModal.style.display = 'none';
  });

  deleteInput.addEventListener('input', () => {
    const isValid = deleteInput.value === 'DELETE';
    confirmDeleteBtn.disabled = !isValid;
    confirmDeleteBtn.style.opacity = isValid ? '1' : '0.5';
  });

  confirmDeleteBtn.addEventListener('click', handleDeleteAccount);

  // Load and display stored profile
  try {
    const result = await getUserProfile();
    if (result.success && result.profile) {
      displayStoredProfile(container, result.profile, result.updated_at);
    } else {
      container.querySelector('#profile-data').innerHTML = `
        <div style="text-align:center;padding:0.5rem;">
          <div style="font-size:32px;margin-bottom:8px;">📋</div>
          <div style="font-weight:500;color:var(--ink);margin-bottom:4px;">No profile saved yet</div>
          <div style="font-size:12px;color:var(--ink-40);">Complete your profile in Health Score and sync to cloud</div>
        </div>`;
    }
  } catch (err) {
    container.querySelector('#profile-data').innerHTML = `
      <div style="text-align:center;color:var(--crimson);padding:0.5rem;">Failed to load profile</div>`;
  }
}

function displayStoredProfile(container, profile, updatedAt) {
  const formatDate = (dateStr) => {
    if (!dateStr) return 'Unknown';
    const date = new Date(dateStr);
    return date.toLocaleDateString('en-IN', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const netWorth = (profile.mf || 0) + (profile.epf || 0) + (profile.fd || 0) + (profile.stocks || 0) + (profile.emergency || 0);

  const profileHtml = `
    <div style="font-size:11px;color:var(--ink-40);margin-bottom:10px;text-align:right;">
      Last synced: ${formatDate(updatedAt)}
    </div>

    ${profile.name ? `
    <div style="margin-bottom:12px;padding-bottom:12px;border-bottom:1px solid var(--ink-10);">
      <div style="font-weight:600;font-size:16px;color:var(--ink);">${profile.name}</div>
      <div style="font-size:12px;color:var(--ink-60);">${profile.age || '?'} years · ${profile.city || 'Unknown'}</div>
    </div>
    ` : ''}

    <div style="display:grid;grid-template-columns:1fr 1fr;gap:10px;">
      <div style="background:white;padding:10px;border-radius:8px;border:1px solid var(--ink-05);">
        <div style="font-size:10px;color:var(--ink-40);text-transform:uppercase;letter-spacing:0.5px;">Income</div>
        <div style="font-weight:600;font-size:15px;color:var(--emerald);">₹${fmt(profile.income || 0)}/yr</div>
      </div>
      <div style="background:white;padding:10px;border-radius:8px;border:1px solid var(--ink-05);">
        <div style="font-size:10px;color:var(--ink-40);text-transform:uppercase;letter-spacing:0.5px;">Health Score</div>
        <div style="font-weight:600;font-size:15px;color:var(--gold);">${profile.healthScore || 0}/100</div>
      </div>
      <div style="background:white;padding:10px;border-radius:8px;border:1px solid var(--ink-05);">
        <div style="font-size:10px;color:var(--ink-40);text-transform:uppercase;letter-spacing:0.5px;">Net Worth</div>
        <div style="font-weight:600;font-size:15px;color:var(--ink);">₹${fmt(netWorth)}</div>
      </div>
      <div style="background:white;padding:10px;border-radius:8px;border:1px solid var(--ink-05);">
        <div style="font-size:10px;color:var(--ink-40);text-transform:uppercase;letter-spacing:0.5px;">Risk Profile</div>
        <div style="font-weight:600;font-size:15px;color:var(--ink);text-transform:capitalize;">${profile.risk || 'Moderate'}</div>
      </div>
    </div>

    ${netWorth > 0 ? `
    <div style="margin-top:12px;">
      <div style="font-size:11px;font-weight:600;color:var(--ink-60);margin-bottom:8px;">Investment Breakdown</div>
      <div style="display:flex;flex-wrap:wrap;gap:6px;">
        ${profile.mf ? `<span style="background:var(--gold-light);color:var(--gold);padding:5px 10px;border-radius:6px;font-size:11px;font-weight:500;">MF ₹${fmt(profile.mf)}</span>` : ''}
        ${profile.epf ? `<span style="background:var(--emerald-light);color:var(--emerald);padding:5px 10px;border-radius:6px;font-size:11px;font-weight:500;">EPF ₹${fmt(profile.epf)}</span>` : ''}
        ${profile.fd ? `<span style="background:#e3f2fd;color:#1976d2;padding:5px 10px;border-radius:6px;font-size:11px;font-weight:500;">FD ₹${fmt(profile.fd)}</span>` : ''}
        ${profile.stocks ? `<span style="background:var(--crimson-light);color:var(--crimson);padding:5px 10px;border-radius:6px;font-size:11px;font-weight:500;">Stocks ₹${fmt(profile.stocks)}</span>` : ''}
        ${profile.emergency ? `<span style="background:var(--ink-10);color:var(--ink-60);padding:5px 10px;border-radius:6px;font-size:11px;font-weight:500;">Emergency ₹${fmt(profile.emergency)}</span>` : ''}
      </div>
    </div>
    ` : ''}`;

  container.querySelector('#profile-data').innerHTML = profileHtml;
}

async function loadUserProfile() {
  try {
    const result = await getUserProfile();
    if (result.success && result.profile) {
      const profile = result.profile;
      UserState.update({
        name: profile.name || '',
        age: profile.age || 0,
        city: profile.city || '',
        risk: profile.risk || 'moderate',
        income: profile.income || 0,
        otherIncome: profile.otherIncome || 0,
        hra: profile.hra || 0,
        rentPaid: profile.rentPaid || 0,
        expRent: profile.expRent || 0,
        expGroceries: profile.expGroceries || 0,
        expTransport: profile.expTransport || 0,
        expFun: profile.expFun || 0,
        expOther: profile.expOther || 0,
        expEmi: profile.expEmi || 0,
        mf: profile.mf || 0,
        epf: profile.epf || 0,
        fd: profile.fd || 0,
        stocks: profile.stocks || 0,
        emergency: profile.emergency || 0,
        sip: profile.sip || 0,
        termCover: profile.termCover || 0,
        healthCover: profile.healthCover || 0,
        premium: profile.premium || 0,
        invested80c: profile.invested80c || 0,
        fireAge: profile.fireAge || 50,
        goal: profile.goal || 'fire',
        note: profile.note || '',
        healthScore: profile.healthScore || 0,
        ready: profile.name ? true : false
      });
    }
  } catch (err) {
    console.error('Failed to load user profile:', err);
  }
}

async function handleLogout() {
  localStorage.removeItem('access_token');
  localStorage.removeItem('refresh_token');
  localStorage.removeItem('user_email');
  localStorage.removeItem('user_id');

  AuthState.isLoggedIn = false;
  AuthState.email = null;
  AuthState.userId = null;

  navigateTo('auth');
}

async function handleSyncProfile() {
  const { saveUserProfile } = await import('../api.js');

  const btn = document.querySelector('#sync-btn');
  const originalText = btn.innerHTML;
  btn.disabled = true;
  btn.innerHTML = '<span style="margin-right:6px;">⏳</span> Syncing...';

  try {
    const result = await saveUserProfile(UserState.toJSON());
    if (result.error) {
      throw new Error(result.error);
    }
    btn.innerHTML = '<span style="margin-right:6px;">✓</span> Synced!';
    btn.style.background = 'var(--emerald)';

    setTimeout(() => {
      navigateTo('auth');
    }, 1000);
  } catch (err) {
    btn.innerHTML = '<span style="margin-right:6px;">✗</span> Sync Failed';
    btn.style.background = 'var(--crimson)';
    setTimeout(() => {
      btn.innerHTML = originalText;
      btn.style.background = '';
      btn.disabled = false;
    }, 2000);
  }
}

function handleExportJSON() {
  const profile = UserState.toJSON();
  const dataStr = JSON.stringify(profile, null, 2);
  const blob = new Blob([dataStr], { type: 'application/json' });
  const url = URL.createObjectURL(blob);

  const a = document.createElement('a');
  a.href = url;
  a.download = `arthmitra-profile-${new Date().toISOString().split('T')[0]}.json`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

function handleExportPDF() {
  const profile = UserState.toJSON();
  const netWorth = (profile.mf || 0) + (profile.epf || 0) + (profile.fd || 0) + (profile.stocks || 0) + (profile.emergency || 0);
  const totalExpenses = (profile.expRent || 0) + (profile.expGroceries || 0) + (profile.expTransport || 0) + (profile.expFun || 0) + (profile.expOther || 0) + (profile.expEmi || 0);

  const printWindow = window.open('', '_blank');
  printWindow.document.write(`
    <!DOCTYPE html>
    <html>
    <head>
      <title>ArthMitra Financial Profile</title>
      <style>
        * { margin: 0; padding: 0; box-sizing: border-box; }
        body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; padding: 40px; color: #0D1117; line-height: 1.6; }
        .header { text-align: center; margin-bottom: 30px; padding-bottom: 20px; border-bottom: 2px solid #C9933A; }
        .logo { font-size: 28px; font-weight: 700; margin-bottom: 5px; }
        .logo em { color: #C9933A; font-style: normal; }
        .date { font-size: 12px; color: #666; }
        .section { margin-bottom: 25px; }
        .section-title { font-size: 14px; font-weight: 600; text-transform: uppercase; letter-spacing: 0.05em; color: #C9933A; margin-bottom: 12px; padding-bottom: 6px; border-bottom: 1px solid #eee; }
        .grid { display: grid; grid-template-columns: 1fr 1fr; gap: 15px; }
        .item { background: #f8f9fa; padding: 12px; border-radius: 8px; }
        .item-label { font-size: 10px; text-transform: uppercase; letter-spacing: 0.05em; color: #666; margin-bottom: 4px; }
        .item-value { font-size: 18px; font-weight: 600; }
        .highlight { background: linear-gradient(135deg, #C9933A 0%, #8B6420 100%); color: white; }
        .highlight .item-label { color: rgba(255,255,255,0.8); }
        .score-ring { width: 100px; height: 100px; margin: 0 auto 15px; position: relative; }
        .score-ring svg { transform: rotate(-90deg); }
        .score-center { position: absolute; top: 50%; left: 50%; transform: translate(-50%, -50%); text-align: center; }
        .score-num { font-size: 28px; font-weight: 700; }
        .footer { margin-top: 40px; padding-top: 20px; border-top: 1px solid #eee; text-align: center; font-size: 11px; color: #999; }
        @media print { body { padding: 20px; } }
      </style>
    </head>
    <body>
      <div class="header">
        <div class="logo">Arth<em>Mitra</em></div>
        <div style="font-size:14px;color:#666;">AI-Powered Financial Profile</div>
        <div class="date">Generated on ${new Date().toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' })}</div>
      </div>

      <div class="section">
        <div class="section-title">Personal Information</div>
        <div class="grid">
          <div class="item"><div class="item-label">Name</div><div class="item-value">${profile.name || 'Not set'}</div></div>
          <div class="item"><div class="item-label">Age</div><div class="item-value">${profile.age || '-'} years</div></div>
          <div class="item"><div class="item-label">City</div><div class="item-value">${profile.city || 'Not set'}</div></div>
          <div class="item"><div class="item-label">Risk Profile</div><div class="item-value" style="text-transform:capitalize;">${profile.risk || 'Moderate'}</div></div>
        </div>
      </div>

      <div class="section">
        <div class="section-title">Financial Health Score</div>
        <div style="text-align:center;">
          <div class="score-ring">
            <svg width="100" height="100">
              <circle cx="50" cy="50" r="45" fill="none" stroke="#eee" stroke-width="8"/>
              <circle cx="50" cy="50" r="45" fill="none" stroke="#C9933A" stroke-width="8" stroke-linecap="round"
                stroke-dasharray="${(profile.healthScore || 0) * 2.83} 283" />
            </svg>
            <div class="score-center">
              <div class="score-num">${profile.healthScore || 0}</div>
              <div style="font-size:10px;color:#666;">/ 100</div>
            </div>
          </div>
        </div>
      </div>

      <div class="section">
        <div class="section-title">Income & Expenses</div>
        <div class="grid">
          <div class="item highlight"><div class="item-label">Annual Income</div><div class="item-value">₹${fmt(profile.income || 0)}</div></div>
          <div class="item"><div class="item-label">Monthly Expenses</div><div class="item-value">₹${fmt(totalExpenses)}</div></div>
          <div class="item"><div class="item-label">Monthly SIP</div><div class="item-value">₹${fmt(profile.sip || 0)}</div></div>
          <div class="item"><div class="item-label">Insurance Premium</div><div class="item-value">₹${fmt(profile.premium || 0)}/yr</div></div>
        </div>
      </div>

      <div class="section">
        <div class="section-title">Net Worth: ₹${fmt(netWorth)}</div>
        <div class="grid">
          <div class="item"><div class="item-label">Mutual Funds</div><div class="item-value">₹${fmt(profile.mf || 0)}</div></div>
          <div class="item"><div class="item-label">EPF/PPF</div><div class="item-value">₹${fmt(profile.epf || 0)}</div></div>
          <div class="item"><div class="item-label">Fixed Deposits</div><div class="item-value">₹${fmt(profile.fd || 0)}</div></div>
          <div class="item"><div class="item-label">Stocks</div><div class="item-value">₹${fmt(profile.stocks || 0)}</div></div>
          <div class="item"><div class="item-label">Emergency Fund</div><div class="item-value">₹${fmt(profile.emergency || 0)}</div></div>
        </div>
      </div>

      <div class="section">
        <div class="section-title">Insurance Coverage</div>
        <div class="grid">
          <div class="item"><div class="item-label">Term Life Cover</div><div class="item-value">₹${fmt(profile.termCover || 0)}</div></div>
          <div class="item"><div class="item-label">Health Cover</div><div class="item-value">₹${fmt(profile.healthCover || 0)}</div></div>
        </div>
      </div>

      <div class="footer">
        <p>This report was generated by ArthMitra - Your AI Money Mentor</p>
        <p>For personalized financial advice, visit the app at any time.</p>
      </div>

      <script>window.onload = () => { window.print(); }</script>
    </body>
    </html>
  `);
  printWindow.document.close();
}

async function handleDeleteAccount() {
  const btn = document.querySelector('#confirm-delete-btn');
  const originalText = btn.innerHTML;
  btn.disabled = true;
  btn.innerHTML = 'Deleting...';

  try {
    const result = await deleteAccount();
    if (result.error) {
      throw new Error(result.error);
    }

    // Clear local storage
    localStorage.removeItem('access_token');
    localStorage.removeItem('refresh_token');
    localStorage.removeItem('user_email');
    localStorage.removeItem('user_id');

    // Reset states
    AuthState.isLoggedIn = false;
    AuthState.email = null;
    AuthState.userId = null;
    UserState.reset();

    // Show success and redirect
    btn.innerHTML = '✓ Deleted';
    btn.style.background = 'var(--emerald)';

    setTimeout(() => {
      document.querySelector('#delete-modal').style.display = 'none';
      navigateTo('auth');
    }, 1000);
  } catch (err) {
    btn.innerHTML = '✗ Failed';
    setTimeout(() => {
      btn.innerHTML = originalText;
      btn.disabled = false;
    }, 2000);
  }
}
