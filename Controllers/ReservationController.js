const Reservation = require("../Models/Reservation")
const mongoose= require("mongoose");

const logger=require('../utils/logger');
const addReservation = async (req, res) => {
    try {
        const {hotelId} = req.params;
      const {
        reserverCivility,
        reserverFirstname,
        reserverLastname,
        reserverEmail,
        reserverPhone,
        adults,
        children,
        roomType,
        dateArrivee,
        dateDepart,
        arrangement,
        supplements,
        wishes,
        totalPrice,
        paymentMethod
      } = req.body;
  
      const newReservation = await Reservation.create({
        hotelId,
        reserverCivility,
        reserverFirstname,
        reserverLastname,
        reserverEmail,
        reserverPhone,
        adults,
        children,
        roomType,
        dateArrivee,
        dateDepart,
        arrangement,
        supplements,
        wishes,
        totalPrice,
        paymentMethod,
      });
       logger.info(`Réservation ajoutée avec succès`);
      res.status(201).json({ message: "Réservation ajoutée avec succès", reservation: newReservation });
    } catch (error) {
      console.error("Erreur lors de la création de la réservation:", error);
      logger.error("Erreur serveur: " + error.message);
      res.status(500).json({ message: "Erreur serveur" });
    }
  };
  
  module.exports = {
     addReservation
     };