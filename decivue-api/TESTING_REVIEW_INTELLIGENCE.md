# Testing Review Intelligence Feature

## ✅ Quick Start - VERIFIED WORKING

### 1. Create Test Data
Run the seeding script to create test decisions with various urgency levels:

```bash
node test_review_intelligence.js
```

### 2. Test the Alerts API ✅ WORKING

```bash
# Use curl.exe (not PowerShell's curl alias)
curl.exe http://localhost:3000/api/decisions/alerts

# Or with PowerShell curl (will prompt for security confirmation)
curl http://localhost:3000/api/decisions/alerts
```

**✅ VERIFIED OUTPUT:** The endpoint returns decisions grouped by escalation level with urgency scores.

**Expected Response:**
```json
{
  "success": true,
  "data": {
    "GOVERNANCE_RISK": [
      {
        "id": "...",
        "title": "Legacy System Decommission",
        "urgencyScore": 45,
        "escalationLevel": "GOVERNANCE_RISK",
        "daysOverdue": 10,
        "whatChanged": ["No previous review available"],
        "riskLevel": "Medium"
      }
    ],
    "HIGH_PRIORITY": [],
    "REMINDER": [],
    "upcoming": [
      {
        "id": "...",
        "title": "Critical Infrastructure Migration",
        "urgencyScore": 80,
        "escalationLevel": null,
        "nextReviewDate": "2026-02-19T...",
        "whatChanged": ["No previous review available"]
      }
    ]
  },
  "summary": {
    "governanceRisk": 1,
    "highPriority": 0,
    "reminder": 0,
    "upcoming": 4
  }
}
```

## Manual Testing Scenarios

### Scenario 1: Create High Risk Decision
```bash
curl -X POST http://localhost:3000/api/decisions \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Test High Risk Decision",
    "context": "Testing urgency scoring",
    "decision_type": "MAIN_STRATEGIC",
    "priority_level": "CRITICAL",
    "impact_level": "Critical",
    "risk_level": "Critical",
    "initial_confidence": 80,
    "current_confidence": 80,
    "lifecycle_state": "Active"
  }'
```

Then check the decision to see:
- `review_urgency_score` should be high (60+)
- `next_review_date` should be 3-7 days out
- `review_escalation_level` should be null (not overdue yet)

### Scenario 2: Update Confidence (Trigger Recalculation)
```bash
curl -X PUT http://localhost:3000/api/decisions/{DECISION_ID} \
  -H "Content-Type: application/json" \
  -d '{
    "current_confidence": 50
  }'
```

The urgency score should increase due to the confidence drop.

### Scenario 3: Mark Review (Test Shallow Detection)

**Shallow Review (no notes, no changes):**
```bash
curl -X POST http://localhost:3000/api/decisions/{DECISION_ID}/review-decision \
  -H "Content-Type: application/json" \
  -d '{
    "notes": "",
    "confidenceChanged": false,
    "assumptionUpdated": false
  }'
```

Check:
- `postpone_count` should increment
- Review snapshot created with `is_shallow_review: true`

**Meaningful Review:**
```bash
curl -X POST http://localhost:3000/api/decisions/{DECISION_ID}/review-decision \
  -H "Content-Type: application/json" \
  -d '{
    "notes": "Reviewed all assumptions and updated confidence based on new market data. Team alignment confirmed.",
    "confidenceChanged": true,
    "assumptionUpdated": false
  }'
```

Check:
- `postpone_count` should reset to 0
- `is_shallow_review: false`

### Scenario 4: Add Conflicts (Increase Score)
```bash
curl -X POST http://localhost:3000/api/decisions/{DECISION_ID}/relationships \
  -H "Content-Type: application/json" \
  -d '{
    "target_decision_id": "{OTHER_DECISION_ID}",
    "relation_type": "CONFLICT",
    "description": "Conflicts with budget allocation"
  }'
```

Then update review intelligence:
- Urgency score should increase by 10 per conflict

## Verification Checklist

- [ ] **Score Calculation**: High risk decisions get scores 60+
- [ ] **Auto-Scheduling**: 
  - Score 80+ → 3 days
  - Score 60-79 → 7 days
  - Score 40-59 → 14 days
  - Score <40 → 30 days
- [ ] **Escalation Levels**:
  - 8+ days overdue → GOVERNANCE_RISK
  - 4-7 days → HIGH_PRIORITY
  - 1-3 days → REMINDER
- [ ] **Shallow Review Detection**: Empty notes + no changes = shallow
- [ ] **Postpone Count**: Increments on shallow, resets on meaningful
- [ ] **What Changed**: Shows confidence drops, new conflicts, aging assumptions
- [ ] **Recalculation**: Triggered on create, update, review

## Database Check

Verify the data directly:

```bash
node -e "const { Decision } = require('./src/models'); (async () => { const d = await Decision.findOne({ where: { title: 'Critical Infrastructure Migration' } }); console.log({ score: d.review_urgency_score, nextReview: d.next_review_date, escalation: d.review_escalation_level, postponed: d.postpone_count }); process.exit(0); })()"
```

## Next Steps

Once backend is verified:
1. Test `/api/decisions/alerts` endpoint thoroughly
2. Implement frontend Dashboard alert section
3. Add Review Intelligence Panel to decision detail page
4. Set up cron job for daily recalculation
