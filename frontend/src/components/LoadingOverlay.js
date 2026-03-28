/**
 * LoadingOverlay.js — Full-screen loading state during AI calls.
 */

export function showLoading(msg = 'ArthMitra AI is thinking...') {
  document.getElementById('loading-msg').textContent = msg;
  document.getElementById('loading').classList.remove('hidden');
}

export function hideLoading() {
  document.getElementById('loading').classList.add('hidden');
}
