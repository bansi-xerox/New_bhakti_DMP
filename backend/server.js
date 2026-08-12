const app = require('./app');
const connectDB = require('./config/db');
const dotenv = require('dotenv');

dotenv.config();

const PORT = process.env.PORT || 5000;

connectDB();

app.listen(PORT, () => {
  console.log(`Server running in ${process.env.NODE_ENV || 'development'} mode on port ${PORT}`);
});