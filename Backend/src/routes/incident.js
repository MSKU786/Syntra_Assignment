const express = require('express');

const {Incident, User, IncidentAttachment, Project} = require('../models/');
const authMiddlware = require('../middleware/auth');
const upload = require('../middleware/upload');
const authorzie = require('../middleware/authorize');

const incidentRoutes = express.Router();

incidentRoutes.get('/', authMiddlware, async (req, res) => {
  try {
    const {project_id, severity} = req.query;

    const where = {};

    if (project_id) where.project_id = project_id;
    if (severity) where.severity = severity;

    const incidents = await Incident.findAll({
      where,
      order: [['incident_id', 'DESC']],
    });

    return res.json(incidents);
  } catch (err) {
    console.error('List incidents error', err);
    return res.status(500).json({message: 'server error'});
  }
});

incidentRoutes.get('/:id', authMiddlware, async (req, res) => {
  try {
    const id = req.params.id;

    if (!id) {
      console.error('List incident error', err);
      return res.status(401).json({message: 'id check'});
    }

    const incident = await Incident.findByPk(id);

    if (!incident) {
      return res.status(404).json({
        message: 'Incident not found',
      });
    }

    const attachements = await IncidentAttachment.findAll({
      where: {
        incident_id: incident.incident_id,
      },
    });

    res.json({...incident.dataValues, attachements});
  } catch (err) {
    console.error('List incident error', err);
    return res.status(500).json({message: 'server error'});
  }
});

incidentRoutes.post(
  '/',
  authMiddlware,
  authorzie('admin', 'manager'),
  async (req, res) => {
    try {
      const {title, description, project_id, severity, status} = req.body;

      if (!title || !project_id) {
        return res
          .status(400)
          .json({message: 'Title and project_id are required'});
      }

      // Check project exists

      const project = await Project.findByPk(project_id);

      if (!project) {
        return res.status(400).json({message: 'project doesnt found'});
      }

      const incident = await Incident.create({
        title,
        description,
        project_id,
        reported_by: req.user.id,
        severity: severity || 'low',
        status: status || 'open',
        reported_on: new Date(),
      });

      return res.status(201).json({
        message: 'Incident created successfully',
        incident_id: incident.incident_id,
      });
    } catch (err) {
      console.error('List incident error', err);
      return res.status(500).json({message: 'server error'});
    }
  }
);

incidentRoutes.delete(
  '/:id',
  authMiddlware,
  authorzie('admin', 'manager'),
  async (req, res) => {
    try {
      const id = req.params.id;
      const incident = await Incident.findByPk(id);

      if (!incident) {
        return res.status(404).json({
          message: 'Incident not found',
        });
      }

      // Permission Check
      if (incident.reported_by != req.user.id || req.user.role != 'admin') {
        return res.status(403).json({message: 'not allowed '});
      }

      await IncidentAttachment.destroy({
        where: {incident_id: incident.incident_id},
      });
      await incident.destroy();

      res.json({message: 'Incident deleted successfully'});
    } catch (err) {
      console.error('List incident error', err);
      return res.status(500).json({message: 'server error'});
    }
  }
);

incidentRoutes.post(
  '/:id/attachment',
  authMiddlware,
  upload.array('image', 10), // Accept multiple files (up to 10) with field name 'image'
  async (req, res) => {
    try {
      const incidentId = req.params.id;

      // BUG FIX: Was using 'incidentRoutes' (the router object) instead of 'incidentId'
      const incident = await Incident.findByPk(incidentId);

      if (!incident) {
        return res.status(404).json({
          message: 'Incident not found',
        });
      }

      // When using upload.array(), files are in req.files (plural) as an array
      // When using upload.single(), file is in req.file (singular) as an object
      if (!req.files || req.files.length === 0) {
        return res.status(400).json({message: 'No files uploaded'});
      }

      const attachements = req.files.map((file) => ({
        incident_id: incidentId,
        file_url: file.path, // file.path contains the full path to the uploaded file
        comments: null,
      }));

      await IncidentAttachment.bulkCreate(attachements);

      return res.status(201).json({
        message: 'Attachment Uploaded',
        uploaded: attachements.length,
      });
    } catch (err) {
      console.error('Attachment upload error', err);
      return res.status(500).json({message: 'server error'});
    }
  }
);

module.exports = {incidentRoutes};
