const path = require('path');
const express = require('express');
const morgan = require('morgan');
const rateLimit = require('express-rate-limit');
const helmet = require('helmet');
const mongoSanitize = require('express-mongo-sanitize');
const xss = require('xss-clean');
const hpp = require('hpp');
const cookieParser = require('cookie-parser');
const compression = require('compression');

const AppError = require('./utils/appError');
const globalErrorHandler = require('./controllers/errorController');
const tourRouter = require('./routes/tourRoutes');
const userRouter = require('./routes/userRoutes');
const reviewRouter = require('./routes/reviewRoutes');
const bookingRouter = require('./routes/bookingRoutes');
const viewRouter = require('./routes/viewRoutes');

const app = express();

app.enable('trust proxy');

app.set('view engine', 'pug');
app.set('views', path.join(__dirname, 'views'));

// Serving Static files
app.use(express.static(path.join(__dirname, 'public')));

///////////////////////////////// GLOBAL MIDDLEWARE //////////////////////////////////////
// Set Security HTTP
app.use(helmet());

//app.use(
//   helmet.contentSecurityPolicy({
//     directives: {
//       defaultSrc: ['self', 'data:', 'blob:'],
//       baseUri: ['self'],
//       fontSrc: ['self', 'https:', 'data:', 'https://*.googleapis.com'],
//       scriptSrc: [
//         'self',
//         'https://*.cloudflare.com',
//         'https://*.stripe.com',
//         'https://*.mapbox.com',
//       ],
//       frameSrc: ['self', 'https://*.stripe.com'],
//       objectSrc: ['none'],
//       styleSrc: ['self', 'https:', 'unsafe-inline'],
//       workerSrc: ['self', 'data:', 'blob:'],
//       childSrc: ['self', 'blob:'],
//       imgSrc: ['self', 'data:', 'blob:'],
//       connectSrc: [
//         'self',
//         'blob:',
//         'https://*.mapbox.com',
//         'https://*.cloudflare.com',
//       ],
//       upgradeInsecureRequests: [],
//     },
//   })
// );

// Dev logging
// console.log(process.env.NODE_ENV);
if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
}

// Limit requests from same IP
const limiter = rateLimit({
  max: 100,
  windowMS: 60 * 60 * 1000,
  message: 'Too many requests from this IP, please try back in one hour',
});
app.use('/api/', limiter);

// Body parser, reading data from boy into  req.body
app.use(express.json({ limit: '10kb' }));
app.use(express.urlencoded({ extended: true, limit: '10kb' }));
app.use(cookieParser());

// Data sanitization against NoSQL query injection
app.use(mongoSanitize());

// Data sanitization against XSS
app.use(xss());

// Prevent parameter pollution
app.use(
  hpp({
    whitelist: [
      'duration',
      'ratingsAvergae',
      'ratingsQuatitiy',
      'maxGroupSize',
      'difficulty',
      'price',
    ],
  })
);

app.use(compression());

// Test Middleware
app.use((req, res, next) => {
  req.requestTime = new Date().toISOString();
  next();
});

///////////////////////////////// MOUNT ROUTES //////////////////////////////////////

app.use('/', viewRouter);
app.use('/api/v1/tours', tourRouter);
app.use('/api/v1/users', userRouter);
app.use('/api/v1/reviews', reviewRouter);
app.use('/api/v1/bookings', bookingRouter);

app.all('*', (req, res, next) => {
  next(new AppError(`Can not find ${req.originalUrl} on server`, 404));
});

app.use(globalErrorHandler);

// Start SERVER in app.js
module.exports = app;
