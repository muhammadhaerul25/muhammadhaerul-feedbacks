const express = require('express');
const router = express.Router();
const formsController = require('../controllers/forms.controller');
const fieldsController = require('../controllers/fields.controller');
const responsesController = require('../controllers/responses.controller');

// Forms CRUD
router.get('/', formsController.getAllForms);
router.post('/', formsController.createForm);
router.get('/:slug', formsController.getFormBySlug);
router.put('/:id', formsController.updateForm);
router.delete('/:id', formsController.deleteForm);

// Form Fields CRUD
router.get('/:id/fields', fieldsController.getFieldsByFormId);
router.post('/:id/fields', fieldsController.addFieldToForm);
router.put('/:id/fields/:fid', fieldsController.updateField);
router.delete('/:id/fields/:fid', fieldsController.deleteField);

// Form Responses
router.post('/:slug/responses', responsesController.submitResponse);
router.get('/:id/responses', responsesController.getResponsesByFormId);
router.delete('/:id/responses/:rid', responsesController.deleteResponse);

module.exports = router;
