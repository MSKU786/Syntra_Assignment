const express = require('express');
const {connectDB} = require('./src/config/db');
const {authRoutes} = require('./src/routes/auth');
const {projectRoutes} = require('./src/routes/project');
const {incidentRoutes} = require('./src/routes/incident');
require('dotenv').config();
const cors = require('cors');
const app = express();

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({extended: true}));



app.use('/api/auth', authRoutes);
app.use('/api/projects', projectRoutes);
app.use('/api/incidents', incidentRoutes);

const PORT = process.env.port || 4000;

(async () => {
  try {
    await connectDB();

    app.listen(PORT, () => {
      console.log(`App listening to port ${PORT}`);
    });
  } catch (err) {
    console.log(err);
  }
})();
