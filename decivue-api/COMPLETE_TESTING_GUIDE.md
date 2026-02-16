# ✅ COMPLETE Testing Guide - Review Intelligence Feature

## 🎯 **Test Scenario 1: View Existing Alerts**

### Step 1: Check API (Verify alerts are showing)
```bash
curl.exe http://localhost:3000/api/decisions/alerts
```

**Expected:** You should see decisions like "error", "Critical Infrastructure Migration", "Critical Database Migration" with urgency scores 45-50.

### Step 2: View on Dashboard UI
1. Open http://localhost:5173
2. Navigate to **Dashboard**
3. Look for **"Review Intelligence Alerts"** section
4. You should see alert cards with:
   - Decision titles
   - Urgency score badges (orange ~45-50)
   - Next review dates
   - "What Changed" information

---

## 🎯 **Test Scenario 2: Create High-Urgency Decision (Score 70+)**

### Using UI:
1. Click **"Add Decision"** button
2. Fill in:
   - **Title:** "Security Breach Response Plan"
   - **Context:** "Immediate response protocol needed"
   - **Decision Type:** Strategic
   - **Priority Level:** **CRITICAL**
   - **Impact Level:** **Critical**
   - **Risk Level:** **Critical**
   - **Initial Confidence:** 60
   - **Current Confidence:** 60
3. Click **"Create Decision"**

### Expected Result:
- Urgency Score: **70** (CRITICAL priority=25 + Critical impact=25 + Critical risk=20)
- Next Review: **7 days from now** (score 60-79 = 7 day schedule)
- Should appear in Dashboard alerts immediately
- Badge color: **Orange**

---

## 🎯 **Test Scenario 3: Drop Confidence → Increase Urgency**

### Step 1: Pick ANY existing decision from Dashboard
1. Click on the decision
2. Click **"Edit Decision"** or update confidence directly
3. **Change Current Confidence from 60 → 30** (drop of 30 points!)

### Step 2: Check alerts again
1. Navigate back to Dashboard
2. Same decision should now show **higher urgency score** (+15 for confidence drop >15%)
3. New score: **85** = 70 + 15
4. Review date moves closer: **3 days** (score 80+ = 3 day schedule)
5. Badge color changes to **RED**

---

## 🎯 **Test Scenario 4: Create Overdue Decision → Governance Risk**

### Using curl (easiest way to set past date):
```bash
curl.exe -X POST http://localhost:3000/api/decisions -H "Content-Type: application/json" -d "{\"title\": \"Overdue Compliance Review\", \"context\": \"Annual compliance needs review\", \"decision_type\": \"MAIN_STRATEGIC\", \"priority_level\": \"MEDIUM\", \"impact_level\": \"Medium\", \"risk_level\": \"Medium\", \"initial_confidence\": 70, \"current_confidence\": 70, \"lifecycle_state\": \"Active\", \"next_review_date\": \"2026-02-01T00:00:00.000Z\"}"
```

### Expected Result:
- **GOVERNANCE_RISK** escalation level (15 days overdue!)
- Shows in **RED section** of dashboard
- "Days overdue: 15" displayed
- At TOP of alerts list (highest priority)

---

## 🎯 **Test Scenario 5: Filter Alerts by Type**

### On Dashboard:
1. Use the **dropdown filter** (top right of alerts section)
2. Try filtering:
   - **"All Alerts"** - Shows everything
   - **"Governance Risk"** - Only shows overdue (RED)
   - **"Upcoming"** - Only shows non-overdue reviews
3. **Search box** - Type decision name to filter

### Expected:
- Filters work correctly
- Summary counts update: "X governance risks · Y upcoming reviews"

---

## 🎯 **Test Scenario 6: Verify Urgency Score Formula**

### Pick "Security Breach Response Plan" decision (from Test 2):**Manual Calculation:**
- CRITICAL Priority: +25
- Critical Impact: +25
- Critical Risk: +20
- Confidence drop (60→30): +15
- **Total: 85**

### Verify:
1. Click the decision from alerts
2. Check urgency score badge = **85** ✅
3. Badge is **RED** (score 80+) ✅
4. Next Review = **~3 days from today** ✅

---

## 🎯 **Test Scenario 7: Add Conflicts → Increase Score**

This requires creating 2 decisions and linking them:

### Step 1: Create Decision A
- Title: "Cloud Migration Strategy"
- Priority: HIGH, Impact: High, Risk: Medium

### Step 2: Create Decision B  
- Title: "On-Premise  Expansion"
- Priority: HIGH, Impact: High, Risk: Medium

### Step 3: Create Conflict (using UI or API)
Go to Decision A → Add Relationship → Type: CONFLICT → Target: Decision B

### Expected:
- Decision A urgency score +10
- Decision B urgency score +10
- Both move higher in alerts list
- "What Changed" shows: "1 new conflict detected"

---

## 🎯 **Quick Reference**

### Urgency Score Formula:
| Factor | Points |
|--------|--------|
| CRITICAL Priority | +25 |
| HIGH Priority | +15 |
| Critical Impact | +25 |
| High Impact | +20 |
| Critical Risk | +20 |
| High Risk | +15 |
| Each Conflict | +10 |
| Confidence Drop >15% | +15 |
| Old Assumptions (90+ days) | +10 |
| Overdue | +20 |

### Review Schedule:
- Score **80+** → Review in **3 days** (RED badge)
- Score **60-79** → Review in **7 days** (Orange badge)
- Score **40-59** → Review in **14 days** (Yellow badge)
- Score **<40** → Review in **30 days** (Blue badge)

### Escalation (when overdue):
- **8+ days** → GOVERNANCE_RISK (Red)
- **4-7 days** → HIGH_PRIORITY (Orange)
- **1-3 days** → REMINDER (Yellow)

---

## ✅ **Success Checklist**

After running all tests, verify:

- [ ] **Dashboard shows alerts** with correct urgency scores
- [ ] **Color coding works** (Red=80+, Orange=60-79, Yellow=40-59)
- [ ] **Escalation badges** show for overdue decisions
- [ ] **Filters work** (Governance Risk, Upcoming, All)
- [ ] **Search works** by decision title  
- [ ] **"What Changed"** displays correctly
- [ ] **Next Review Date** matches expected schedule
- [ ] **Clicking alert** navigates to decision details
- [ ] **Confidence drops** increase urgency score
- [ ] **Conflicts** increase urgency score
- [ ] **Overdue decisions** show days overdue count

🎉 **Feature is working if all boxes are checked!**
