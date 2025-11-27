const express = require('express');
const {
  EsewaInitiatePayment,
  paymentStatus
} = require('../../controllers/shop/esewa-controller');

const esewaRouter = express.Router();

// Initiate payment route (POST)
esewaRouter.post("/payment-initiate", EsewaInitiatePayment);

// Verify payment status route (GET) – for frontend success page
esewaRouter.get("/payment/status/:transaction_uuid", paymentStatus);

// Optionally keep the original POST route (if used elsewhere)
esewaRouter.post("/payment-status", paymentStatus);

module.exports = esewaRouter;