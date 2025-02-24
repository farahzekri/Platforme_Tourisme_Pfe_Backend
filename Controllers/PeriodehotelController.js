const Hotel = require('../Models/Hotel');
const Periode = require('../Models/PeriodeHotel');


const createPeriodeHotel = async (req, res) => {
    try {
     
        const { hotelId } = req.params;  
        const { dateDebut, dateFin, minNuits, allotement, delai_annulation, delai_retrocession, prixWeekday, prixWeekend, DCR, DMJ, supplementsPrix, arrangementsPrix } = req.body;

       
        const newPeriode = new Periode({
            hotelId,
            dateDebut,
            dateFin,
            minNuits,
            allotement,
            delai_annulation,
            delai_retrocession,
            prixWeekday,
            prixWeekend,
            DCR,
            DMJ,
            supplementsPrix,
            arrangementsPrix
        });
        await newPeriode.save();
        await Hotel.findByIdAndUpdate(hotelId, { $push: { periodes: newPeriode._id } });
        return res.status(201).json({ success: true, message: "Période ajoutée avec succès", periode: newPeriode });

    } catch (error) {
        console.error("Erreur lors de l'ajout de la période :", error);
        return res.status(500).json({ success: false, message: "Erreur lors de l'ajout de la période" });
    }
};

module.exports={
    createPeriodeHotel,
}