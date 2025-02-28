const Hotel = require('../Models/Hotel');
const Periode = require('../Models/PeriodeHotel');


const createPeriodeHotel = async (req, res) => {
    try {
     
        const { hotelId } = req.params;  
        const { dateDebut, dateFin, minNuits, allotement, delai_annulation, delai_retrocession, prixWeekday, prixWeekend, pourcentageSupplementSingle, pourcentageSupplementSingleWeekend, supplementsPrix, arrangementsPrix } = req.body;

       
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
            pourcentageSupplementSingle,
            pourcentageSupplementSingle,
            supplementsPrix,
            arrangementsPrix
        });
        await newPeriode.save();
        await Hotel.findByIdAndUpdate(hotelId, { $push: { periodes: newPeriode._id } ,status: "active" });

      
        return res.status(201).json({ success: true, message: "Période ajoutée avec succès", periode: newPeriode });

    } catch (error) {
        console.error("Erreur lors de l'ajout de la période :", error);
        return res.status(500).json({ success: false, message: "Erreur lors de l'ajout de la période" });
    }
};
const calculerPrixTotal = (adultes, enfants, agesEnfants, prixBase, prixArrangement, prixSupplements, periode, typeContract, minChildAge, maxChildAge) => {
    let prixTotal = 2 * (prixBase + prixSupplements + prixArrangement);

    // Supplément pour les adultes supplémentaires
    if (adultes > 2) {
        let supplementSingle = periode.pourcentageSupplementSingle / 100 || 0;
        prixTotal += (prixBase + prixSupplements + prixArrangement) * (adultes - 2) * (1 - supplementSingle);
    }

    // Gestion des enfants si le type de contrat est "Réduction par âge d'enfant"
    if (typeContract === "Réduction par âge d'enfant" && enfants > 0) {
        for (let age of agesEnfants) {
            if (age < 2) {
                // Enfant de moins de 2 ans → Gratuit
                continue;
            } else if (age >= minChildAge && age <= maxChildAge) {
                // Enfant entre minChildAge et maxChildAge → Réduction de 50%
                prixTotal += (prixBase + prixSupplements + prixArrangement) * 0.5;
            } else {
                // Enfant plus âgé que maxChildAge → Paie comme un adulte
                prixTotal += prixBase + prixSupplements + prixArrangement;
            }
        }
    }

    return prixTotal;
};
const searchHotels = async (req, res) => {
    try {
        const { country, dateDebut, dateFin, adultes, enfants, agesEnfants, arrangementChoisi, supplementsChoisis } = req.body;

        let hotels = await Hotel.find({ country, status: "active" }).populate("periodes");

        let resultats = [];

        for (let hotel of hotels) {
            let periodesDisponibles = hotel.periodes.filter(periode => 
                new Date(periode.dateDebut) <= new Date(dateDebut) &&
                new Date(periode.dateFin) >= new Date(dateFin)
            );

            if (periodesDisponibles.length === 0) continue;

            let periode = periodesDisponibles[0]; 

            let joursWeekend = hotel.Jourdeweekend || [];
            let estWeekend = joursWeekend.some(jour => 
                [new Date(dateDebut).getDay(), new Date(dateFin).getDay()].includes(jour)
            );

            let prixBase = estWeekend ? periode.prixWeekend : periode.prixWeekday;

            let prixArrangement = periode.arrangementsPrix.find(arr => arr.arrangement === arrangementChoisi)?.prix ||
                                  periode.arrangementsPrix.find(arr => arr.arrangement === "petit déjeuner")?.prix || 0;

            let prixSupplements = 0;
            if (supplementsChoisis.length > 0) {
                for (let supp of supplementsChoisis) {
                    let suppObj = periode.supplementsPrix.find(s => s.supplement === supp);
                    if (suppObj) prixSupplements += suppObj.prix;
                }
            }

            // Récupérer les informations du contrat pour les réductions enfants
            let typeContract = hotel.Typecontract || ""; 
            let minChildAge = hotel.minChildAge || 0;
            let maxChildAge = hotel.maxChildAge || 0;

            // 🔹 Appel de `calculerPrixTotal` avec gestion des enfants
            let prixTotal = calculerPrixTotal(adultes, enfants, agesEnfants, prixBase, prixArrangement, prixSupplements, periode, typeContract, minChildAge, maxChildAge);

            resultats.push({
                hotel: hotel.name,
                country: hotel.country,
                city: hotel.city,
                stars:hotel.stars,
                prixTotal,
                image: hotel.image[0],
                arrangement: arrangementChoisi || "petit déjeuner"
            });
        }

        return res.status(200).json({ success: true, hotels: resultats });

    } catch (error) {
        console.error("Erreur lors de la recherche d'hôtels :", error);
        return res.status(500).json({ success: false, message: "Erreur lors de la recherche d'hôtels" });
    }
};
const getAllPeriodeByHotelid=async(req,res)=>{
    try{
        const { hotelId } = req.params;
        const periodes = await Periode.find({ hotelId }); 
        res.status(200).json(periodes);
    }catch (error) {
        console.error("Erreur lors de la récupération des périodes :", error);
        res.status(500).json({ message: "Erreur serveur" });
}}
module.exports={
    createPeriodeHotel,
    searchHotels,
    getAllPeriodeByHotelid,
}