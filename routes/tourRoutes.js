const express = require('express');
const router = express.Router();
const { protect, restrictTo } = require('../controllers/authController');

const {
  getAllTours,
  getTour,
  createTour,
  updateTour,
  deleteTour,
  aliasTopTours,
  getStats,
  monthlyPlan,
} = require('../controllers/tourController');

router
  .route('/:id')
  .get(getTour)
  .patch(updateTour)
  .delete(protect, restrictTo('admin', 'lead-guide'), deleteTour);
router.route('/stats').get(getStats);
router.route('/monthly-plan/:year').get(monthlyPlan);
router.route('/top-5-tours').get(aliasTopTours, getAllTours);
router.route('/').get(protect, getAllTours).post(createTour);

module.exports = router;
