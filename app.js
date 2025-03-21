const express = require('express');
const mongoose = require('mongoose');
require('dotenv').config();
const cookieParser = require('cookie-parser');
const {logger} = require('./middleware/logger')
const authRoutes = require('./Routes/authRoutes');
const  Userouter =require('./Routes/Userouter');
const adminrouter=require('./Routes/adminRouter')
const historyrouter=require('./Routes/HistoriqueRouter');
const hotelrouter =require('./Routes/HotelRouter');
const perioderouter =require('./Routes/PeriodeHotel');
const Review =require('./Routes/ReviewRouter');
const cors = require('cors');
const app = express();
app.use(express.json()); 
app.use(logger);
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log('MongoDB connecté'))
  .catch((err) => console.error('Erreur de connexion à MongoDB:', err));

  app.use(cors({
    origin: "http://localhost:3000", // Spécifie le frontend
    credentials: true, // Autorise l'envoi des cookies et headers d'authentification
    allowedHeaders: ["Content-Type", "Authorization"],
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"]
}));
app.use((req, res, next) => {
  res.setHeader('Cross-Origin-Opener-Policy', 'same-origin');
  res.setHeader('Cross-Origin-Embedder-Policy', 'require-corp');
  next();
});



app.use('/auth', authRoutes);
app.use('/agence',Userouter);
app.use('/admin',adminrouter);
app.use('/History',historyrouter);
app.use('/hotel',hotelrouter);
app.use('/periode',perioderouter);
app.use('/review',Review);
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});