/**
 * Header.js — Top navigation bar.
 */
import { UserState } from '../state.js';

export function renderHeader() {
  const hdrScore = document.getElementById('hdr-score');
  UserState.subscribe(u => {
    if (u.ready) hdrScore.textContent = `Score: ${u.healthScore}`;
  });
}
