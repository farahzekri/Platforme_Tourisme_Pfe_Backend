
const bcrypt = require('bcrypt');
const B2B = require('../Models/b2b');




const registerUser = async (req, res) => {
    try {
        const { nameAgence, email, password, phoneNumber, address, city, country } = req.body;

    
        if (!nameAgence || !email || !password || !phoneNumber || !address || !city || !country ) {
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
            
        });

        await newb2b.save();

        res.status(201).json({ message: 'Agence enregistrée avec succès.' });
    } catch (error) {
        console.error('Error during registration:', error);

        res.status(500).json({ error: 'Erreur interne du serveur.' });
    }
};

module.exports = {
    registerUser,
};