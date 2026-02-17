const express = require('express');
const router = express.Router();
const decisionController = require('../controllers/decisionController');
const relationshipController = require('../controllers/relationshipController');
const wizardController = require('../controllers/decisionWizardController');

// Wizard routes (must come before /:id routes)
router.post('/wizard/create', wizardController.createDecisionFromWizard);
router.post('/wizard/validate', wizardController.validateWizardData);
router.get('/search', wizardController.searchDecisions);

// Review Alerts (must be before ANY /:id routes)
router.get('/alerts', decisionController.getReviewAlerts);

// Sub-Decisions
router.post('/:parentId/sub', decisionController.createSubDecision);
router.patch('/sub-decision/:id/progress', decisionController.updateProgress);

// Version History Routes (must be before /:id to avoid catch-all)
const versionController = require('../controllers/decisionVersionController');
router.get('/:id/versions', versionController.getVersions);
router.get('/:id/versions/:versionId', versionController.getVersionDetails);

// Individual Assumption routes
router.put('/:id/assumptions/:assumptionId', decisionController.editAssumption);
router.delete('/:id/assumptions/:assumptionId', decisionController.deleteAssumption);

// Team Map & Roles (Must come BEFORE generic /:id to avoid matching issues)
router.post('/:id/team-map', decisionController.addToTeam); // Add to Team Space
router.put('/:id/team-roles', decisionController.updateTeamRoles); // Update Team Roles

// Basic CRUD
router.get('/', decisionController.getAllDecisions);
router.post('/', decisionController.createDecision);
router.get('/:id', decisionController.getDecisionById);
router.put('/:id', decisionController.updateDecision); // Added Edit/Update
router.delete('/:id', decisionController.deleteDecision); // Added Delete
router.get('/:id/tree', decisionController.getDecisionTree);

// Conflict detection
router.get('/:id/conflicts', decisionController.getConflicts);

// Relationship routes
router.get('/:id/relationships', relationshipController.getRelationships);
router.post('/:id/relationships', relationshipController.createRelationship);
router.get('/:id/reasoning', relationshipController.getReasoningTree);

// Action routes
router.post('/:id/reaffirm', decisionController.reaffirmDecision);
router.post('/:id/notes', decisionController.addNote);
router.post('/:id/review', decisionController.markReviewed); // Legacy simple review
router.post('/:id/review-decision', decisionController.reviewDecision); // New full review
router.put('/:id/assumptions', decisionController.updateAssumptions);

// Health Engine Triggers
router.post('/trigger/daily-update', decisionController.triggerDailyUpdate);



module.exports = router;


