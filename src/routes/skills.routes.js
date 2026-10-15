const express = require('express');
const router = express.Router();
const skillsController = require('../controllers/skills.controller');
const { requireAdminAuth } = require('../middlewares/auth');
const { validateStringParam } = require('../middlewares/validateParams');

// Public routes
router.get('/', skillsController.getAllSkills);
router.get('/:id', validateStringParam('id'), skillsController.getSkillById);

// Admin protected routes
router.post('/', requireAdminAuth, skillsController.createSkill);
router.put('/:id', requireAdminAuth, validateStringParam('id'), skillsController.updateSkill);
router.delete('/:id', requireAdminAuth, validateStringParam('id'), skillsController.deleteSkill);

module.exports = router;
