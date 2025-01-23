const express = require('express');
const router = express.Router();
const controllerUser=require('../Controllers/controllerUser')


router.post('/register', controllerUser.registerUser);

module.exports = router;