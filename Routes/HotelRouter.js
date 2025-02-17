const express =require('express');
const HotelController= require('../Controllers/HotelController');

const router=express.Router();


router.post('/createhotel',HotelController.createHotel);
router.get('/getallhotel',HotelController.getAllHotels);
router.get('/gethotelbyid/:b2bId',HotelController.getHotelsByB2B);
router.put('/upadehotel/:id',HotelController.updateHotel);
router.delete('/delete/id',HotelController.deleteHotel);
module.exports=router;