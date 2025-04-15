const Reservation = require("../Models/Reservation")
const KONNECT_API_URL = "https://api.sandbox.konnect.network/api/v2";
const API_KEY = process.env.KONNECT_API_KEY;
const RECEIVER_WALLET_ID = process.env.KONNECT_WALLET_ID;
const mongoose = require("mongoose");
const axios = require("axios");
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
          webhook: "http://localhost:5000/reservation/notify",
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
      res.json({ paymentUrl });
    } catch (error) {
      console.error("Erreur de paiement :", error?.response?.data || error.message);
      res.status(500).json({ error: "Erreur lors de la création du paiement" });
    }
  };
  const notifyPayment = async (req, res) => {
    try {
      const { status, metadata } = req.body;
  
      console.log("Webhook reçu:", req.body);
  
      const reservationId = metadata?.reservationId;
  
      if (!reservationId || !status) {
        return res.status(400).send("Données invalides");
      }
  
      const newStatus = status === "success" ? "payé" : "échoué";
  
      const updated = await Reservation.findByIdAndUpdate(reservationId, {
        paymentStatus: newStatus
      });
  
      if (!updated) {
        return res.status(404).send("Réservation non trouvée");
      }
  
      res.status(200).send("OK");
    } catch (error) {
      console.error("Erreur dans le webhook :", error.message);
      res.status(500).send("Erreur serveur");
    }
  };
  module.exports = {
     addReservation,
     createPayment,
     notifyPayment
     };