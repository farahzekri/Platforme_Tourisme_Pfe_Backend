const passport = require('passport');
const LocalStrategy = require('passport-local').Strategy;
const jwt = require('jsonwebtoken');
const dotenv = require('dotenv');
const bcrypt = require('bcrypt');
const Admin = require('../Models/admin'); 
const B2B = require('../Models/b2b');

dotenv.config();

 
passport.use(new LocalStrategy({
    usernameField: 'email', 
    passwordField: 'password',
}, async (email, password, done) => {
    try {
   
        let user = await Admin.findOne({ email });

        if (!user) {
      
            user = await B2B.findOne({ email });
        }

        if (!user) {
            return done(null, false, { message: 'Email incorrect' });
        }

      
        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return done(null, false, { message: 'Mot de passe incorrect' });
        }

        // Génération du token JWT
        const token = jwt.sign(
            { id: user._id, email: user.email },
            process.env.JWT_SECRET,
            { expiresIn: '7d' }
        );

        return done(null, { user, token });
    } catch (error) {
        return done(error);
    }
}));

passport.serializeUser((user, done) => {
    done(null, user);
});

passport.deserializeUser((user, done) => {
    done(null, user);
});

module.exports = passport;
