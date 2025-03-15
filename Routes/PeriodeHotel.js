const express=require('express');
const PeriodeController=require('../Controllers/PeriodehotelController');
const router=express.Router();

router.post('/ceateperiodehotel/:hotelId',PeriodeController.createPeriodeHotel);
router.post('/serach',PeriodeController.searchHotels)
router.get('/getperiodebyidhotel/:hotelId',PeriodeController.getAllPeriodeByHotelid);
router.get('/gethotels',PeriodeController.getHotelsetprixmin);
router.put('/upadeperiode/:id',PeriodeController.updateperiode);
router.get('/getperiodebyidperiode/:id',PeriodeController.getperiodebyidperiode);
router.delete('/deleteperiode/:id',PeriodeController.deletePeriode);
router.get('/getdetailHotel/:id',PeriodeController.getHotelDetails);
router.get('/getavailbol/:id',PeriodeController.getHotelAvailability);
module.exports=router;