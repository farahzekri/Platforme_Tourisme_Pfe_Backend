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
        await Hotel.findByIdAndUpdate(hotelId, { $push: { periodes: newPeriode._id }, status: "active" });


        return res.status(201).json({ success: true, message: "Période ajoutée avec succès", periode: newPeriode });

    } catch (error) {
        console.error("Erreur lors de l'ajout de la période :", error);
        return res.status(500).json({ success: false, message: "Erreur lors de l'ajout de la période" });
    }
};
const calculerPrixTotal = (adultes, enfants, agesEnfants, prixBase, prixArrangement, prixSupplements, periode, typeContract, minChildAge, maxChildAge, dateArrivee, dateDepart) => {
    // Calcul du nombre de nuits
    const dateIn = new Date(dateArrivee);
    const dateOut = new Date(dateDepart);
    const nbNuits = Math.max((dateOut - dateIn) / (1000 * 60 * 60 * 24), 1);

    let prixTotal = 2 * (prixBase + prixSupplements + prixArrangement) * nbNuits;

    // Supplément pour les adultes supplémentaires
    if (adultes > 2) {
        let supplementSingle = periode.pourcentageSupplementSingle / 100 || 0;
        prixTotal += (prixBase + prixSupplements + prixArrangement) * (adultes - 2) * (1 - supplementSingle) * nbNuits;
    }

    // Gestion des enfants
    if (typeContract === "Réduction par age d'enfant" && enfants > 0) {
        for (let age of agesEnfants) {
            if (age < 2) continue;
            else if (age >= minChildAge && age <= maxChildAge) {
                prixTotal += (prixBase + prixSupplements + prixArrangement) * 0.5 * nbNuits;
            } else {
                prixTotal += (prixBase + prixSupplements + prixArrangement) * nbNuits;
            }
        }
    }

    return prixTotal;
};
const getHotelAvailability = async (req, res) => {
    try {
        const { id } = req.params;
        const { dateArrivee, dateDepart, adultes, enfants, agesEnfants, arrangementSelectionne, supplementsSelectionnes } = req.query;

        if (!dateArrivee || !dateDepart || !adultes) {
            return res.status(400).json({ message: "Veuillez fournir toutes les informations nécessaires." });
        }

        const hotel = await Hotel.findById(id);
        if (!hotel) return res.status(404).json({ message: "Hôtel non trouvé" });

        const dateDebut = new Date(dateArrivee);
        const dateFin = new Date(dateDepart);

        // Trouver toutes les périodes qui couvrent une partie de la période demandée
        const periodes = await Periode.find({
            hotelId: hotel._id,
            $or: [
                { dateDebut: { $lte: dateDebut }, dateFin: { $gte: dateDebut } },
                { dateDebut: { $lte: dateFin }, dateFin: { $gte: dateFin } },
                { dateDebut: { $gte: dateDebut }, dateFin: { $lte: dateFin } }
            ]
        }).sort({ dateDebut: 1 });

        if (periodes.length === 0) return res.json({ message: "Aucune période active trouvée." });

        let agesArray = [];
        if (enfants > 0) {
            if (!agesEnfants) {
                return res.status(400).json({ message: "Veuillez fournir l'âge des enfants." });
            }
            agesArray = Array.isArray(agesEnfants) ? agesEnfants.map(Number) : agesEnfants.split(",").map(age => Number(age.trim()));
        }

        const chambres = Object.fromEntries(hotel.roomAvailability);
        let prixTotal = 0;
        let nbNuitsTotal = 0;

        periodes.forEach((periode, index) => {
            let start = new Date(Math.max(dateDebut, new Date(periode.dateDebut)));
            let end = new Date(Math.min(dateFin, new Date(periode.dateFin)));
            let nbNuits = Math.max((end - start) / (1000 * 60 * 60 * 24), 1);  // Nombre de nuits par période
            nbNuitsTotal += nbNuits;

            let arrangementPrix = arrangementSelectionne
                ? periode.arrangementsPrix.find(a => a.arrangement === arrangementSelectionne)?.prix || 0
                : periode.arrangementsPrix.find(a => a.arrangement === "petit déjeuner")?.prix || 0;

            let supplementPrix = 0;
            if (supplementsSelectionnes) {
                let supplementsArray = Array.isArray(supplementsSelectionnes)
                    ? supplementsSelectionnes
                    : supplementsSelectionnes.split(",").map(s => s.trim());

                supplementsArray.forEach(supplement => {
                    const supplementTrouve = periode.supplementsPrix.find(s => s.supplement === supplement);
                    if (supplementTrouve) {
                        supplementPrix += supplementTrouve.prix;
                    }
                });
            }

            // Calculer le prix pour chaque période séparément
            let prixParPeriode = calculerPrixTotal(
                adultes,
                enfants,
                agesArray,
                periode.prixWeekday,  // Prix spécifique à la période
                arrangementPrix,
                supplementPrix,
                periode,
                hotel.Typecontract,
                hotel.minChildAge,
                hotel.maxChildAge,
                start,
                end
            );

            prixTotal += prixParPeriode;
        });

        const chambresDisponibles = Object.entries(chambres).map(([type, dispo]) => {
            if (dispo > 0 && (
                (adultes <= 2 && type === "double") ||
                (adultes == 3 && type === "triple") ||
                (adultes == 4 && type === "quadruple")
            )) {
                return {
                    type,
                    dispo,
                    prix: prixTotal,
                    nbNuits: nbNuitsTotal,
                    periodes: periodes.map(p => ({
                        dateDebut: p.dateDebut,
                        dateFin: p.dateFin
                    }))
                };
            }
        }).filter(Boolean);

        res.json({ chambresDisponibles });
    } catch (error) {
        console.error("Erreur récupération disponibilité hôtel :", error);
        res.status(500).json({ error: "Erreur interne du serveur" });
    }
};

