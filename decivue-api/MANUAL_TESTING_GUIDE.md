# Manual Testing Guide: Review Intelligence Alerts

## 🎯 Goal
Test that the Review Intelligence system correctly generates alerts based on different decision changes.

---

## Test 1: Create a High-Risk Decision (Should Score 60+)

### Step 1: Create the Decision
```bash
curl.exe -X POST http://localhost:3000/api/decisions ^
  -H "Content-Type: application/json" ^
  -d "{\"title\": \"Test High Risk Decision\", \"context\": \"Testing urgency scoring\", \"decision_type\": \"MAIN_STRATEGIC\", \"priority_level\": \"CRITICAL\", \"impact_level\": \"Critical\", \"risk_level\": \"Critical\", \"initial_confidence\": 80, \"current_confidence\": 80, \"lifecycle_state\": \"Active\"}"
```

### Step 2: Check the Alerts
```bash
curl.exe http://localhost:3000/api/decisions/alerts
```

**Expected Result:**
- New decision appears in `"upcoming"` array
- `urgencyScore` should be 60+ (CRITICAL priority = 25, Critical impact = 25, Critical risk = 20)
- `nextReviewDate` should be ~7 days from now (score 60-79 = 7 day review)

### Step 3: Verify in UI
1. Open http://localhost:5173
2. Go to Dashboard
3. Look for "Test High Risk Decision" in the alerts section
4. Should show urgency score badge and review date

---

## Test 2: Drop Confidence → Increase Urgency Score

### Step 1: Get a Decision ID
```bash
# From the previous test, copy the decision ID from the response
```

### Step 2: Update Confidence (Big Drop)
```bash
curl.exe -X PUT http://localhost:3000/api/decisions/{PASTE_DECISION_ID_HERE} ^
  -H "Content-Type: application/json" ^
  -d "{\"current_confidence\": 50}"
```

**Replace `{PASTE_DECISION_ID_HERE}` with actual ID from previous step**

### Step 3: Check Alerts Again
```bash
curl.exe http://localhost:3000/api/decisions/alerts
```

**Expected Result:**
- Same decision now has HIGHER `urgencyScore` (+15 for confidence drop > 15%)
- New urgency = ~75, so `nextReviewDate` moves closer (still 7 days)
- `whatChanged` should mention "Confidence dropped from 80% → 50%"

---

## Test 3: Add Conflicts → Further Increase Score

### Step 1: Create Another Decision (to conflict with)
```bash
curl.exe -X POST http://localhost:3000/api/decisions ^
  -H "Content-Type: application/json" ^
  -d "{\"title\": \"Conflicting Decision\", \"context\": \"Conflicts with test decision\", \"decision_type\": \"MAIN_STRATEGIC\", \"priority_level\": \"MEDIUM\", \"impact_level\": \"Medium\", \"risk_level\": \"Medium\", \"initial_confidence\": 70, \"current_confidence\": 70, \"lifecycle_state\": \"Active\"}"
```

### Step 2: Create a CONFLICT Relationship
```bash
curl.exe -X POST http://localhost:3000/api/decisions/{FIRST_DECISION_ID}/relationships ^
  -H "Content-Type: application/json" ^
  -d "{\"target_decision_id\": \"{SECOND_DECISION_ID}\", \"relation_type\": \"CONFLICT\", \"description\": \"Budget allocation conflict\"}"
```

### Step 3: Check Alerts
```bash
curl.exe http://localhost:3000/api/decisions/alerts
```

**Expected Result:**
- First decision urgency score increases by +10 per conflict
- New score = ~85, so `nextReviewDate` becomes 3 days (score 80+ = 3 day review)
- `whatChanged` shows "1 new conflict detected"

---

## Test 4: Create an OVERDUE Decision → GOVERNANCE_RISK

