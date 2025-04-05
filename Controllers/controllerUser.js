
const bcrypt = require('bcrypt');
const B2B = require('../Models/b2b');
const Admin=require('../Models/admin');
const History =require('../Models/Historique');
const nodemailer = require('nodemailer');
const crypto = require('crypto');

const PDFDocument = require('pdfkit');
const fs = require('fs');
const path = require('path');
require('dotenv').config();
const transporter = nodemailer.createTransport({
    service: 'gmail',
    host: 'smtp.gmail.com',
    port: 587,
    secure: false,
    auth: {
        user: process.env.GMAIL_USER,
        pass: process.env.GMAIL_APP_PASSWORD,
    }
});
const sendEmail = async (to, user) => {
    try {
        await transporter.sendMail({
            from: 'farahzekri473@gmail.com',
            to,
            subject: '🎉 Félicitations ! Votre contrat Hub Travel est prêt !',
            html: `
        <html>
        <head>
            <style>
                body {
                    font-family: Arial, sans-serif;
                    background-color: #f4f4f4;
                    margin: 0;
                    padding: 0;
                }
                .container {
                    max-width: 600px;
                    margin: 20px auto;
                    padding: 20px;
                    background-color: #ffffff;
                    border-radius: 8px;
                    box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
                    text-align: center;
                }
                h1 {
                    color: #2c3e50;
                }
                p {
                    color: #666666;
                    line-height: 1.6;
                }
                .btn {
                    display: inline-block;
                    padding: 10px 20px;
                    margin-top: 20px;
                    font-size: 16px;
                    color: white;
                    background-color: #3498db;
                    border-radius: 5px;
                    text-decoration: none;
                }
                .btn:hover {
                    background-color: #2980b9;
                }
                .footer {
                    margin-top: 20px;
                    text-align: center;
                    color: #999999;
                }
            </style>
        </head>
        <body>
            <div class="container">
                <img src="https://evey-live.s3.eu-west-3.amazonaws.com/prod.evey.live/hubslogo_a86b1a27a9/hubslogo_a86b1a27a9.png" alt="Hub Travel" width="100">
                <h1>Bienvenue à Hub Travel, ${user.username} !</h1>
                <p>Votre contrat est prêt et joint à cet email.</p>
                <p>Veuillez lire attentivement les conditions et nous contacter si vous avez des questions.</p>
                <p>Une fois signé, veuillez nous le retourner.</p>
                <a href="http://localhost:3000" class="btn">Accéder à votre compte</a>
            </div>
            <div class="footer">
                Cet email a été envoyé par Hub Travel. Ne répondez pas à cet email.
            </div>
        </body>
        </html>
            `,
            attachments: [
                {
                    filename: 'Contrat_HubTravel.pdf',
                    path: user.contractFile
                }
            ]
        });

        console.log(`✅ Email avec contrat envoyé à ${to}`);
    } catch (error) {
        console.error('❌ Erreur lors de l\'envoi de l\'email:', error);
    }
};
const sendEmailRegistre = async (to, user) => {
    try {
        await transporter.sendMail({
            from: 'farahzekri473@gmail.com',
            to,
            subject: '🚀 Votre inscription a été reçue ! En attente d\'approbation', // Sujet
            html: `
        <html>
        <head>
            <style>
                body {
                    font-family: Arial, sans-serif;
                    background-color: #f4f4f4;
                    margin: 0;
                    padding: 0;
                }
                .container {
                    max-width: 600px;
                    margin: 20px auto;
                    padding: 20px;
                    background-color: #ffffff;
                    border-radius: 8px;
                    box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
                    text-align: center;
                }
                h1 {
                    color: #2c3e50;
                }
                p {
                    color: #666666;
                    line-height: 1.6;
                }
                .btn {
                    display: inline-block;
                    padding: 10px 20px;
                    margin-top: 20px;
                    font-size: 16px;
                    color: white;
                    background-color: #3498db;
                    border-radius: 5px;
                    text-decoration: none;
                }
                .btn:hover {
                    background-color: #2980b9;
                }
                .footer {
                    margin-top: 20px;
                    text-align: center;
                    color: #999999;
                }
                .highlight {
                    color: #e74c3c;
                    font-weight: bold;
                }
            </style>
        </head>
        <body>
            <div class="container">
                <img src="https://evey-live.s3.eu-west-3.amazonaws.com/prod.evey.live/hubslogo_a86b1a27a9/hubslogo_a86b1a27a9.png" alt="Hub Travel" width="100">
                <h1>Merci pour votre inscription, ${user.nameAgence} !</h1>
                <p>Nous avons bien reçu votre demande d'inscription sur notre plateforme. Cependant, votre compte est actuellement en attente d'approbation par notre administrateur.</p>
                <p>Une fois votre demande validée, vous pourrez accéder à toutes les fonctionnalités et commencer à explorer les opportunités offertes par Hub Travel.</p>
                <p class="highlight">Nous vous prions de patienter jusqu'à ce que le superadministrateur approuve votre demande.</p>
                <p>Si vous avez des questions, n'hésitez pas à nous contacter à tout moment !</p>
                <p>Merci de votre compréhension.</p>
                <a href="http://localhost:3000" class="btn">Retour à l'accueil</a>
            </div>
            <div class="footer">
                Cet email a été envoyé par Hub Travel. Ne répondez pas à cet email.
            </div>
        </body>
        </html>
            `
        });
        console.log(`✅ Email envoyé à ${to}`);
    } catch (error) {
        console.error('❌ Erreur lors de l\'envoi de l\'email:', error);
    }
};
const registerUser = async (req, res) => {
    try {
        const { nameAgence, email, password, phoneNumber, address, city, country, documents, typeAgence } = req.body;

        if (!nameAgence || !email || !password || !phoneNumber || !address || !city || !country || !documents || !typeAgence) {
            return res.status(400).json({ error: 'Tous les champs sont requis.' });
        }

        const existingUser = await B2B.findOne({ email });
        if (existingUser) {
            return res.status(400).json({ error: 'Un utilisateur avec cet email existe déjà.' });
        }

        const newb2b = new B2B({
            nameAgence,
            email,
            password,
            phoneNumber,
            address,
            city,
            country,
            documents,
            typeAgence,
        });

        await newb2b.save();

        sendEmailRegistre(email, { nameAgence });

        res.status(201).json({ message: 'Agence enregistrée avec succès.' });

    } catch (error) {
        console.error('Error during registration:', error);
        res.status(500).json({ error: 'Erreur interne du serveur.' });
    }
};
const addAgence = async (req, res) => {
    try {
        const { nameAgence, email, password, phoneNumber, address, city, country, documents, typeAgence } = req.body;

        if (!nameAgence || !email || !password || !phoneNumber || !address || !city || !country || !documents || !typeAgence) {
            return res.status(400).json({ error: 'Tous les champs sont requis.' });
        }

        const existingUser = await B2B.findOne({ email });
        if (existingUser) {
            return res.status(400).json({ error: 'Un utilisateur avec cet email existe déjà.' });
        }

        const newb2b = new B2B({
            nameAgence,
            email,
            password,
            phoneNumber,
            address,
            city,
            country,
            documents,
            typeAgence,
        });

        await newb2b.save();

        sendEmailRegistre(email, { nameAgence });

        const history = new History({
            action: 'Ajout Agence',
            details: `L'agence ${nameAgence} a été ajoutée par ${req.user.username}.`,
            admin: req.user.id,
        });

        await history.save();

        res.status(201).json({ 
            message: 'Agence ajoutée avec succès par un administrateur.',
            history 
        });

    } catch (error) {
        console.error('Error during agency creation:', error);
        res.status(500).json({ error: 'Erreur interne du serveur.' });
    }
};
const getAllB2BUsers = async (req, res) => {
    try {
        const b2bUsers = await B2B.find({ status: 'en attente' });
        res.status(200).json(b2bUsers);
    } catch (error) {
        res.status(500).json({ error: 'Erreur lors de la récupération des utilisateurs B2B.' });
    }
};
const generateContractPDF = async (b2b) => {
    return new Promise((resolve, reject) => {
        const contractsDir = path.join(__dirname, 'contracts'); // Définir le chemin du dossier
        if (!fs.existsSync(contractsDir)) {
            fs.mkdirSync(contractsDir, { recursive: true }); // Créer le dossier s'il n'existe pas
        }

        const filePath = path.join(contractsDir, `contract_${b2b._id}.pdf`);
        const doc = new PDFDocument();

        const stream = fs.createWriteStream(filePath);
        doc.pipe(stream);

        doc.fontSize(20).text('Contrat Hub Travel', { align: 'center' });
        doc.moveDown();
        doc.fontSize(14).text(`Agence: ${b2b.nameAgence}`);
        doc.text(`Email: ${b2b.email}`);
        doc.text(`Téléphone: ${b2b.phoneNumber}`);
        doc.text(`Adresse: ${b2b.address}, ${b2b.city}, ${b2b.country}`);
        doc.moveDown();

        doc.text(`📅 Début du contrat: ${b2b.contract.startDate.toDateString()}`);
        doc.text(`⏳ Fin du contrat: ${b2b.contract.endDate.toDateString()}`);
        doc.text(`Durée: ${b2b.contract.duration}`);
        doc.text(`💰 Montant: ${b2b.contract.amount} DZD`);
        doc.moveDown();

        doc.text('📜 Conditions Générales:', { underline: true });
        doc.text('1. L’agence doit respecter les règles de Hub Travel.');
        doc.text('2. Le paiement doit être effectué avant le début du contrat.');
        doc.text('3. Hub Travel se réserve le droit de suspendre un contrat en cas de non-respect.');

        doc.end();

        stream.on('finish', () => resolve(filePath));
        stream.on('error', reject);
    });
};
const updateB2BStatus = async (req, res) => {
    try {
        const { nameAgence, status, email, startDate, endDate, duration, amount } = req.body;

        if (req.user.role !== 'superadmin' ) {
            return res.status(403).json({ message: 'Forbidden: Insufficient permissions' });
        }

        if (!['en attente', 'approuvée', 'rejetée'].includes(status)) {
            return res.status(400).json({ message: 'Invalid status. Allowed values are "pending", "approved", or "rejected".' });
        }

        const b2b = await B2B.findOne({ nameAgence }).exec();
        if (!b2b) {
            return res.status(404).json({ message: `B2B agency with name "${nameAgence}" not found.` });
        }

        b2b.status = status;

        if (status === 'approuvée') {
            b2b.contract = {
                startDate,
                endDate,
                duration,
                amount
            };

            const contractFilePath = await generateContractPDF(b2b);
            b2b.contract.contractFile = contractFilePath;
            if (email) {
                await sendEmail(email, { username: nameAgence, contractFile: contractFilePath });
            }
        }

        await b2b.save();
        return res.status(200).json({ message: `Status updated to "${status}" for agency "${b2b.nameAgence}".` });
    } catch (error) {
        console.error('Error updating B2B status:', error);
        return res.status(500).json({ message: 'An error occurred while updating the status. Please try again later.' });
    }
};
const updateB2b = async (req, res) => {
    try {
        const { nameAgence } = req.params;
        const { status, email, phoneNumber, address, city, country, typeAgence, contract }= req.body;
        if (req.user.role !== 'superadmin') {
            return res.status(403).json({ message: 'Forbidden: Insufficient permissions' });
        }
        const agence = await B2B.findOne({ nameAgence }).exec();
        if (!agence) {
            return res.status(404).json({ message: `B2B agency with name "${nameAgence}" not found.` });
        }
        agence.email = email || agence.email;
        agence.phoneNumber = phoneNumber || agence.phoneNumber;
        agence.address = address || agence.address;
        agence.city = city || agence.city;
        agence.country = country || agence.country;
        agence.status = status || agence.status;
        agence.typeAgence = typeAgence || agence.typeAgence;

        // Si l'agence est approuvée, mettre à jour le contrat
        if (agence.status === 'approved' && contract) {
            agence.contract.startDate = contract.startDate || agence.contract.startDate;
            agence.contract.endDate = contract.endDate || agence.contract.endDate;
            agence.contract.duration = contract.duration || agence.contract.duration;
            agence.contract.amount = contract.amount || agence.contract.amount;
            agence.contract.contractFile = contract.contractFile || agence.contract.contractFile;
        }
        await agence.save();
        const history = new History({
            admin: req.user.id,
            action: 'Mise à jour',
            details: `L'agence ${nameAgence} a été mise à jour par ${req.user.username}`,
        });
        await history.save();
        res.status(200).json({ message: "Agence mise à jour avec succès", agence });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Erreur lors de la mise à jour de l'agence" });
    }
}
const getB2BByNameAgence = async (req, res) => {
    try {
        const { nameAgence } = req.params;


        const b2bUser = await B2B.findOne({ nameAgence });

        if (!b2bUser) {
            return res.status(404).json({ message: `Aucune agence trouvée avec le nom "${nameAgence}".` });
        }

        res.status(200).json(b2bUser);
    } catch (error) {
        console.error('Erreur lors de la récupération de l\'agence B2B:', error);
        res.status(500).json({ error: 'Erreur lors de la récupération de l\'agence B2B.' });
    }
};
const getAllB2BUsersAccpe = async (req, res) => {
    try {
        const b2bUsers = await B2B.find({ status: 'approuvée' });
        res.status(200).json(b2bUsers);
    } catch (error) {
        res.status(500).json({ error: 'Erreur lors de la récupération des utilisateurs B2B.' });
    }
};
const getAgencyStats = async (req, res) => {
    try {
        const totalAgencies = await B2B.countDocuments();
        const pendingAgencies = await B2B.countDocuments({ status: "en attente" });
        const approvedAgencies = await B2B.countDocuments({ status: "approuvée" });
        const rejectedAgencies = await B2B.countDocuments({ status: "rejetée" });

        // Éviter la division par zéro
        const approvedPercentage = totalAgencies
            ? ((approvedAgencies / totalAgencies) * 100).toFixed(2)
            : 0;
        const rejectedPercentage = totalAgencies
            ? ((rejectedAgencies / totalAgencies) * 100).toFixed(2)
            : 0;

        res.status(200).json({
            totalAgencies,
            pendingAgencies,
            approvedPercentage,
            rejectedPercentage,
        });
    } catch (error) {
        console.error("Erreur lors du comptage des agences:", error);
        res.status(500).json({ message: "Erreur lors du comptage des agences." });
    }
};
const deleteB2b = async (req, res) => {
    try {
        const { nameAgence } = req.params;
        const b2b = await B2B.findOne({ nameAgence });
        if (!b2b) {
            return res.status(404).json({ message: 'Agence non trouvée' });
        }

        const historyData = {
            action: 'Suppression',
            details: `L'agence ${b2b.nameAgence} a été supprimée.`,
            admin: req.user.id, 
            date: new Date(),
            
        };

        const history = new History(historyData);
        await history.save();

        // Maintenant, supprimer l'agence
        await B2B.findOneAndDelete({ nameAgence });

        res.status(200).json({ message: `L'agence ${nameAgence} a été supprimée avec succès.` });

    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Erreur du serveur' });
    }
};
const sendResetPasswordEmail = async (req, res) => {
    const { email } = req.body;
  
    // Trouver l'utilisateur dans la base de données
    let user = await B2B.findOne({ email });
    if (!user) {
      user = await Admin.findOne({ email });
      if (!user) {
        return res.status(404).json({ error: "Cet email n'est pas enregistré dans notre système." });
      }
    }
  
    // Créer un lien de réinitialisation
    const resetUrl = `http://localhost:3000/auth/reset-password/${email}`;
  
    // Configurer l'email
    const mailOptions = {
      from: process.env.GMAIL_USER,
      to: email,
      subject: 'Réinitialisation de votre mot de passe',
      html: `<p>Bonjour,</p>
             <p>Vous avez demandé à réinitialiser votre mot de passe. Cliquez sur le lien ci-dessous pour changer votre mot de passe :</p>
             <a href="${resetUrl}">Réinitialiser le mot de passe</a>`
    };
  
    try {
      // Envoi de l'email
      await transporter.sendMail(mailOptions);
      res.status(200).json({ message: "Email de réinitialisation envoyé" });
    } catch (error) {
      res.status(500).json({ error: "Erreur d'envoi de l'email" });
    }
  };

  const resetPassword = async (req, res) => {
    const { email } = req.params;
    const { newPassword } = req.body;

    if (!newPassword) {
        return res.status(400).json({ error: 'Le nouveau mot de passe est requis.' });
    }

  
    let user = await B2B.findOne({ email });
    if (!user) {
        user = await Admin.findOne({ email });
        if (!user) {
            return res.status(404).json({ error: "Utilisateur non trouvé." });
        }
    }

  
    user.password = newPassword;


    await user.save();

    res.status(200).json({ message: 'Mot de passe mis à jour avec succès.' });
};


