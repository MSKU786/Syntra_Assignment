const {sequelize} = require('../config/db');
const {DataTypes} = require('sequelize');

module.exports = () => {
  const Incident = sequelize.define(
    'Incident',
    {
      incident_id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true,
      },
      title: {
        type: DataTypes.STRING(80),
      },
      description: {
        type: DataTypes.TEXT,
      },
      project_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },
      severity: {
        type: DataTypes.ENUM('low', 'moderate', 'high'),
        defaultValue: 'low',
      },
      status: {
        type: DataTypes.ENUM('open', 'closed'),
        defaultValue: 'open',
      },
      reported_by: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },
      reported_on: {
        type: DataTypes.DATE,
        defaultValue: DataTypes.NOW,
      },
    },
    {
      tableName: 'incidents',
      timesstamps: false,
    }
  );
  return Incident;
};

/*
Incident
incident_id, title, description, severity (Low, Moderate, High), status, project_id, reported_by, reported_on
*/
