const express=require('express');
const ReservationControllers=require('../Controllers/ReservationController');
const router=express.Router();

router.post('/creatreservation/:hotelId',ReservationControllers.addReservation);
router.post("/create", ReservationControllers.createPayment);
router.post("/notify", ReservationControllers.notifyPayment); 

module.exports=router;