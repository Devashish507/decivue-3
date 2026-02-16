const { Decision, AuditLog, DecisionTeamMap } = require('../models');

exports.requestApproval = async (req, res) => {
    try {
        const { id } = req.params;
        const { userId, userName } = req.body; // Mock Auth

        const decision = await Decision.findByPk(id);
        if (!decision) return res.status(404).json({ success: false, message: 'Decision not found' });

        // Update status
        await decision.update({ governance_status: 'Pending Approval' });

        // Log action
        await AuditLog.create({
            decision_id: id,
            user_id: userId,
            user_name: userName,
            action: 'REQUEST_APPROVAL',
            details: { previousStatus: decision.governance_status }
        });

        res.json({ success: true, message: 'Approval requested', data: decision });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

exports.approveDecision = async (req, res) => {
    try {
        const { id } = req.params;
        const { userId, userName, justification } = req.body;

        const decision = await Decision.findByPk(id, {
            include: [{ model: DecisionTeamMap, as: 'teamMap' }]
        });
        if (!decision) return res.status(404).json({ success: false, message: 'Decision not found' });

        // Verify Reviewer
        if (decision.teamMap && decision.teamMap.reviewer_id !== userId) {
            return res.status(403).json({ success: false, message: 'Only the assigned reviewer can approve this decision.' });
        }

        await decision.update({ governance_status: 'Approved' });

        await AuditLog.create({
            decision_id: id,
            user_id: userId,
            user_name: userName,
            action: 'APPROVE',
            justification: justification,
            details: { status: 'Approved' }
        });

        res.json({ success: true, message: 'Decision approved', data: decision });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

exports.rejectDecision = async (req, res) => {
    try {
        const { id } = req.params;
        const { userId, userName, justification } = req.body;

        const decision = await Decision.findByPk(id, {
            include: [{ model: DecisionTeamMap, as: 'teamMap' }]
        });
        if (!decision) return res.status(404).json({ success: false, message: 'Decision not found' });

        // Verify Reviewer
        if (decision.teamMap && decision.teamMap.reviewer_id !== userId) {
            return res.status(403).json({ success: false, message: 'Only the assigned reviewer can reject this decision.' });
        }

        await decision.update({ governance_status: 'Rejected' });

        await AuditLog.create({
            decision_id: id,
            user_id: userId,
            user_name: userName,
            action: 'REJECT',
            justification: justification,
            details: { status: 'Rejected' }
        });

        res.json({ success: true, message: 'Decision rejected', data: decision });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

exports.logGovernanceAction = async (req, res) => {
    try {
        const { id } = req.params;
        const { userId, userName, action, justification, details } = req.body;

        await AuditLog.create({
            decision_id: id,
            user_id: userId,
            user_name: userName,
            action,
            justification,
            details
        });

        res.json({ success: true, message: 'Action logged' });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};
