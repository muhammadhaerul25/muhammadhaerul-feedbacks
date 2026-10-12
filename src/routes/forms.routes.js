const express = require('express');
const router = express.Router();
const formsController = require('../controllers/forms.controller');
const fieldsController = require('../controllers/fields.controller');
const responsesController = require('../controllers/responses.controller');
const { requireAdminAuth } = require('../middlewares/auth');
const { submissionLimiter } = require('../middlewares/security');
const { validateIntParam, validateSlugParam } = require('../middlewares/validateParams');

// --- Forms Public View ---
router.get('/', formsController.getAllForms);
router.get('/template-fields', formsController.getFeedbackTemplateFields);

// Universal submission endpoint (supports { formId, answers } or { slug, data })
router.post('/submit', submissionLimiter, responsesController.submitResponse);

// Form Fields Public View & Admin Management
router.get('/:id/fields', validateIntParam('id'), fieldsController.getFieldsByFormId);
router.post('/:id/fields', requireAdminAuth, validateIntParam('id'), fieldsController.addFieldToForm);
router.put('/:id/fields/:fid', requireAdminAuth, validateIntParam('id'), validateIntParam('fid'), fieldsController.updateField);
router.delete('/:id/fields/:fid', requireAdminAuth, validateIntParam('id'), validateIntParam('fid'), fieldsController.deleteField);

// Form Responses Management (Admin Protected)
router.get('/:id/responses', requireAdminAuth, validateIntParam('id'), responsesController.getResponsesByFormId);
router.delete('/:id/responses/:rid', requireAdminAuth, validateIntParam('id'), validateIntParam('rid'), responsesController.deleteResponse);

// Form Management (Admin Protected CRUD)
router.post('/', requireAdminAuth, formsController.createForm);
router.put('/:id', requireAdminAuth, validateIntParam('id'), formsController.updateForm);
router.delete('/:id', requireAdminAuth, validateIntParam('id'), formsController.deleteForm);

// Form by Slug (Public View)
router.get('/:slug', validateSlugParam('slug'), formsController.getFormBySlug);

// Slug-based response submission (Public with rate limiter)
router.post('/:slug/responses', validateSlugParam('slug'), submissionLimiter, responsesController.submitResponse);

module.exports = router;
