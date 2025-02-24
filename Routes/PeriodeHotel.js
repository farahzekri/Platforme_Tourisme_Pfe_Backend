const express=require('express');
const PeriodeController=require('../Controllers/PeriodehotelController');
const router=express.Router();

router.post('/ceateperiodehotel/:hotelId',PeriodeController.createPeriodeHotel);

module.exports=router;