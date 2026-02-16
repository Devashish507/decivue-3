const express = require('express');
const router = express.Router();
const teamController = require('../controllers/teamController');

router.get('/', teamController.getAllTeams);
router.post('/', teamController.createTeam);
router.get('/:id/dashboard', teamController.getTeamDashboard);
router.post('/:id/members', teamController.addMember);
router.delete('/:id/members/:userId', teamController.removeMember);
router.put('/:id/members/:userId', teamController.updateMemberRole);

module.exports = router;
