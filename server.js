const mongoose = require('mongoose');
const dotevn = require('dotenv');

process.on('uncaughtException', (err) => {
  // console.log(err);
  // console.log('UNCAUGHT EXCEPTION - Shutting Down App');
  process.exit(1);
});

dotevn.config({ path: './config.env' });
const app = require('./app');

const DB = process.env.DATABASE.replace(
  '<PASSWORD>',
  process.env.DATABASE_PASSWORD
);

mongoose
  //.connect(process.env.DATABASE_LOCAL, {
  .connect(DB, {
    useNewUrlParser: true,
    useCreateIndex: true,
    useFindAndModify: false,
    useUnifiedTopology: true,
  })
  .then(() => {
    console.log('✅ DB Connection made');
  });

const port = process.env.PORT || 3000;
const server = app.listen(port, () => {
  console.log(`✅ App running on port ${port}...`);
});

// UNHANDLED REJECTION
process.on('unhandledRejection', (err) => {
  console.log(err.name, err.message);
  console.log('❗❗❗ UNHANDLED REJECTION - Shutting Down App ❗❗❗');
  server.close(() => {
    process.exit(1);
  });
});

process.on('SIGTERM', () => {
  console.log('❗❗❗ SIGTERM RECIEVED. Shutting down gracefully ❗❗❗');
  server.close(() => {
    console.log('💤 Process Terminated!');
  });
});
