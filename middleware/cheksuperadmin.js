 const checkSuperAdmin = (req, res, next) => {
    console.log("Rôle de l'utilisateur :", req.user.role);
    if (req.user.role !== 'superadmin') {
        return res.status(403).json({ message: 'Accès refusé. Vous n\'êtes pas un superadmin.' });
    }
    next(); // L'utilisateur est un superadmin, on passe à la route suivante
};
module.exports = checkSuperAdmin;