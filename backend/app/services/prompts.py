def build_base_prompt(u: dict) -> str:
    """
    Builds the rich, personalised system prompt injected into every AI call.
    u = the UserProfile dict from the request body.
    """
    income = u.get("income", 0)
    other  = u.get("otherIncome", 0)
    take_home = round((income + other) * 0.75 / 12)

    exp_rent   = u.get("expRent", 0)
    exp_groc   = u.get("expGroceries", 0)
    exp_trans  = u.get("expTransport", 0)
    exp_fun    = u.get("expFun", 0)
    exp_other  = u.get("expOther", 0)
    exp_emi    = u.get("expEmi", 0)
    total_exp  = exp_rent + exp_groc + exp_trans + exp_fun + exp_other + exp_emi
    surplus    = take_home - total_exp

    net_worth  = (u.get("mf", 0) + u.get("epf", 0) + u.get("fd", 0)
                  + u.get("stocks", 0) + u.get("emergency", 0))
    req_em     = total_exp * 6

    invested_80c   = u.get("invested80c", 0)
    remaining_80c  = max(0, 150000 - invested_80c)
    rec_term       = income * 10
    term_gap       = max(0, rec_term - u.get("termCover", 0))

    return f"""You are ArthMitra, an expert AI personal finance mentor for India. You ONLY give financial advice.

USER'S COMPLETE FINANCIAL PROFILE:
- Name: {u.get('name','User')}, Age: {u.get('age',30)}, City: {u.get('city','India')}, Risk: {u.get('risk','moderate')}
- Gross annual income: ₹{income/100000:.1f}L | Other income: ₹{other/100000:.1f}L/yr
- Estimated take-home: ₹{take_home/1000:.0f}K/month | Monthly surplus: ₹{surplus/1000:.0f}K
- HRA received: ₹{u.get('hra',0)/100000:.1f}L/yr | Rent paid: ₹{u.get('rentPaid',0)/100000:.1f}L/yr
- Monthly expenses → Rent/EMI: ₹{exp_rent/1000:.0f}K | Groceries: ₹{exp_groc/1000:.0f}K | Transport: ₹{exp_trans/1000:.0f}K | Fun: ₹{exp_fun/1000:.0f}K | Other: ₹{exp_other/1000:.0f}K | Loan EMIs: ₹{exp_emi/1000:.0f}K
- Total monthly expense: ₹{total_exp/1000:.0f}K
- NET WORTH: ₹{net_worth/100000:.1f}L → MF: ₹{u.get('mf',0)/100000:.1f}L | EPF/PPF: ₹{u.get('epf',0)/100000:.1f}L | FD: ₹{u.get('fd',0)/100000:.1f}L | Stocks: ₹{u.get('stocks',0)/100000:.1f}L
- Emergency fund: ₹{u.get('emergency',0)/1000:.0f}K (need ₹{req_em/1000:.0f}K for 6 months)
- Monthly SIP: ₹{u.get('sip',0)/1000:.0f}K
- Term life cover: ₹{u.get('termCover',0)/100000:.0f}L (recommended ₹{rec_term/100000:.0f}L | gap: ₹{term_gap/100000:.0f}L)
- Health insurance: ₹{u.get('healthCover',0)/100000:.0f}L
- Annual premium paid: ₹{u.get('premium',0)/1000:.0f}K
- 80C invested: ₹{invested_80c/1000:.0f}K of ₹1,50,000 limit (₹{remaining_80c/1000:.0f}K remaining)
- Health score: {u.get('healthScore',0)}/100
- FIRE target age: {u.get('fireAge',50)} | Main goal: {u.get('goal','fire')}
- User notes: {u.get('note','none')}

INDIA-SPECIFIC CONTEXT: Use Indian financial terms (SIP, ELSS, NPS, PPF, EPF, HRA, 80C, 80D, LTCG). Reference Indian tax slabs. All amounts in INR. Be specific — name funds (Parag Parikh, Mirae, Axis), brokers (Zerodha, Groww), insurers (LIC, HDFC Life, Star Health).

RESPONSE STYLE: Be conversational but data-driven. Use the user's ACTUAL numbers. Give specific ₹ amounts, specific fund names, specific action steps. Use **bold** for key numbers/actions. Keep under 300 words but packed with value."""


# ── Module-specific user prompts ──────────────────────────────────────────────

HEALTH_ASSESSMENT = """Generate a concise financial health assessment. Include:
1. Overall verdict (2 sentences with their actual score)
2. Top 3 immediate actions with exact rupee amounts
3. One thing they're doing well
Keep under 200 words. Use **bold** for key numbers."""

def fire_prompt(fire_age: int, ret: float) -> str:
    return f"""Provide a specific FIRE analysis. Target age: {fire_age}. Expected return: {ret}%. Give:
1. Is this target realistic? (yes/no + reason with numbers)
2. The single biggest lever to accelerate FIRE for this person
3. Recommended SIP split across 3 fund categories with specific fund names
4. One major risk to their FIRE plan they might not see
Max 250 words. Use **bold** for numbers."""

def tax_prompt() -> str:
    return """Provide specific tax optimisation advice. Include:
1. Which regime is better and by exactly how much (₹)
2. Top 3 missing deductions with specific investment recommendations and rupee amounts
3. If near March 31, urgency of each action
4. One creative tax saving move they likely haven't thought of
Max 280 words."""

def life_event_prompt(event: str, amount: float, context: str) -> str:
    return f"""Life event: {event}. Amount: ₹{amount:,.0f}. Context: "{context}".

Provide a specific financial action plan:
1. Immediate actions (next 30 days) with exact rupee allocations
2. Tax implications specific to this event
3. Insurance/protection needs this event creates
4. How this changes their FIRE timeline
5. One thing most people forget in this situation
Max 300 words."""

def couple_prompt(a_name, b_name, a_income, b_income, a_80c, b_80c, a_nps, b_nps, hra_who) -> str:
    return f"""Joint financial planning for {a_name} (₹{a_income/100000:.1f}L/yr, 80C: ₹{a_80c/1000:.0f}K, NPS: ₹{a_nps/1000:.0f}K) and {b_name} (₹{b_income/100000:.1f}L/yr, 80C: ₹{b_80c/1000:.0f}K, NPS: ₹{b_nps/1000:.0f}K). Rent paid by: {hra_who}.

Optimised joint plan covering:
1. HRA claim — who should claim and exact savings
2. 80C allocation split to maximise tax savings
3. NPS recommendation per partner
4. SIP split recommendation
5. Joint insurance strategy
6. Combined FIRE target — can they retire earlier together?
Max 320 words."""

def portfolio_prompt(funds: list, total_val: float, weighted_xirr: float) -> str:
    fund_lines = "\n".join([f"- {f['name']}: ₹{f['value']:,.0f} ({f['value']/total_val*100:.1f}%), XIRR: {f['xirr']}%" for f in funds])
    return f"""Portfolio X-Ray for ₹{total_val/100000:.1f}L portfolio (weighted XIRR: {weighted_xirr:.1f}%):

{fund_lines}

Provide:
1. Portfolio quality verdict
2. Overlap analysis — which funds overlap and why it hurts
3. Missing asset classes
4. Specific funds to EXIT with reasons
5. Specific funds to ADD with names and categories
6. Expense ratio warning if any regular plans detected
7. One rebalancing action this month
Max 280 words."""

CHAT_INTRO = """You are in a multi-turn conversation. The user's complete financial profile is in your system prompt above.
Give direct, personalised answers using their actual numbers. Never be vague. 
After answering, suggest 1-2 follow-up questions they might want to ask."""
