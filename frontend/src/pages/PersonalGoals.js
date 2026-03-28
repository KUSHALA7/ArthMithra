/**
 * PersonalGoals.js — Personal financial goals tracker with conversational AI interactions.
 */
import { UserState } from '../state.js';
import { analyzeGoals } from '../api.js';
import { showLoading, hideLoading } from '../components/LoadingOverlay.js';
import { navigateTo } from '../main.js';
import { fmtRupee, fmt, createInsightCards, aiBox } from '../utils.js';

// Conversational goal templates with personality
const GOAL_TEMPLATES = [
  {
    id: 'house',
    icon: '🏠',
    label: 'Buy a House',
    defaultAmount: 5000000,
    contextQuestion: "Where are you planning to buy? What's your dream home like?",
    motivation: "🏡 A home is your sanctuary. Let's make it happen!",
    tips: ["Consider location & property appreciation", "Budget for down payment + registration", "Factor in EMI if taking a loan"]
  },
  {
    id: 'car',
    icon: '🚗',
    label: 'Buy a Car',
    defaultAmount: 1500000,
    contextQuestion: "What's your car dream? Sedan, SUV, or EV?",
    motivation: "🏎️ The open road awaits! Let's plan this ride.",
    tips: ["Include insurance & registration costs", "Plan for maintenance & fuel", "Consider depreciation vs loan tenure"]
  },
  {
    id: 'wedding',
    icon: '💒',
    label: 'Wedding',
    defaultAmount: 2500000,
    contextQuestion: "How many guests? Destination or hometown wedding?",
    motivation: "💍 Your special day deserves to be special. Let's celebrate smart!",
    tips: ["Budget for venue, catering, décor", "Don't forget honeymoon expenses", "Plan 1-2 years ahead for best deals"]
  },
  {
    id: 'education',
    icon: '🎓',
    label: 'Education',
    defaultAmount: 1200000,
    contextQuestion: "Which course? Domestic or abroad?",
    motivation: "📚 Education is the best investment. Let's fuel your growth!",
    tips: ["Include tuition, books, accommodation", "Government scholarships can help", "Consider ROI on your qualification"]
  },
  {
    id: 'vacation',
    icon: '✈️',
    label: 'Dream Vacation',
    defaultAmount: 500000,
    contextQuestion: "Dream destination? Are you a beach, mountain, or city person?",
    motivation: "🌍 Life's greatest treasures are memories. Let's make them!",
    tips: ["Travel during off-season for deals", "Package holidays save money", "Travel insurance is essential"]
  },
  {
    id: 'business',
    icon: '💼',
    label: 'Start Business',
    defaultAmount: 2000000,
    contextQuestion: "What's your business idea? Service, product, or digital?",
    motivation: "🚀 Entrepreneurship is the ultimate freedom. Let's build your empire!",
    tips: ["Include working capital buffer", "Plan for 6 months without profit", "Build emergency fund separately"]
  },
  {
    id: 'health',
    icon: '⚕️',
    label: 'Health & Wellness',
    defaultAmount: 800000,
    contextQuestion: "Surgery, fitness, mental health, or holistic wellness?",
    motivation: "💪 Your health is your wealth. Invest in yourself!",
    tips: ["Health insurance can cover emergencies", "Nutrition & fitness are ongoing", "Preventive care saves money long-term"]
  },
  {
    id: 'custom',
    icon: '⭐',
    label: 'Custom Goal',
    defaultAmount: 0,
    contextQuestion: "What's your dream? Tell me about it...",
    motivation: "✨ Every dream is valid. Let's make it real!",
    tips: ["Break big goals into milestones", "Celebrate small wins along the way", "Keep your 'why' in front of you"]
  }
];

