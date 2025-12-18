const express = require('express');
const authMiddlware = require('../middleware/auth');
const authorize = require('../middleware/authorize');
const {
  createPost,
  getPostById,
  updateProject,
  deleteProject,
} = require('../controllers/project_controller');
const projectRoutes = express.Router();

projectRoutes.post(
  '/',
  authMiddlware,
  authorize('admin', 'manager'),
  createPost
);

projectRoutes.get('/:id', authMiddlware, getPostById);

projectRoutes.put(
  '/:id',
  authMiddlware,
  authorize('admin', 'manager'),
  updateProject
);

projectRoutes.delete(
  '/:id',
  authMiddlware,
  authorize('admin', 'manager'),
  deleteProject
);

module.exports = {projectRoutes};
