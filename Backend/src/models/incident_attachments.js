/*
IncidentAttachment
attachment_d, incident_id, file_url, comment, uploaded_at
*/

const {sequelize} = require('../config/db');
const {DataTypes} = require('sequelize');

module.exports = () => {
  const IncidentAttachment = sequelize.define(
    'IncidentAttachment',
    {
      attachment_id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true,
      },
      incident_id: {
        type: DataTypes.STRING(80),
      },
      file_url: {
        type: DataTypes.STRING(80),
        allowNull: false,
      },
      comment: {
        type: DataTypes.TEXT,
      },
      uploaded_at: {
        type: DataTypes.DATE,
        defaultValue: DataTypes.NOW,
      },
    },
    {
      tableName: 'incident_attachments',
      timesstamps: false,
    }
  );
  return IncidentAttachment;
};
