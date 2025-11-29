const sequelize = require('../config/db');
const defineUser = require('./user');
const defineProject = require('./project');
const defineIncident = require('./incident');
const defineAttachment = require('./incident_attachments');

const User = defineUser(sequelize);
const Project = defineProject(sequelize);
const Incident = defineIncident(sequelize);
const IncidentAttachment = defineAttachment(sequelize);

// Relations

User.hasMany(Incident, {
  foreignKey: 'reported_by',
  as: 'incidents',
});
Incident.belongsTo(User, {
  foreignKey: 'reported_by',
  as: 'reporter',
});

Project.hasMany(Incident, {
  foreignKey: 'project_id',
  as: 'incidents',
});
Incident.belongsTo(Project, {
  foreignKey: 'project_id',
  as: 'projects',
});

Incident.hasMany(IncidentAttachment, {
  foreignKey: 'incident_id',
  as: 'attachments',
  onDelete: 'CASCADE',
});
IncidentAttachment.belongsTo(Incident, {
  foreignKey: 'incident_id',
  as: 'incident',
});

module.exports = {
  User,
  Project,
  Incident,
  IncidentAttachment,
};
