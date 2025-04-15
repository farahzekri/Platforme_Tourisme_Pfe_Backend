const mongoose = require("mongoose");

const hotelSchema = new mongoose.Schema(
  {
    b2bId: { type: mongoose.Schema.Types.ObjectId, ref: "B2B", required: true }, 
    name: { type: String, required: true },
    country: { type: String, required: true },
    city: { type: String, required: true },
    stars: { type: Number, min: 1, max: 5 }, 
    Typecontract: {type:String,required: true},
    minChildAge: { type: Number },
    maxChildAge: { type: Number },
    address: { type: String },
    tripAdvisorLink: { type: String },
    rooms: { type: [String], enum: ["single", "double", "triple", "quadruple", "suite", "junior", "quintuple"] },
    childrenCategories: { type: String },
    options: {type: String },
    location: { type: String },
    themes: [{ type: String }], 
    arrangement: { type: [String], enum: ["logement simple", "petit déjeuner", "demi-pension", "pension complète", "all inclusive"] },
    amenities: [{ type: String }], 
    supplements: [{ type: String }], 
    Jourdeweekend:[{ type: String }],
    image:[{ type: String }],
    periodes: [{ type: mongoose.Schema.Types.ObjectId, ref: "Periode" }] ,
    prixTotal: { type: Number, default: 0 }, 
    status: { type: String, enum: ["inactive", "active"], default: "inactive" } ,
    roomAvailability: { 
      type: Map, 
      of: Number,  
      default: {}  
  },
  averageRating: { type: Number, default: 0 }, 
  },
  { timestamps: true }
);

module.exports = mongoose.model("Hotel", hotelSchema);