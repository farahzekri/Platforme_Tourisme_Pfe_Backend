
const express = require('express');
const router = express.Router();
const verifyJWT = require('../middleware/verifyJWT');
const  checkSuperAdmin  = require('../middleware/cheksuperadmin');
const History =require('../Models/Historique');

router.get('/gethistrique', verifyJWT, checkSuperAdmin, async (req, res) => {
    try {
        const history = await History.find().populate('admin', 'username');
        res.status(200).json(history);
    } catch (error) {
        res.status(500).json({ message: 'Erreur serveur', error });
    }
});

module.exports = router;