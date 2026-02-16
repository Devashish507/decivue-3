const { Team, TeamMember, Decision, DecisionTeamMap } = require('../models');

exports.getAllTeams = async (req, res) => {
    try {
        const teams = await Team.findAll({
            attributes: ['id', 'name', 'description'],
            include: [{
                model: TeamMember,
                as: 'teamMembers',
                attributes: ['user_id', 'user_name', 'user_avatar', 'role']
            }]
        });
        res.json({ success: true, data: teams });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
};

exports.createTeam = async (req, res) => {
    try {
        const team = await Team.create(req.body);
        res.status(201).json({ success: true, data: team });
    } catch (err) {
        res.status(400).json({ success: false, message: err.message });
    }
};

exports.getTeamDashboard = async (req, res) => {
    try {
        const { id } = req.params;
        let team;

        // Support 'default' to get the first team if no ID is known
        if (id === 'default') {
            team = await Team.findOne();
        } else {
            team = await Team.findByPk(id);
        }

        if (!team) return res.status(404).json({ success: false, message: 'Team not found' });

        // Fetch Members
        const members = await TeamMember.findAll({
            where: { team_id: team.id }
        });

        // Fetch Decisions via DecisionTeamMap
        const decisionMaps = await DecisionTeamMap.findAll({
            where: { team_id: team.id },
            include: [{
                model: Decision,
                as: 'decision',
                // Include necessary fields to calculate stats
                include: ['auditLogs']
            }]
        });

        // Format decisions for response
        const decisions = decisionMaps.map(map => {
            if (!map.decision) return null;
            const d = map.decision.toJSON();
            return {
                ...d,
                teamMap: {
                    owner_id: map.owner_id,
                    reviewer_id: map.reviewer_id
                }
            };
        }).filter(d => d);

        // Calculate Stats based on real data
        const stats = {
            total: decisions.length,
            active: decisions.filter(d => d.lifecycle_state !== 'Completed').length,
            underReview: decisions.filter(d => ['Pending Approval', 'Review'].includes(d.governance_status) || d.lifecycle_state === 'Review').length,
            highImpact: decisions.filter(d => ['High', 'Critical'].includes(d.impact_level)).length,
            governanceLocked: decisions.filter(d => d.is_governance_required && d.governance_status !== 'Approved').length
        };

        res.json({
            success: true,
            data: {
                team: team.toJSON(),
                members,
                decisions,
                stats
            }
        });
    } catch (err) {
        console.error('Error in getTeamDashboard:', err);
        res.status(500).json({ success: false, message: err.message });
    }
};

// Member Management
exports.addMember = async (req, res) => {
    try {
        const { id } = req.params; // Team ID
        const { user_id, user_name, role, user_avatar } = req.body;

        const member = await TeamMember.create({
            team_id: id,
            user_id,
            user_name,
            user_avatar,
            role
        });
        res.status(201).json({ success: true, data: member });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
};

exports.removeMember = async (req, res) => {
    try {
        const { id, userId } = req.params;
        const deleted = await TeamMember.destroy({
            where: { team_id: id, user_id: userId }
        });
        if (deleted) {
            res.json({ success: true, message: 'Member removed' });
        } else {
            res.status(404).json({ success: false, message: 'Member not found' });
        }
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
};

exports.updateMemberRole = async (req, res) => {
    try {
        const { id, userId } = req.params;
        const { role } = req.body;
        const [updated] = await TeamMember.update(
            { role },
            { where: { team_id: id, user_id: userId } }
        );
        if (updated) {
            res.json({ success: true, message: 'Role updated' });
        } else {
            res.status(404).json({ success: false, message: 'Member not found' });
        }
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
};
