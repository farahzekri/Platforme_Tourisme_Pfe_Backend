const express=require('express')
const router =express.Router()
const authController =require('../Controllers/authController')
const loginLimiter= require('../middleware/loginLimiter')

router.post('/login',loginLimiter, authController.login)
router.get('/refresh',authController.refresh)   
router.post ('/logout',authController.logout)
router.post('/google/callback',authController.registerWithGoogle);   

module.exports=router