const Reservation = require("../Models/Reservation")
const KONNECT_API_URL = "https://api.sandbox.konnect.network/api/v2";
const API_KEY = process.env.KONNECT_API_KEY;
const RECEIVER_WALLET_ID = process.env.KONNECT_WALLET_ID;
const mongoose = require("mongoose");
const axios = require("axios");
const Hotel = require("../Models/Hotel");
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
  const createPayment = async (req, res) => {
    const { amount, reservationId } = req.body;
  
    try {
      const response = await axios.post(
        `${KONNECT_API_URL}/payments/init-payment`,
        {
          receiverWalletId: RECEIVER_WALLET_ID,
          token: "TND",
          amount: amount,
          type: "immediate",
          description: "Paiement de réservation",
          acceptedPaymentMethods: ["wallet", "bank_card", "e-DINAR"],
          orderId: reservationId,
          successUrl: "http://localhost:3000/success",
          failUrl: "http://localhost:3000/failure",
          webhook: " https://ea5c-102-159-199-203.ngrok-free.app/reservation/notify",
          silentWebhook: true,
          metadata: {
            reservationId 
          }
        },
        {
          headers: {
            "x-api-key": API_KEY
          }
        }
      );
  
      const paymentUrl = response.data.payUrl;
      const paymentRef = response.data.paymentRef; // à adapter si différent

   
    await Reservation.findByIdAndUpdate(reservationId, {
      paymentRef: paymentRef
    });
      res.json({ paymentUrl });
    } catch (error) {
      console.error("Erreur de paiement :", error?.response?.data || error.message);
      res.status(500).json({ error: "Erreur lors de la création du paiement" });
    }
  };
  const notifyPaymentGet = async (req, res) => {
    try {
      const { payment_ref } = req.query;
  
      console.log("Webhook GET reçu:", req.query);
  
      if (!payment_ref) {
        return res.status(400).send("payment_ref manquant");
      }
  
      const reservation = await Reservation.findOne({ paymentRef: payment_ref });
  
      if (!reservation) {
        return res.status(404).send("Réservation non trouvée");
      }
  
      // Vérifiez si le paiement a déjà été traité
      if (reservation.paymentStatus === "payé") {
        return res.status(200).send("Paiement déjà traité");
      }
  
      // Marquez le paiement comme payé
      reservation.paymentStatus = "payé";
      await reservation.save();
  
      // Mettez à jour la disponibilité des chambres
      const hotel = await Hotel.findById(reservation.hotelId);
      if (!hotel) {
        return res.status(404).send("Hôtel non trouvé");
      }
  
      const roomType = reservation.roomType;
      const currentAvailability = hotel.roomAvailability.get(roomType) || 0;
      hotel.roomAvailability.set(roomType, currentAvailability - 1);
      await hotel.save();
  
      res.status(200).send("Mise à jour avec succès");
    } catch (error) {
      console.error("Erreur webhook GET:", error.message);
      res.status(500).send("Erreur serveur");
    }
  };
  
  
  const getReservationsByHotel = async (req, res) => {
    try {
      const { hotelId } = req.params;
      const reservations = await Reservation.find({ hotelId });
      res.status(200).json(reservations);
    } catch (error) {
      console.error("Erreur lors de la récupération des réservations de l'hôtel :", error);
      res.status(500).send("Erreur serveur");
    }
  };
  const getReservationsByB2B = async (req, res) => {
    try {
      const { b2bId } = req.params;
  
      const reservations = await Reservation.aggregate([
        {
          $lookup: {
            from: "hotels", // Nom de la collection des hôtels
            localField: "hotelId",
            foreignField: "_id",
            as: "hotelDetails"
          }
        },
        { $unwind: "$hotelDetails" },
        { $match: { "hotelDetails.b2bId": new mongoose.Types.ObjectId(b2bId) } },
        {
          $project: {
            reserverFirstname: 1,
            reserverLastname: 1,
            reserverEmail: 1,
            reserverPhone: 1,
            roomType: 1,
            dateArrivee: 1,
            dateDepart: 1,
            arrangement: 1,
            totalPrice: 1,
            paymentStatus: 1,
            hotelName: "$hotelDetails.name",
            hotelCity: "$hotelDetails.city"
          }
        }
      ]);
  
      res.status(200).json(reservations);
    } catch (error) {
      console.error("Erreur lors de la récupération des réservations du B2B :", error);
      res.status(500).send("Erreur serveur");
    }
  };
  module.exports = {
     addReservation,
     createPayment,
     notifyPaymentGet,
     getReservationsByHotel,
     getReservationsByB2B,

     };