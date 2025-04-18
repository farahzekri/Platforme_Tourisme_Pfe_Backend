const express=require('express');
const ReservationControllers=require('../Controllers/ReservationController');
const router=express.Router();

router.post('/creatreservation/:hotelId',ReservationControllers.addReservation);
router.post("/create", ReservationControllers.createPayment);
router.get("/notify", ReservationControllers.notifyPaymentGet); // pour GET depuis Konnect

router.get("/getreservationbyhotel/:hotelId", ReservationControllers.getReservationsByHotel);

router.get("/getReservationsByB2B/:b2bId", ReservationControllers.getReservationsByB2B);
module.exports=router;