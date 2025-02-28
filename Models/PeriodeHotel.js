const mongoose = require("mongoose");

const periodeSchema = new mongoose.Schema(
  {
    hotelId: { type: mongoose.Schema.Types.ObjectId, ref: "Hotel", required: true },
    dateDebut: { type: Date, required: true },
    dateFin: { type: Date, required: true },
    minNuits: { type: Number, required: true },
    allotement: { type: Number},
    delai_annulation:{type: String},
    delai_retrocession :{type: String},
    prixWeekday: { type: Number, required: true },
    prixWeekend: { type: Number, required: true },
    pourcentageSupplementSingle: { type: Number}, 
    pourcentageSupplementSingleWeekend: { type: Number}, 
    supplementsPrix: [{
      supplement: { type: String },
      prix: { type: Number, required: true }
    }],
    arrangementsPrix: [{
      arrangement: { type: String, enum: ["logement simple", "petit déjeuner", "demi-pension", "pension complète", "all inclusive"] },
      prix: { type: Number, required: true }
    }]
  }, { timestamps: true });
  
  module.exports = mongoose.model("Periode", periodeSchema);