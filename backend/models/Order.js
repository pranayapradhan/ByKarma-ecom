const mongoose = require("mongoose");

const OrderSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  cartId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Cart",
    required: true,
  },
  cartItems: [
    {
      productId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Product",
        required: true,
      },
      title: {
        type: String,
        required: true,
      },
      image: String,
      price: {
        type: Number,
        required: true,
      },
      quantity: {
        type: Number,
        required: true,
        min: 1,
      },
    },
  ],
  addressInfo: {
    addressId: String,
    address: {
      type: String,
      required: true,
    },
    city: String,
    pincode: String,
    phone: {
      type: String,
      required: true,
    },
    notes: String,
  },
  orderStatus: {
    type: String,
    enum: ["pending", "confirmed", "failed", "delivered"],
    default: "pending",
  },
  paymentMethod: {
    type: String,
    enum: ["eSewa", "COD"],
    required: true,
  },
  paymentStatus: {
    type: String,
    enum: ["Pending", "COMPLETE", "FAILED"],
    default: "Pending",
  },
  totalAmount: {
    type: Number,
    required: true,
    min: 0,
  },
  orderDate: {
    type: Date,
    default: Date.now,
  },
  orderUpdateDate: {
    type: Date,
    default: Date.now,
  },
}, {
  timestamps: true,
});

module.exports = mongoose.model("Order", OrderSchema);
