const mongoose = require("mongoose");

const PaymentSchema = new mongoose.Schema(
  {
    transactionId: { type: String, unique: true },
    orderId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Order",
      required: true,
    },
    totalAmount: { type: Number, required: true },
    dataFromVerificationReq: { type: Object },
    apiQueryFromUser: { type: Object },
    paymentmethod: {
      type: String,
      enum: ["COD", "eSewa"],
      required: true,
    },
    PaymentStatus: {
      type: String,
      enum: ["COMPLETE", "Pending", "FAILED"],
      default: "Pending",
    },
    paymentDate: { type: Date, default: Date.now },
  },
  { timestamps: true }
);
const Payment = mongoose.model("Payment", PaymentSchema);
module.exports = Payment;