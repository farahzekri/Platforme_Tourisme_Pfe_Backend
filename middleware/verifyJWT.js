const jwt = require('jsonwebtoken')


const verifyJWT = (req, res, next) => {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        console.error("En-tête Authorization manquant ou invalide");
        return res.status(401).json({ message: 'Non autorisé' });
    }

    const token = authHeader.split(' ')[1]; // Extraire le token après "Bearer"
    console.log("Token reçu :", token);

    jwt.verify(token, process.env.ACCESS_TOKEN_SECRET, (err, decoded) => {
        if (err) {
            console.error("Échec de la vérification du JWT :", err.message);
            if (err.name === 'TokenExpiredError') {
                return res.status(403).json({ message: 'Token expiré' });
            }
            return res.status(403).json({ message: 'Interdit' });
        }

        console.log("JWT décodé :", decoded);
        req.user = {
            id: decoded.id,
            email: decoded.email,
            role: decoded.role || null,
            username: decoded.role || null,
            collection: decoded.collection || null,
        };

        next();
    });
};


module.exports = verifyJWT;

