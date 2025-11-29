const {sequelize} = require('../config/db');
const {DataTypes} = require('sequelize');

module.exports = () => {
  const User = sequelize.define(
    'User',
    {
      user_id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true,
      },
      name: {
        type: DataTypes.STRING(80),
      },
      email: {
        type: DataTypes.STRING(80),
        allowNull: false,
      },
      passwordHash: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      role: {
        type: DataTypes.ENUM('admin', 'manager', 'reporter'),
        defaultValue: 'reporter',
        allowNull: false,
      },
    },
    {
      tableName: 'users',
      timesstamps: true,
    }
  );
  return User;
};

/*
User
user_id, name, email, password_hash, role (Admin, Manager, Reporter)
*/
