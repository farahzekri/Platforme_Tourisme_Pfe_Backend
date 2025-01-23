const express = require('express');
const mongoose = require('mongoose');
require('dotenv').config();
const cookieParser = require('cookie-parser');
const {logger} = require('./middleware/logger')
const authRoutes = require('./Routes/authRoutes');
const  Userouter =require('./Routes/Userouter');
const adminrouter=require('./Routes/adminRouter')
const cors = require('cors');
const app = express();
app.use(express.json()); 
app.use(logger);
app.use(cookieParser());
mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log('MongoDB connecté'))
  .catch((err) => console.error('Erreur de connexion à MongoDB:', err));

  app.use(cors({
    origin: 'http://localhost:3000',
    credentials: true,
}));

app.use((req, res, next) => {
    res.setHeader('Access-Control-Allow-Origin', 'http://localhost:3000');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
    res.setHeader('Access-Control-Allow-Credentials', 'true');
    next();
});


app.use('/auth', authRoutes);
app.use('/agence',Userouter)
app.use('/admin',adminrouter)
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});