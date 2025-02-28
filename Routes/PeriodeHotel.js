const express=require('express');
const PeriodeController=require('../Controllers/PeriodehotelController');
const router=express.Router();

router.post('/ceateperiodehotel/:hotelId',PeriodeController.createPeriodeHotel);
router.post('/serach',PeriodeController.searchHotels)
router.get('/getperiodebyidhotel/:hotelId',PeriodeController.getAllPeriodeByHotelid);
module.exports=router;