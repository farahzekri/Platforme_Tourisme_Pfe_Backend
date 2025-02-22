const express =require('express');
const HotelController= require('../Controllers/HotelController');

const verifyJWT = require('../middleware/verifyJWT');
const router=express.Router();


router.post('/createhotel',verifyJWT,HotelController.createHotel);
router.get('/getallhotel',HotelController.getAllHotels);
router.get('/gethotelbyid',verifyJWT,HotelController.getHotelsByB2B);
router.put('/upadehotel/:id',HotelController.updateHotel);
router.delete('/delete/id',HotelController.deleteHotel);
module.exports=router;