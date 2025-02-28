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
        //     const history = new History({
        //             admin: req.user.id,  
        //             action: 'Ajout Admin',
        //             details: `L'agence ${nameAgence} a été ajoutée par ${req.user.username}`,
        //         });
        
        //         await history.save();

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
const deleteAdmin = async (req, res) => {
    try {
        const { username } = req.params;  // Get username from params
        
        if (req.user.role !== 'superadmin') {
            return res.status(403).json({ message: 'Access denied. Only superadmin can delete admins.' });
        }

        // Corrected query to find by username
        const adminToDelete = await Admin.findOne({ username });  
        if (!adminToDelete) {
            return res.status(404).json({ message: 'Admin not found' });
        }

        // Corrected to use username in the delete operation
        await Admin.findOneAndDelete({ username });

        res.status(200).json({ message: 'Admin deleted successfully' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
};
const updateAdmin = async (req, res) => {
    try {
        const { currentUsername } = req.params; 
        const { newUsername, newEmail } = req.body; 

  
        const admin = await Admin.findOne({ username: currentUsername });
        if (!admin) {
            return res.status(404).json({ message: 'Admin not found' });
        }

       
        admin.username = newUsername || admin.username;
        admin.email = newEmail || admin.email;

        
        await admin.save();

        res.status(200).json({ message: 'Admin updated successfully', admin });
    } catch (error) {
        if (error.code === 11000) {
          
            return res.status(400).json({ message: 'Username or email already exists' });
        }
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
};
const countAdmins = async (req, res) => {
    try {
        const totalAdmins = await Admin.countDocuments();

        // Calcul du mois dernier
        const lastMonth = new Date();
        lastMonth.setMonth(lastMonth.getMonth() - 1);

        const newAdmins = await Admin.countDocuments({ createdAt: { $gte: lastMonth } });

        res.status(200).json({ totalAdmins, newAdmins });
    } catch (error) {
        console.error("Erreur lors du comptage des administrateurs:", error);
        res.status(500).json({ message: "Erreur lors du comptage des administrateurs." });
    }
};
module.exports={
    createAdmin,
    getAllAdmin,
    deleteAdmin,
    updateAdmin,
    countAdmins,
}