export function renderPersonalGoals(container) {
  if (!UserState.ready) {
    container.innerHTML = `<div class="page-hdr"><div class="page-title">Personal Goals</div></div>
      <div style="text-align:center;padding:2rem;">
        <p style="color:var(--ink-60);font-size:13px;">Complete your Financial Health Check first.</p>
        <button class="btn btn-gold" style="margin-top:1rem;" id="go-health">Set Up Profile →</button>
      </div>`;
    container.querySelector('#go-health').addEventListener('click', () => navigateTo('health'));
    return;
  }

  const U = UserState;
  const currentGoal = {
    type: U.goalType || '',
    amount: U.goalAmount || 0,
    label: U.goalLabel || '',
    context: U.goalContext || ''
  };

  container.innerHTML = `
    <div class="page-hdr">
      <div class="page-title">🎯 What's Your Dream?</div>
      <div class="page-sub">Let's build a plan together to make it happen</div>
    </div>

    <!-- Conversation Steps -->
    <div class="conversation-shell">
      <!-- Step 1: Goal Selection -->
      <div id="step-1" class="conversation-step active">
        <div class="conv-greeting">
          <div style="font-size:32px;margin-bottom:8px;">👋</div>
          <div style="font-size:16px;font-weight:600;margin-bottom:6px;">Hey ${U.name}! What's on your mind?</div>
          <div style="font-size:13px;color:var(--ink-60);margin-bottom:1.5rem;">Pick a goal that excites you. Don't worry, we can customize it!</div>
        </div>

        <div class="goals-grid">
          ${GOAL_TEMPLATES.map(goal => `
            <div class="goal-option goal-card-conv ${currentGoal.type === goal.id ? 'selected' : ''}" data-goal-id="${goal.id}">
              <div class="goal-icon" style="font-size:40px;margin-bottom:8px;">${goal.icon}</div>
              <div class="goal-name">${goal.label}</div>
              <div class="goal-desc" style="font-size:11px;margin-top:4px;">→ Click to select</div>
            </div>
          `).join('')}
        </div>

        <button class="btn btn-gold btn-full" id="next-step-1" style="margin-top:1rem;display:none;">Continue →</button>
      </div>

      <!-- Step 2: Amount & Timeline -->
      <div id="step-2" class="conversation-step" style="display:none;">
        <div class="conv-message ai-msg" id="conv-msg-2">
          <div style="font-weight:600;margin-bottom:8px;">💭 Tell me more...</div>
          <div id="context-question" style="color:var(--ink-60);">What's your target amount?</div>
        </div>

        <div class="conv-input-group">
          <div class="fg">
            <label style="font-weight:600;">How much do you need? (₹)</label>
            <div class="pfx">
              <span class="pfx-sym">₹</span>
              <input type="number" id="goal-amount" placeholder="0" style="font-size:16px;font-weight:600;" />
            </div>
            <div style="font-size:11px;color:var(--ink-60);margin-top:6px;">💡 You can adjust this anytime</div>
          </div>

          <div class="fg">
            <label style="font-weight:600;">Timeline (years)</label>
            <input type="number" id="goal-timeline" placeholder="5" min="1" max="50" style="font-size:16px;font-weight:600;" />
            <div style="font-size:11px;color:var(--ink-60);margin-top:6px;">⏰ When do you want to achieve it?</div>
          </div>

          <div class="fg">
            <label style="font-weight:600;">What's your motivation?</label>
            <textarea id="goal-context" placeholder="Share your story... Why is this goal important?" rows="3" style="font-size:14px;resize:vertical;"></textarea>
            <div style="font-size:11px;color:var(--ink-60);margin-top:6px;">📝 Optional, but it helps!</div>
          </div>
        </div>

        <div style="display:flex;gap:8px;margin-top:1rem;">
          <button class="btn btn-ghost" id="back-step-2" style="flex:0.5;">← Back</button>
          <button class="btn btn-gold" id="next-step-2" style="flex:1;">Show me the plan →</button>
        </div>
      </div>

      <!-- Step 3: Plan & Analysis -->
      <div id="step-3" class="conversation-step" style="display:none;">
        <div class="conv-message ai-msg">
          <div style="font-weight:600;margin-bottom:8px;">🎯 Your Personalized Plan</div>
          <div id="feasibility-msg" style="color:var(--ink-60);margin-bottom:12px;">Analyzing your goal...</div>
        </div>

        <!-- Real-time Calculator -->
        <div id="goal-calculator" style="margin-bottom:1.5rem;"></div>

        <!-- Tips Section -->
        <div id="goal-tips" style="margin-bottom:1.5rem;"></div>

        <!-- AI Analysis -->
        <div id="goal-analysis" style="display:none;margin-bottom:1.5rem;"></div>

        <!-- Smart Insights -->
        <div id="insights-section" style="margin-bottom:1.5rem;"></div>

        <!-- Action Buttons -->
        <div style="display:flex;gap:8px;margin-top:1rem;">
          <button class="btn btn-ghost" id="back-step-3" style="flex:0.5;">← Back</button>
          <button class="btn btn-gold" id="analyze-with-ai" style="flex:1;">🤖 Get AI Advice</button>
        </div>
      </div>
    </div>`;

  // ── Step 1: Goal Selection ──
  container.querySelectorAll('.goal-option').forEach(el => {
    el.addEventListener('click', () => {
      container.querySelectorAll('.goal-option').forEach(e => e.classList.remove('selected'));
      el.classList.add('selected');
      const goalId = el.dataset.goalId;
      const template = GOAL_TEMPLATES.find(g => g.id === goalId);
      if (goalId !== 'custom') {
        document.getElementById('goal-amount').value = template.defaultAmount;
      }
      document.getElementById('next-step-1').style.display = 'block';
    });
  });

  document.getElementById('next-step-1').addEventListener('click', () => {
    const selectedEl = container.querySelector('.goal-option.selected');
    if (!selectedEl) {
      alert('Please pick a goal first!');
      return;
    }
    const goalId = selectedEl.dataset.goalId;
    const template = GOAL_TEMPLATES.find(g => g.id === goalId);
    document.getElementById('context-question').textContent = template.contextQuestion;
    if (goalId !== 'custom') {
      document.getElementById('goal-amount').value = template.defaultAmount;
    }
    document.getElementById('step-1').style.display = 'none';
    document.getElementById('step-2').style.display = 'block';
  });

  // ── Step 2: Amount & Timeline ──
  document.getElementById('back-step-2').addEventListener('click', () => {
    document.getElementById('step-2').style.display = 'none';
    document.getElementById('step-1').style.display = 'block';
  });

  document.getElementById('next-step-2').addEventListener('click', () => {
    const selectedEl = container.querySelector('.goal-option.selected');
    const goalId = selectedEl.dataset.goalId;
    const goalAmount = parseInt(document.getElementById('goal-amount').value) || 0;
    const timeline = parseInt(document.getElementById('goal-timeline').value) || 5;
    const context = document.getElementById('goal-context').value || '';
    const template = GOAL_TEMPLATES.find(g => g.id === goalId);

    if (goalAmount <= 0) {
      alert('Please enter an amount greater than 0');
      return;
    }

    // Save & Move to Step 3
    UserState.update({
      goalType: goalId,
      goalLabel: template.label,
      goalAmount: goalAmount,
      goalTimeline: timeline,
      goalContext: context
    });

    renderStep3(container, U, template, goalAmount, timeline);
    document.getElementById('step-2').style.display = 'none';
    document.getElementById('step-3').style.display = 'block';
  });

  // ── Step 3: Analysis ──
  document.getElementById('back-step-3').addEventListener('click', () => {
    document.getElementById('step-3').style.display = 'none';
    document.getElementById('step-2').style.display = 'block';
  });

  document.getElementById('analyze-with-ai').addEventListener('click', () => {
    const selectedEl = container.querySelector('.goal-option.selected');
    const goalId = selectedEl.dataset.goalId;
    const template = GOAL_TEMPLATES.find(g => g.id === goalId);
    const goalAmount = parseInt(document.getElementById('goal-amount').value);
    const timeline = parseInt(document.getElementById('goal-timeline').value);
    analyzeGoalWithAI(goalId, template, goalAmount, timeline);
  });
}

