const express = require('express');
// const { authenticate, authorizeRole } = require('../middlewares/authMiddleware');
const controlleradmin = require('../Controllers/adminController');

const router = express.Router();


router.post('/create',
// authenticate,authorizeRole(['subadmin']), 
   controlleradmin.createAdmin);


   module.exports = router;