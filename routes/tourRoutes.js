const express = require('express');
const tourController = require('../controllers/tourController');
const authController = require('../controllers/authController');
const reviewRouter = require('./reviewRoutes');

const router = express.Router();

router.use('/:tourId/reviews', reviewRouter);

// router.param('id', tourController.checkID);
router
  .route('/top-5-tours') // Top 5
  .get(tourController.aliasTopTours, tourController.getAllTours);

router
  .route('/tour-stats') // Top 5
  .get(tourController.getTourStats);

router
  .route('/monthly-plan/:year') // Top 5
  .get(
    authController.protect,
    authController.restrictTo('admin', 'lead-guide', 'guides'),
    tourController.getMonthlyPlan
  );

router
  .route('/tours-within/:distance/center/:latlng/unit/:unit')
  .get(tourController.getToursWithin);

router.route('/distances/:latlng/unit/:unit').get(tourController.getDistances);

router
  .route('/') // All Tours
  .get(authController.protect, tourController.getAllTours)
  .post(
    authController.protect,
    authController.restrictTo('admin', 'lead-guide'),
    tourController.createTour
  );

router
  .route('/:id') // Individual Tours
  .get(tourController.getTour)
  .patch(
    authController.protect,
    authController.restrictTo('admin', 'lead-guide'),
    tourController.uploadTourImages,
    tourController.resizeTourImages,
    tourController.updateTour
  )
  .delete(
    authController.protect,
    authController.restrictTo('admin', 'lead-guide'),
    tourController.deleteTour
  );

module.exports = router;
