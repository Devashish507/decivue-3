const express = require('express');
const router = express.Router();
const governanceController = require('../controllers/governanceController');

// All routes relative to /api/governance
// But we might want them under /api/decisions/:id/governance
// Let's keep them separate for now but pass decision ID in body or params

router.post('/decisions/:id/request-approval', governanceController.requestApproval);
router.post('/decisions/:id/approve', governanceController.approveDecision);
router.post('/decisions/:id/reject', governanceController.rejectDecision);
router.post('/decisions/:id/log', governanceController.logGovernanceAction);

module.exports = router;
