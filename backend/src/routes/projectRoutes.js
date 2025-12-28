const router = require('express').Router();
const auth = require('../middleware/authMiddleware');
// Import the new deleteProject function
const { listProjects, createProject, deleteProject } = require('../controllers/projectController');

router.get('/', auth, listProjects);
router.post('/', auth, createProject);

// ADD THIS LINE:
router.delete('/:id', auth, deleteProject);

module.exports = router;