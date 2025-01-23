const mongoose = require('mongoose');

const connectDB = async () => {
    try {
        const connectionString = process.env.MONGO_URI;

        await mongoose.connect(connectionString);

        console.log('Connected to the database');

        const collections = await mongoose.connection.db.listCollections().toArray();
        console.log('Collections disponibles :', collections.map(col => col.name));
    } catch (error) {
        console.error('Error connecting to the database:', error.message);
        process.exit(1);
    }
};

connectDB();
