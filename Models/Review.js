const mongoose = require("mongoose");

const reviewSchema = new mongoose.Schema(
  {
    hotelId: { type: mongoose.Schema.Types.ObjectId, ref: "Hotel", required: true },
    cleanlinessArrival: { type: Number, min: 1, max: 5, required: true },
    regularCleaning: { type: Number, min: 1, max: 5, required: true },
    staffProfessionalism: { type: Number, min: 1, max: 5, required: true },
    requestHandling: { type: Number, min: 1, max: 5, required: true },
    roomService: { type: Number, min: 1, max: 5, required: true },
    restaurantCleanliness: { type: Number, min: 1, max: 5, required: true },
    priceQuality: { type: Number, min: 1, max: 5, required: true },
    comment: { type: String },
    globalRating: { type: Number, min: 1, max: 5 }, // Calculée automatiquement
  },
  { timestamps: true }
);

// Calcul automatique de la note globale
reviewSchema.pre("save", function (next) {
  const totalScore =
    this.cleanlinessArrival +
    this.regularCleaning +
    this.staffProfessionalism +
    this.requestHandling +
    this.roomService +
    this.restaurantCleanliness +
    this.priceQuality;
  this.globalRating = (totalScore / 7).toFixed(1); // Moyenne sur 7 questions
  next();
});

module.exports = mongoose.model("Review", reviewSchema);
