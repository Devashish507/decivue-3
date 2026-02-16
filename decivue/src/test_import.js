// Quick debug test to verify ReviewAlertCard can be imported
import ReviewAlertCard from './components/ReviewAlertCard';

console.log('✅ ReviewAlertCard imported successfully:', ReviewAlertCard);

const testAlert = {
    id: 'test-123',
    title: 'Test Alert',
    urgencyScore: 85,
    escalationLevel: 'GOVERNANCE_RISK',
    nextReviewDate: '2026-02-20T00:00:00.000Z',
    daysOverdue: 5,
    whatChanged: ['Test change 1', 'Test change 2'],
    riskLevel: 'Critical'
};

console.log('Test alert data:', testAlert);