function renderStep3(container, U, template, goalAmount, timeline) {
  const monthlyRequired = goalAmount / (timeline * 12);
  const monthlyInvestment = (goalAmount / (timeline * 12)) * (1 + Math.pow(1.08, timeline) / timeline);
  const progressPercent = Math.min(100, (U.surplus / monthlyRequired) * 100);
  const feasible = U.surplus >= monthlyRequired;

  // Feasibility message
  const feasibilityMsg = feasible
    ? `✅ <strong>Great news!</strong> Your monthly surplus of ₹${fmt(U.surplus)} can cover this goal!`
    : `⚠️ <strong>Challenge ahead:</strong> You need ₹${fmt(monthlyRequired)}/month but have ₹${fmt(U.surplus)}. Need ₹${fmt(monthlyRequired - U.surplus)} more monthly.`;

  document.getElementById('feasibility-msg').innerHTML = feasibilityMsg;

  // Goal calculator
  document.getElementById('goal-calculator').innerHTML = `
    <div class="calculator-card">
      <div style="display:grid;grid-template-columns:repeat(2,1fr);gap:12px;margin-bottom:16px;">
        <div class="calc-item">
          <div style="font-size:10px;text-transform:uppercase;font-weight:600;color:var(--ink-60);margin-bottom:4px;">Target</div>
          <div style="font-size:18px;font-weight:700;color:var(--gold);">${fmtRupee(goalAmount)}</div>
        </div>
        <div class="calc-item">
          <div style="font-size:10px;text-transform:uppercase;font-weight:600;color:var(--ink-60);margin-bottom:4px;">Timeline</div>
          <div style="font-size:18px;font-weight:700;color:var(--gold);">${timeline} yrs</div>
        </div>
        <div class="calc-item">
          <div style="font-size:10px;text-transform:uppercase;font-weight:600;color:var(--ink-60);margin-bottom:4px;">Monthly (Simple)</div>
          <div style="font-size:18px;font-weight:700;color:var(--emerald-mid);">${fmtRupee(Math.round(monthlyRequired))}</div>
        </div>
        <div class="calc-item">
          <div style="font-size:10px;text-transform:uppercase;font-weight:600;color:var(--ink-60);margin-bottom:4px;">With 8% Returns</div>
          <div style="font-size:18px;font-weight:700;color:var(--emerald-mid);">${fmtRupee(Math.round(monthlyInvestment * 0.8))}</div>
        </div>
      </div>

      <div style="margin-bottom:12px;">
        <div style="font-size:11px;font-weight:600;text-transform:uppercase;color:var(--ink-60);margin-bottom:6px;">Your Capability</div>
        <div style="height:32px;background:var(--surface-3);border-radius:10px;overflow:hidden;">
          <div style="width:${Math.min(100, progressPercent)}%;height:100%;background:${progressPercent >= 100 ? 'var(--emerald-mid)' : progressPercent >= 50 ? 'var(--gold)' : 'var(--crimson)'};transition:width 0.3s;display:flex;align-items:center;justify-content:center;color:white;font-weight:600;font-size:11px;">
            ${Math.round(progressPercent)}%
          </div>
        </div>
        <div style="font-size:10px;color:var(--ink-60);margin-top:6px;">Can save ₹${fmt(U.surplus)}/mo • Need ₹${fmt(monthlyRequired)}/mo</div>
      </div>
    </div>
  `;

  // Goal tips
  document.getElementById('goal-tips').innerHTML = `
    <div class="tips-card">
      <div style="font-weight:600;margin-bottom:10px;">💡 Quick Tips</div>
      ${template.tips.map((tip, i) => `
        <div style="display:flex;gap:8px;margin-bottom:6px;">
          <div style="min-width:20px;height:20px;background:var(--gold-light);border-radius:50%;display:flex;align-items:center;justify-content:center;font-size:10px;font-weight:600;color:var(--gold-dark);">${i + 1}</div>
          <div style="font-size:12px;color:var(--ink-60);padding-top:1px;">${tip}</div>
        </div>
      `).join('')}
    </div>
  `;
}