const updateB2BInfo = async (req, res) => {
    try {
        const { id } = req.params; // ID du B2B à mettre à jour
        const { nameAgence, email, phoneNumber, address, city, country, documents, typeAgence } = req.body;

        const updatedB2B = await B2B.findByIdAndUpdate(
            id,
            { nameAgence, email, phoneNumber, address, city, country, documents, typeAgence },
            { new: true, runValidators: true }
        );

        if (!updatedB2B) {
            return res.status(404).json({ message: "B2B introuvable" });
        }

        res.status(200).json(updatedB2B);
    } catch (error) {
        res.status(500).json({ message: "Erreur lors de la mise à jour", error });
    }
};
const updateB2BPassword = async (req, res) => {
    try {
        const { email, oldPassword, newPassword } = req.body;

        // Vérifier si l'utilisateur existe
        const b2b = await B2B.findOne({ email });
        if (!b2b) {
            return res.status(404).json({ message: "B2B introuvable" });
        }

        // Vérifier si l'ancien mot de passe est correct
        const isMatch = await bcrypt.compare(oldPassword, b2b.password);
        if (!isMatch) {
            return res.status(400).json({ message: "Ancien mot de passe incorrect" });
        }

        // Hasher le nouveau mot de passe
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(newPassword, salt);

        // Désactiver le middleware `pre('save')` en utilisant `updateOne`
        await B2B.updateOne({ email }, { $set: { password: hashedPassword } });

        res.status(200).json({ message: "Mot de passe mis à jour avec succès" });

    } catch (error) {
        res.status(500).json({ message: "Erreur lors de la mise à jour du mot de passe", error });
    }
};


const getB2BByidAgence = async (req, res) => {
    try {
        const { id } = req.params;


        const b2bUser = await B2B.findById( id );

        if (!b2bUser) {
            return res.status(404).json({ message: `Aucune agence trouvée avec le nom "${nameAgence}".` });
        }

        res.status(200).json(b2bUser);
    } catch (error) {
        console.error('Erreur lors de la récupération de l\'agence B2B:', error);
        res.status(500).json({ error: 'Erreur lors de la récupération de l\'agence B2B.' });
    }
};
module.exports = {
    registerUser,
    addAgence,
    getAllB2BUsers,
    updateB2BStatus,
    getB2BByNameAgence,
    getAllB2BUsersAccpe,
    getAgencyStats,
    updateB2b,
    deleteB2b,
    sendResetPasswordEmail,
    resetPassword,
    updateB2BInfo,
    updateB2BPassword,
    getB2BByidAgence,
};