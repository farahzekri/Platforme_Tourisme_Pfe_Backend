const Admin = require('../Models/admin');

// Créer un nouvel Admin
const createAdmin = async (req, res) => {
    try {
        const { username, email, password, role } = req.body;

      
        if (!['admin'].includes(role)) {
            return res.status(400).json({ message: 'Invalid role specified' });
        }

      
        const existingAdmin = await Admin.findOne({ email });
        if (existingAdmin) {
            return res.status(400).json({ message: 'Email already in use' });
        }

       
        const newAdmin = new Admin({ username, email, password, role });
        await newAdmin.save();

        res.status(201).json({ message: `${role} created successfully`, newAdmin });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
};

module.exports={
    createAdmin,
}