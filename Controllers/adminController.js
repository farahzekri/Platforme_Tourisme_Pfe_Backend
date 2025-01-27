const Admin = require('../Models/admin');


const createAdmin = async (req, res) => {
    try {
        const { username, email, password, role, privilege } = req.body;

       
        if (req.user.role !== 'superadmin') {
            return res.status(403).json({ message: 'Access denied. Only superadmin can create admins.' });
        }

      
        if (role !== 'admin') {
            return res.status(400).json({ message: 'Invalid role specified. Only "admin" can be created.' });
        }

       
        const existingAdmin = await Admin.findOne({ email });
        if (existingAdmin) {
            return res.status(400).json({ message: 'Email already in use' });
        }

       
        const newAdmin = new Admin({ 
            username, 
            email, 
            password, 
            role, 
            privilege,
        });
        await newAdmin.save();

        res.status(201).json({ message: 'Admin created successfully', newAdmin });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
};
const getAllAdmin = async (req, res) => {
    try {
        
       

        const admins = await Admin.find({ role: 'admin' });
        console.log("Admins trouvés:", admins); // Log des admins
        res.status(200).json(admins);
    } catch (error) {
        console.error("Erreur lors de la récupération des admins:", error.message);
        res.status(500).json({ error: 'Erreur lors de la récupération des admins.' });
    }
};
module.exports={
    createAdmin,
    getAllAdmin,
}