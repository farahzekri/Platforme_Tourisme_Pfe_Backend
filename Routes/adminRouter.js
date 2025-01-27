const express = require('express');
// const { authenticate, authorizeRole } = require('../middlewares/authMiddleware');
const controlleradmin = require('../Controllers/adminController');

const verifyJWT = require('../middleware/verifyJWT');
const  checkSuperAdmin  = require('../middleware/cheksuperadmin');

const router = express.Router();


router.post('/create' , verifyJWT,checkSuperAdmin,controlleradmin.createAdmin);
router.get('/getall',verifyJWT,checkSuperAdmin, controlleradmin.getAllAdmin);

   module.exports = router;