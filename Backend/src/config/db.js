const {Sequelize} = require('sequelize');

const sequelize = new Sequelize({
  dialect: 'sqlite',
  storage: './database_sqlite',
  logging: false,
});

const connectDB = async () => {
  // Synchronize
  sequelize.sync();

  await sequelize.authenticate();
  console.log('Connected to DB');
};

module.exports = {sequelize, connectDB};