const searchHotels = async (req, res) => {
    try {
        const { country, city, dateDebut, dateFin, adultes, enfants, agesEnfants } = req.body;

        let hotels = await Hotel.find({ country, city, status: "active" }).populate("periodes");

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

            // Arrangement par défaut = "petit déjeuner"
            let prixArrangement = periode.arrangementsPrix.find(arr => arr.arrangement === "petit déjeuner")?.prix || 0;

            // Supprimer les suppléments (mettre à 0)
            let prixSupplements = 0;

            // Récupérer les informations du contrat pour les réductions enfants
            let typeContract = hotel.Typecontract || "";
            let minChildAge = hotel.minChildAge || 0;
            let maxChildAge = hotel.maxChildAge || 0;

            // 🔹 Appel de `calculerPrixTotal`
            let prixTotal = calculerPrixTotal(
                adultes, enfants, agesEnfants, prixBase, prixArrangement, prixSupplements,
                periode, typeContract, minChildAge, maxChildAge, dateDebut, dateFin
            );

            resultats.push({
                id:hotel.id,
                hotel: hotel.name,
                country: hotel.country,
                city: hotel.city,
                stars: hotel.stars,
                Typecontract:hotel.Typecontract,
                arrangement:hotel.arrangement,
                prixTotal,
                image: hotel.image[0],
            });
        }

        return res.status(200).json({ success: true, hotels: resultats });

    } catch (error) {
        console.error("Erreur lors de la recherche d'hôtels :", error);
        return res.status(500).json({ success: false, message: "Erreur lors de la recherche d'hôtels" });
    }
};
const getAllPeriodeByHotelid = async (req, res) => {
    try {
        const { hotelId } = req.params;
        const periodes = await Periode.find({ hotelId });
        res.status(200).json(periodes);
    } catch (error) {
        console.error("Erreur lors de la récupération des périodes :", error);
        res.status(500).json({ message: "Erreur serveur" });
    }
};

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
                    id: hotel.id,
                    name: hotel.name,
                    stars: hotel.stars,
                    country: hotel.country,
                    city: hotel.city,
                    arrangement: hotel.arrangement,
                    supplements: hotel.supplements,
                    image: hotel.image,
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
            id: hotel.id,
            name: hotel.name,
            stars: hotel.stars,
            country: hotel.country,
            delai_annulation: periode.delai_annulation,
            address: hotel.address,
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
const updateperiode = async (req, res) => {
    try {
        const { id } = req.params;
        const updateData = req.body;
        const updatPriode = await Periode.findByIdAndUpdate(id, updateData, { new: true });
        if (!updatPriode) {
            return res.status(404).json({ message: "Periode non trouvé." });
        }
        res.status(200).json({ message: "Periode mis à jour avec succès.", periode: updatPriode });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Erreur lors de la mise à jour de Periode." });
    }
}
const getperiodebyidperiode = async (req, res) => {
    try {
        const { id } = req.params;
        const periode = await Periode.findById(id);
        res.status(200).json(periode);
    } catch (error) {
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
module.exports = {
    createPeriodeHotel,
    searchHotels,
    getAllPeriodeByHotelid,
    getHotelsetprixmin,
    updateperiode,
    getperiodebyidperiode,
    deletePeriode,
    getHotelDetails,
    getHotelAvailability,
}