const express=require('express');
const ReservationControllers=require('../Controllers/ReservationController');
const router=express.Router();

router.post('/creatreservation/:hotelId',ReservationControllers.addReservation);

module.exports=router;