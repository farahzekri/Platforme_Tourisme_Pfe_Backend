
const bcrypt = require('bcrypt');
const B2B = require('../Models/b2b');




const registerUser = async (req, res) => {
    try {
        const { nameAgence, email, password, phoneNumber, address, city, country, documents,typeAgence} = req.body;

    
        if (!nameAgence || !email || !password || !phoneNumber || !address || !city || !country ||!documents || !typeAgence) {
            return res.status(400).json({ error: 'Tous les champs sont requis.' });
        }

        const existingUser = await B2B.findOne({ email });
        if (existingUser) {
            return res.status(400).json({ error: 'Un utilisateur avec cet email existe déjà.' });
        }

       
        const newb2b = new B2B({
            nameAgence,
            email,
            password,
            phoneNumber,
            address,
            city,
            country,
            documents,
            typeAgence,
            
        });

        await newb2b.save();

        res.status(201).json({ message: 'Agence enregistrée avec succès.' });
    } catch (error) {
        console.error('Error during registration:', error);

        res.status(500).json({ error: 'Erreur interne du serveur.' });
    }
};
const getAllB2BUsers = async (req, res) => {
    try {
        const b2bUsers = await B2B.find({ status: 'pending' });
        res.status(200).json(b2bUsers);
    } catch (error) {
        res.status(500).json({ error: 'Erreur lors de la récupération des utilisateurs B2B.' });
    }
};
const updateB2BStatus = async (req, res) => {
    const { nameAgence, status } = req.body;

    
    if (req.user.collection !== 'admin' || req.user.role !== 'superadmin') {
        return res.status(403).json({ message: 'Forbidden: Insufficient permissions' });
    }

   
    if (!['pending', 'approved', 'rejected'].includes(status)) {
        return res.status(400).json({ message: 'Invalid status' });
    }

    
    const b2b = await B2B.findOne(nameAgence).exec();
    if (!b2b) {
        return res.status(404).json({ message: 'B2B agency not found' });
    }

    b2b.status = status;
    await b2b.save();

    return res.json({ message: `Status updated to ${status} for ${b2b.nameAgence}` });
};

module.exports = {
    registerUser,
    getAllB2BUsers,
    updateB2BStatus,
};