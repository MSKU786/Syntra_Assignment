const {sequelize} = require('../config/db');
const {DataTypes} = require('sequelize');

module.exports = () => {
  const Project = sequelize.define(
    'Project',
    {
      project_id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true,
      },
      project_name: {
        type: DataTypes.STRING(80),
        allowNull: false,
      },
      location: {
        type: DataTypes.STRING(80),
        allowNull: false,
      },
    },
    {
      tableName: 'projects',
      timesstamps: true,
    }
  );
  return Project;
};

/*
Project
project_id, project_name, location

*/
