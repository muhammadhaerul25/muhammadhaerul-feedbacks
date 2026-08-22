const express = require('express');
const router = express.Router();
const formsController = require('../controllers/forms.controller');
const fieldsController = require('../controllers/fields.controller');
const responsesController = require('../controllers/responses.controller');
const { submissionLimiter } = require('../middlewares/security');
const { validateIntParam, validateSlugParam } = require('../middlewares/validateParams');

// --- Forms CRUD ---
router.get('/', formsController.getAllForms);
router.post('/', formsController.createForm);
router.get('/template-fields', formsController.getFeedbackTemplateFields);

// Universal submission endpoint (supports { formId, answers } or { slug, data })
router.post('/submit', submissionLimiter, responsesController.submitResponse);

// Form Fields CRUD (must come before /:slug to avoid route collision if any ID route matches)
router.get('/:id/fields', validateIntParam('id'), fieldsController.getFieldsByFormId);
router.post('/:id/fields', validateIntParam('id'), fieldsController.addFieldToForm);
router.put('/:id/fields/:fid', validateIntParam('id'), validateIntParam('fid'), fieldsController.updateField);
router.delete('/:id/fields/:fid', validateIntParam('id'), validateIntParam('fid'), fieldsController.deleteField);

// Form Responses CRUD
router.get('/:id/responses', validateIntParam('id'), responsesController.getResponsesByFormId);
router.delete('/:id/responses/:rid', validateIntParam('id'), validateIntParam('rid'), responsesController.deleteResponse);

// Form by Slug / ID
router.get('/:slug', validateSlugParam('slug'), formsController.getFormBySlug);
router.put('/:id', validateIntParam('id'), formsController.updateForm);
router.delete('/:id', validateIntParam('id'), formsController.deleteForm);

// Slug-based response submission
router.post('/:slug/responses', validateSlugParam('slug'), submissionLimiter, responsesController.submitResponse);

module.exports = router;
