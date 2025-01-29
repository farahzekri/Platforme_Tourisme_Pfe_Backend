const express = require('express');
const router = express.Router();
const controllerUser=require('../Controllers/controllerUser');
const verifyJWT = require('../middleware/verifyJWT');
const  checkSuperAdmin  = require('../middleware/cheksuperadmin');

router.post('/register', controllerUser.registerUser);
router.get('/getuserspending',controllerUser.getAllB2BUsers);
router.post('/updatestatu',verifyJWT,checkSuperAdmin,controllerUser.updateB2BStatus);
router.get('/getusebyname/:nameAgence',controllerUser.getB2BByNameAgence);
module.exports = router;