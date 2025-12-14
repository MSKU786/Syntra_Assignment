const express = require('express');

const {Project} = require('../models/');
const authMiddlware = require('../middleware/auth');
const projectRoutes = express.Router();

projectRoutes.post(
  '/',
  authMiddlware,
  authorzie('admin', 'manager'),
  async (req, res) => {
    try {
      const {name, location} = req.body;

      if (!name || !location) {
        return res.status(400).json({
          message: 'Name and location required',
        });
      }

      const project = await Project.create({
        project_name: name,
        location,
      });

      return res.status(201).json({
        message: 'Project created successfully',
        project,
      });
    } catch (err) {
      console.log(err);
      return res.status(500).json({message: 'server error'});
    }
  }
);

projectRoutes.get('/:id', authMiddlware, async (req, res) => {
  try {
    const id = req.params.id;
    const project = await Project.findByPk(id);

    if (!project) {
      return res.status(400).json({message: 'Project not found'});
    }

    return res.json(project);
  } catch (err) {
    return res.status(500).json({message: 'server error'});
  }
});

projectRoutes.put(
  '/:id',
  authMiddlware,
  authorzie('admin', 'manager'),
  async (req, res) => {
    try {
      const id = req.params.id;
      const project = await Project.findByPk(id);
      if (!project) {
        return res.status(400).json({message: 'Project not found'});
      }

      const {name, location} = req.body;

      const updateData = {};
      if (name) updateData.project_name = name;
      if (location) updateData.location = location;

      await project.update(updateData);

      return res.json({msg: 'Successfully updated', project});
    } catch (err) {
      console.log(err);
      return res.status(500).json({message: 'server error'});
    }
  }
);

projectRoutes.delete(
  '/:id',
  authMiddlware,
  authorzie('admin', 'manager'),
  async (req, res) => {
    try {
      const id = req.params.id;
      const project = await Project.findByPk(id);
      if (!project) {
        return res.status(400).json({message: 'Project not found'});
      }

      await project.destroy();

      return res.status(204).json({msg: 'Successfully Delete'});
    } catch (err) {
      return res.status(500).json({message: 'server error'});
    }
  }
);

module.exports = {projectRoutes};
