const Review = require("../Models/Review");
const Hotel = require("../Models/Hotel");
const mongoose = require("mongoose");
const addReview = async (req, res) => {
    try {
        const { hotelId } = req.params;
      const {  cleanlinessArrival, regularCleaning, staffProfessionalism, requestHandling, roomService, restaurantCleanliness, priceQuality, comment } = req.body;
  
      // Vérifier si l'hôtel existe
      const hotel = await Hotel.findById(hotelId);
      if (!hotel) {
        return res.status(404).json({ message: "Hôtel non trouvé" });
      }
  
      // Créer une nouvelle review
      const review = new Review({
        hotelId,
        cleanlinessArrival,
        regularCleaning,
        staffProfessionalism,
        requestHandling,
        roomService,
        restaurantCleanliness,
        priceQuality,
        comment,
      });
  
      await review.save();
  
    
  
      // Recalculer la note moyenne de l'hôtel
      await calculateHotelRating(hotelId);
  
      res.status(201).json({ message: "Avis ajouté avec succès", review });
    } catch (error) {
      res.status(500).json({ message: "Erreur serveur", error });
    }
  };
  
const getReviewsByHotel = async (req, res) => {
    try {
      const { hotelId } = req.params;
      const reviews = await Review.find({ hotelId }).sort({ createdAt: -1 });
  
      if (!reviews.length) {
        return res.status(404).json({ message: "Aucun avis trouvé pour cet hôtel" });
      }
  
      res.status(200).json(reviews);
    } catch (error) {
      res.status(500).json({ message: "Erreur serveur", error });
    }
  };
  const calculateHotelRating = async (hotelId) => {
    try {
        console.log(`🔹 Calcul de la note moyenne pour l'hôtel ${hotelId}`);

        const result = await Review.aggregate([
            { $match: { hotelId: new mongoose.Types.ObjectId(hotelId) } }, // Filtrer les avis de cet hôtel
            {
                $group: {
                    _id: "$hotelId",
                    averageRating: { $avg: "$globalRating" } // Calculer la moyenne des globalRating
                }
            }
        ]);

        if (result.length === 0) {
            console.log("❌ Aucun avis trouvé. Réinitialisation à 0.");
            await Hotel.findByIdAndUpdate(hotelId, { averageRating: 0 });
            return;
        }

        const newAverageRating = result[0].averageRating.toFixed(1);
        console.log(`✅ Nouvelle note moyenne : ${newAverageRating}`);

        // Mettre à jour l'hôtel avec la nouvelle moyenne
        await Hotel.findByIdAndUpdate(hotelId, { averageRating: newAverageRating });

    } catch (error) {
        console.error("❌ Erreur lors du calcul de la note moyenne :", error);
    }
};
module.exports = {
    addReview,
    getReviewsByHotel,
    
}