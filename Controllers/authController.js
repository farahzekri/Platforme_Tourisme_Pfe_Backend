const bcrypt = require('bcrypt')
const jwt = require('jsonwebtoken')
const B2B = require('../Models/b2b');
const Admin = require('../Models/admin');
const History =require('../Models/Historique');
const asyncHandler = require('express-async-handler')


const generateAccessToken = (user,collection) => {
    const accessTokenPayload = {id: user._id, email: user.email, collection,role:user.role};
    return jwt.sign(accessTokenPayload, process.env.ACCESS_TOKEN_SECRET, { expiresIn: '15m' });
};
const generateRefreshToken = (user, collection) => {
    const refreshTokenPayload = { id: user._id, email: user.email, collection };
    return jwt.sign(refreshTokenPayload, process.env.REFRESH_TOKEN_SECRET, { expiresIn: '7d' });
};

const login = asyncHandler(async (req, res) => {
    const { email, password } = req.body;

    if (!email || !password) {
        return res.status(400).json({ message: 'Tous les champs sont requis.' });
    }

    let foundUser = await Admin.findOne({ email }).exec(); 
    let collection = 'admin'; 

    if (!foundUser) {
        foundUser = await B2B.findOne({ email }).exec(); 
        collection = 'b2b';
    }

    if (!foundUser) {
        return res.status(401).json({ message: 'Non autorisé. Utilisateur non trouvé.' });
    }

    const match = await bcrypt.compare(password, foundUser.password);
    if (!match) {
        return res.status(401).json({ message: 'Non autorisé. Mot de passe incorrect.' });
    }

    const accessToken = generateAccessToken(foundUser, collection);
    const refreshToken = generateRefreshToken(foundUser, collection);

    res.cookie('jwt', refreshToken, {
        httpOnly: true,
        secure: true,
        sameSite: 'none',
        maxAge: 7 * 24 * 60 * 60 * 1000, 
    });
    try {
        await History.create({
            admin: foundUser._id,
            action: 'Connexion',
            details: `${foundUser.username || foundUser.nameAgence} s'est connecté(e) à la plateforme.`,
            date: new Date(),
        });
    } catch (error) {
        console.error('Erreur lors de l’enregistrement de l’historique:', error);
    }
    return res.json({
        accessToken,
        collection,
        email: foundUser.email,
        name: foundUser.username || foundUser.nameAgence, 
        statue:foundUser.status,
        role:foundUser.role,
        privilege:foundUser.privilege  || '',
        typeAgence:foundUser.typeAgence || ''
    });
});

const refresh = asyncHandler(async (req, res) => {
    const cookies = req.cookies;

    if (!cookies?.jwt) return res.status(401).json({ message: 'Unauthorized' });

    const refreshToken = cookies.jwt;

    jwt.verify(refreshToken, process.env.REFRESH_TOKEN_SECRET, async (err, decoded) => {
        if (err) return res.status(403).json({ message: 'Forbidden' });

        const { email, collection } = decoded; 

        let user;
        if (collection === 'admin') {
            user = await Admin.findOne({ email }).exec();
        } else if (collection === 'b2b') {
            user = await B2B.findOne({ email }).exec();
        }

        if (!user) return res.status(401).json({ message: 'Unauthorized user' });

        const accessToken = generateAccessToken(user, collection);

        return res.json({
            accessToken,
            collection,
            email: user.email,
            name: user.username || user.nameAgence,
            status: user.status,
            role:user.role,
            privilege:user.privilege ,
            typeAgence:user.typeAgence || ''
        });
    });
});

const logout =(req,res)=>{
 const cookies =req.cookies
 if(!cookies?.jwt) return res.sendStatus(204)
 res.clearCookie('jwt',{httpOnly:true,sameSite:'None',secure:true})
res.json({message:'Cookie cleard'})    
}

module.exports={
    login,
    refresh,
    logout,
}