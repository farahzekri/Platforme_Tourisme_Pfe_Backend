const mongoose=require("mongoose");

const GuestSchema =new mongoose.Schema({
  civility: String, 
  firstname: String,
  lastname: String,
});
const ChildSchema = new mongoose.Schema({
    civility: String,
    firstname: String,
    lastname: String,
    
  });
  const ReservationSchema = new mongoose.Schema({
    hotelId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Hotel",
      required: true
    },
    reserverCivility: String,
    reserverFirstname: String,
    reserverLastname: String,
    reserverEmail: String,
    reserverPhone: String,
    adults: [GuestSchema],
    children: [ChildSchema], 
    roomType: String,
    dateArrivee: Date,
    dateDepart: Date,
    arrangement: String,
    supplements: [String],
    wishes: [String], 
    totalPrice: Number,
    paymentMethod: String, 
    paymentStatus: { type: String, default: "pending" },
    createdAt: { type: Date, default: Date.now }
  });
  
  module.exports = mongoose.model("Reservation", ReservationSchema);