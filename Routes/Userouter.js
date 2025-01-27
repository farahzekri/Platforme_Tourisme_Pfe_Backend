const express = require('express');
const router = express.Router();
const controllerUser=require('../Controllers/controllerUser');
const verifyJWT = require('../middleware/verifyJWT');


router.post('/register', controllerUser.registerUser);
router.get('/getuserspending',controllerUser.getAllB2BUsers);
router.post('/updatestatu',verifyJWT,controllerUser.updateB2BStatus)
module.exports = router;