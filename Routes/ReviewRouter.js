const express=require('express');
const ReviewController=require('../Controllers/ReviewController');
const router=express.Router();

router.post('/ceateReview/:hotelId',ReviewController.addReview);
router.get('/get/:hotelId',ReviewController.getReviewsByHotel);

module.exports=router;