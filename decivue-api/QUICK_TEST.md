# ✅ QUICK TEST GUIDE - Review Intelligence Feature

## 🎯 The Feature is NOW Working Automatically!

When you create a new decision, it will **automatically**:
- Calculate urgency score (0-100)
- Schedule next review date (3-30 days based on urgency)
- Appear in Dashboard alerts

---

## 📝 Step-by-Step Test

### **Step 1: Open Your Dashboard**
```
Browser: http://localhost:5173
Click: Dashboard
```

### **Step 2: Create a New Decision**

Click **"Add Decision"** and fill in:

```
Title: My Final Test
Context: Testing automatic alerts
Decision Type: Strategic
Priority Level: CRITICAL     ← Important!
Impact Level: Critical        ← Important!
Risk Level: Critical          ← Important!
Initial Confidence: 70
Current Confidence: 70
Lifecycle State: Active
```

**Click "Create Decision"**

### **Step 3: View the Alert**

1. Navigate back to **Dashboard**
2. Scroll to **"Review Intelligence Alerts"** section
3. **Refresh the page (F5)** if needed

**You should see:**
- ✅ "My Final Test" appears as a new alert card
- ✅ Urgency Score: **70** (in an orange/yellow badge)
- ✅ Next Review: ~7 days from today
- ✅ "What Changed: No previous review available"

---

## 🎨 What You'll See on Dashboard

```
┌──────────────────────────────────────────┐
│ Review Intelligence Alerts    [Filter ▼]│
│ 0 governance risks · 6 upcoming reviews  │
├──────────────────────────────────────────┤
│                                          │
│ My Final Test                    [70]   │
│ Next Review: Feb 23, 2026                │
│                                          │
│ What Changed:                            │
│ • No previous review available           │
│                                          │
│           [Review Now]                   │
├──────────────────────────────────────────┤
│ (4-5 more alert cards below)             │
└──────────────────────────────────────────┘
```

---

## ✅ Success Checklist

After creating your test decision:

- [ ] Alert appears on Dashboard
- [ ] Urgency score shows (60-70)
- [ ] Badge is orange/yellow
- [ ] Next review date is ~7 days away
- [ ] "Review Now" button works (goes to decision details)
- [ ] Filter dropdown works (try "All Alerts" / "Upcoming")
- [ ] Search works (type "Final" to filter)

---

## 🔧 Urgency Score Calculation

Your "My Final Test" decision gets **70 points**:
- CRITICAL Priority: **+25**
- Critical Impact: **+25**
- Critical Risk: **+20**
- **Total: 70**

**Review Schedule:**
- Score 70 falls in 60-79 range → Review in **7 days**

---

## 🎉 That's It!

The feature is fully automatic now. Every new decision you create will:
1. Get an urgency score based on its priority/impact/risk
2. Be scheduled for review (3-30 days)
3. Appear in Dashboard alerts immediately

**No manual steps required!** 🚀
