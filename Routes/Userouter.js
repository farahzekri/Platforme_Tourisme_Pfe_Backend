const express = require('express');
const router = express.Router();
const controllerUser=require('../Controllers/controllerUser');
const verifyJWT = require('../middleware/verifyJWT');
const  checkSuperAdmin  = require('../middleware/cheksuperadmin');

router.post('/register',controllerUser.registerUser);
router.get('/getuserspending',controllerUser.getAllB2BUsers);
router.post('/updatestatu',verifyJWT,checkSuperAdmin,controllerUser.updateB2BStatus);
router.get('/getusebyname/:nameAgence',controllerUser.getB2BByNameAgence);
router.get('/getusersAccepted',controllerUser.getAllB2BUsersAccpe);
router.get('/getAgencyStats',controllerUser.getAgencyStats);
router.put('/modifcation/:nameAgence',verifyJWT,checkSuperAdmin,controllerUser.updateB2b);
router.delete('/delete/:nameAgence',verifyJWT,controllerUser.deleteB2b);
router.post('/agence/add', verifyJWT, controllerUser.addAgence);
module.exports = router;