### Step 1: Create Decision with Past Review Date
```bash
curl.exe -X POST http://localhost:3000/api/decisions ^
  -H "Content-Type: application/json" ^
  -d "{\"title\": \"Overdue Decision Test\", \"context\": \"Testing escalation\", \"decision_type\": \"MAIN_STRATEGIC\", \"priority_level\": \"MEDIUM\", \"impact_level\": \"Medium\", \"risk_level\": \"Medium\", \"initial_confidence\": 70, \"current_confidence\": 70, \"lifecycle_state\": \"Active\", \"next_review_date\": \"2026-02-01T00:00:00.000Z\"}"
```

**Note:** The date "2026-02-01" is in the past, so it's already overdue!

### Step 2: Check Alerts
```bash
curl.exe http://localhost:3000/api/decisions/alerts
```

**Expected Result:**
- Decision appears in `"GOVERNANCE_RISK"` array (8+ days overdue)
- `escalationLevel`: "GOVERNANCE_RISK"
- `daysOverdue`: ~15 days
- Shows in RED on Dashboard

---

## Test 5: Shallow Review Detection

### Step 1: Perform a Shallow Review (no notes, no changes)
```bash
curl.exe -X POST http://localhost:3000/api/decisions/{DECISION_ID}/review-decision ^
  -H "Content-Type: application/json" ^
  -d "{\"notes\": \"\", \"confidenceChanged\": false, \"assumptionUpdated\": false}"
```

### Step 2: Check Decision (verify postpone count increased)
```bash
curl.exe http://localhost:3000/api/decisions/{DECISION_ID}
```

**Expected Result:**
- `postpone_count` increased by 1
- Review snapshot created with `is_shallow_review: true`

### Step 3: Perform a MEANINGFUL Review
```bash
curl.exe -X POST http://localhost:3000/api/decisions/{DECISION_ID}/review-decision ^
  -H "Content-Type: application/json" ^
  -d "{\"notes\": \"Comprehensive review completed. Updated all assumptions and confirmed confidence based on latest market data. Team is aligned on next steps.\", \"confidenceChanged\": true, \"assumptionUpdated\": true}"
```

### Step 4: Check Decision Again
```bash
curl.exe http://localhost:3000/api/decisions/{DECISION_ID}
```

**Expected Result:**
- `postpone_count` reset to 0
- Review snapshot with `is_shallow_review: false`

---

## Test 6: Real-Time Dashboard Verification

### After each test above:

1. **Refresh Dashboard**: Open http://localhost:5173
2. **Check Alert Section**: Look for your test decisions
3. **Verify Filters**: Try filtering by:
   - "Governance Risk" (should show overdue decisions)
   - "Upcoming" (should show high-urgency decisions)
4. **Check Urgency Scores**: Click on alerts to see decision details
5. **Verify "What Changed"**: Should show confidence drops, conflicts, etc.

---

## Quick Reference: Urgency Score Breakdown

| Factor | Points Added |
|--------|--------------|
| Critical Impact | +25 |
| High Impact | +20 |
| Critical Priority | +25 |
| High Priority | +15 |
| Each Conflict | +10 |
| Confidence Drop > 15% | +15 |
| Old Assumptions (90+ days) | +10 |
| Overdue | +20 |

**Review Schedule:**
- Score 80+ → Review in 3 days
- Score 60-79 → Review in 7 days
- Score 40-59 → Review in 14 days
- Score <40 → Review in 30 days

**Escalation Levels (when overdue):**
- 8+ days → GOVERNANCE_RISK
- 4-7 days → HIGH_PRIORITY
- 1-3 days → REMINDER

---

## Troubleshooting

**If alerts don't show:**
1. Check server logs for errors
2. Verify API returns data: `curl.exe http://localhost:3000/api/decisions/alerts`
3. Check browser console (F12) for errors
4. Ensure frontend dev server is running on port 5173

**If urgency scores are wrong:**
1. Check decision fields (risk_level, impact_level, priority_level)
2. Verify confidence drop calculation
3. Count conflicts manually
