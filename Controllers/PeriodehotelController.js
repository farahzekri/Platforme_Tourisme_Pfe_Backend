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
}};

const getHotelsetprixmin = async (req, res) => {
    try {
        // Date actuelle
        const today = new Date();
        console.log("Date d'aujourd'hui :", today);

        // Récupérer les hôtels actifs
        const hotels = await Hotel.find({ status: "active" });

        // Vérifier si des hôtels sont trouvés
        if (!hotels.length) {
            return res.json({ message: "Aucun hôtel actif trouvé" });
        }

        // Parcourir chaque hôtel et chercher la période active
        const hotelsWithPrice = await Promise.all(
            hotels.map(async (hotel) => {
                console.log(`Recherche de période pour l'hôtel : ${hotel.name}`);

                // Trouver la période active
                const periode = await Periode.findOne({
                    hotelId: hotel._id,
                    dateDebut: { $lte: today },
                    dateFin: { $gte: today },
                });

                if (!periode) {
                    console.log(`❌ Aucune période trouvée pour l'hôtel : ${hotel.name}`);
                    return null;
                }

                // Récupérer le prix de l'arrangement "petit déjeuner"
                const petitDej = periode.arrangementsPrix.find(arr => arr.arrangement === "petit déjeuner");
                const prixPetitDej = petitDej ? petitDej.prix : 0;

                console.log(`✅ Période trouvée pour ${hotel.name} - Prix weekday: ${periode.prixWeekday}, weekend: ${periode.prixWeekend}`);

                // Retourner les informations formatées
                return {
                    id:hotel.id,
                    name: hotel.name,
                    stars: hotel.stars,
                    country: hotel.country,
                    city: hotel.city,
                    arrangement:hotel.arrangement,
                    supplements:hotel.supplements,
                    image:hotel.image,
                    prixMinWeekday: periode.prixWeekday + prixPetitDej,
                    prixMinWeekend: periode.prixWeekend + prixPetitDej,
                };
            })
        );

        // Filtrer les hôtels qui n'ont pas de période
        const filteredHotels = hotelsWithPrice.filter(h => h !== null);

        if (!filteredHotels.length) {
            return res.json({ message: "Aucun hôtel avec une période active trouvée" });
        }

        res.json(filteredHotels);
    } catch (error) {
        console.error("Erreur lors de la récupération des hôtels :", error);
        res.status(500).json({ error: "Erreur interne du serveur" });
    }
};
const getHotelDetails = async (req, res) => {
    try {
        const { id } = req.params;
        const today = new Date();

        // Récupérer l'hôtel
        const hotel = await Hotel.findById(id);
        if (!hotel) {
            return res.status(404).json({ message: "Hôtel non trouvé" });
        }

        // Trouver la période active pour cet hôtel
        const periode = await Periode.findOne({
            hotelId: hotel._id,
            dateDebut: { $lte: today },
            dateFin: { $gte: today },
        });

        if (!periode) {
            return res.json({ message: "Aucune période active trouvée pour cet hôtel" });
        }

        // Récupérer le prix de l'arrangement "petit déjeuner"
        const petitDej = periode.arrangementsPrix.find(arr => arr.arrangement === "petit déjeuner");
        const prixPetitDej = petitDej ? petitDej.prix : 0;

        // Multiplier les prix par 2 (chambre double)
        const prixMinWeekday = (periode.prixWeekday + prixPetitDej) * 2;
        const prixMinWeekend = (periode.prixWeekend + prixPetitDej) * 2;

        // Construire la réponse avec tous les détails de l'hôtel
        const hotelDetails = {
            id:hotel.id,
            name: hotel.name,
            stars: hotel.stars,
            country: hotel.country,
            delai_annulation:periode.delai_annulation,
            address:hotel.address,
            city: hotel.city,
            arrangement: hotel.arrangement,
            supplements: hotel.supplements,
            images: hotel.image,
            prixMinWeekday,
            prixMinWeekend,
        };

        res.json(hotelDetails);
    } catch (error) {
        console.error("Erreur lors de la récupération des détails de l'hôtel :", error);
        res.status(500).json({ error: "Erreur interne du serveur" });
    }
};
const updateperiode =async(req,res)=>{
    try{
       const {id}=req.params;
       const updateData=req.body;
       const updatPriode=await Periode.findByIdAndUpdate(id,updateData,{new:true});
       if (!updatPriode){
        return res.status(404).json({ message: "Periode non trouvé." });
       }
       res.status(200).json({ message: "Periode mis à jour avec succès.", periode: updatPriode });
    }catch(error){
        console.error(error);
        res.status(500).json({ message: "Erreur lors de la mise à jour de Periode." });
    }
}
const getperiodebyidperiode=async(req,res)=>{
    try{
        const {id}=req.params;
        const periode= await Periode.findById(id);
        res.status(200).json(periode);
    }catch(error){
        res.status(500).json({ message: "Erreur lors de la récupération." });
    }
};
const deletePeriode = async (req, res) => {
    try {
        const { id } = req.params;

     
        const periode = await Periode.findById(id);
        if (!periode) {
            return res.status(404).json({ message: "Période non trouvée." });
        }

       
        const hotelId = periode.hotelId;
        const hotel = await Hotel.findById(hotelId);
        if (!hotel) {
            return res.status(404).json({ message: "Hôtel non trouvé." });
        }

        await Hotel.findByIdAndUpdate(hotelId, { $pull: { periodes: id } });

        await Periode.findByIdAndDelete(id);

        res.status(200).json({ message: "Période supprimée avec succès." });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Erreur lors de la suppression de la période." });
    }
};
module.exports={
    createPeriodeHotel,
    searchHotels,
    getAllPeriodeByHotelid,
    getHotelsetprixmin,
    updateperiode,
    getperiodebyidperiode,
    deletePeriode,
    getHotelDetails,
}