async function analyzeGoalWithAI(goalId, template, goalAmount, timeline) {
  const U = UserState;

  showLoading('🤖 ' + template.motivation + ' Creating your personalized plan...');
  try {
    const analysis = await analyzeGoals({
      profile: U.toJSON(),
      goalType: goalId,
      goalLabel: template.label,
      goalAmount: goalAmount,
      timeline: timeline
    });
    hideLoading();

    // Show AI analysis
    document.getElementById('goal-analysis').innerHTML = `
      <div class="conv-message ai-msg">
        <div style="font-weight:600;margin-bottom:12px;">📊 Your AI-Powered Strategy</div>
        ${aiBox(analysis, template.label)}
      </div>
    `;
    document.getElementById('goal-analysis').style.display = 'block';

    // Show insights
    document.getElementById('insights-section').innerHTML = createInsightCards(U);

    // Remove analyze button, show refresh option
    document.getElementById('analyze-with-ai').innerHTML = '✅ Plan Created! Scroll to see details';
    document.getElementById('analyze-with-ai').disabled = true;
  } catch (e) {
    hideLoading();
    document.getElementById('goal-analysis').innerHTML = `<div class="alert alert-err">⚠️ ${e.message}</div>`;
    document.getElementById('goal-analysis').style.display = 'block';
  }
}
