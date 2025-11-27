const { EsewaPaymentGateway, EsewaCheckStatus } = require("esewajs");
const Product = require("../../models/Product");
const Order = require("../../models/Order");
const Cart = require("../../models/Cart");
const User = require("../../models/User");
require("dotenv").config();

const EsewaInitiatePayment = async (req, res) => {
  try {
    const { userId, cartItems, addressInfo, totalAmount, cartId } = req.body;

    if (!userId || !cartId || !Array.isArray(cartItems) || cartItems.length === 0 || !totalAmount || !addressInfo) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    // Check stock availability
    for (let item of cartItems) {
      const product = await Product.findById(item.productId);
      if (!product || product.totalStock < item.quantity) {
        return res.status(400).json({ success: false, message: `Insufficient stock for ${item.title}` });
      }
    }

    // Create order
    const orderData = await Order.create({
      userId,
      cartItems,
      addressInfo,
      cartId,
      paymentMethod: "eSewa",
      totalAmount,
    });

    // eSewa Payment Request
    const reqPayment = await EsewaPaymentGateway(
      totalAmount, 0, 0, 0, orderData._id,
      process.env.MERCHANT_ID,
      process.env.ESEWA_SECRET,
      process.env.SUCCESS_URL,
      process.env.FAILURE_URL,
      process.env.ESEWAPAYMENT_URL
    );

    if (!reqPayment) {
      return res.status(400).json({ message: "Failed to create eSewa payment request" });
    }

    // Link order to user
    await User.findByIdAndUpdate(userId, {
      $push: { orders: orderData._id },
    });

    // Update stock
    for (let item of cartItems) {
      const product = await Product.findById(item.productId);
      product.totalStock -= item.quantity;
      await product.save();
    }

    // Delete cart
    await Cart.findByIdAndDelete(cartId);

    // Return redirect URL
    return res.json({
      success: true,
      url: reqPayment.request.res.responseUrl,
      orderId: orderData._id,
    });
  } catch (error) {
    console.error("Esewa Payment Initiation Error:", error);
    return res.status(500).json({ message: "Esewa Payment Initiation Failed", error: error.message });
  }
};

const paymentStatus = async (req, res) => {
  const orderId = req.params.transaction_uuid;
  console.log(orderId)

  try {
    const order = await Order.findById(orderId);
    console.log(order)
    if (!order) {
      return res.status(404).json({ success: false, message: "Order not found" });
    }

    const paymentStatusCheck = await EsewaCheckStatus(
      order.totalAmount,
      orderId,
      process.env.MERCHANT_ID,
      process.env.ESEWAPAYMENT_STATUS_CHECK_URL
    );

    const status = paymentStatusCheck.data?.status;
    console.log("eSewa Response:", status);
    console.log("eSewa Response:", paymentStatusCheck.status);
    
    if (paymentStatusCheck.status === 200 && status) {
      if (status === "COMPLETE") {
        order.paymentStatus = "COMPLETE";
        order.orderStatus = "confirmed";
        order.orderUpdateDate = new Date();
        await order.save();

        return res.status(200).json({
          success: true,
          message: "Payment successful. Order confirmed.",
          updatedOrder: order,
          data: paymentStatusCheck.data,
        });
      } else if (status === "FAILED") {
        order.paymentStatus = "FAILED";
        order.orderStatus = "failed";
        order.orderUpdateDate = new Date();
        await order.save();

        return res.status(200).json({
          success: false,
          message: "Payment failed.",
          data: paymentStatusCheck.data,
        });
      } else {
        return res.status(400).json({
          success: false,
          message: `Unhandled payment status: ${status}`,
          data: paymentStatusCheck.data,
        });
      }
    } else {
      return res.status(400).json({
        success: false,
        message: "Payment verification failed or invalid response from eSewa.",
      });
    }
  } catch (error) {
    console.error("Payment verification error:", error);
    return res.status(500).json({
      success: false,
      message: "Server error during payment verification",
      error: error.message,
    });
  }
};

module.exports = {
  EsewaInitiatePayment,
  paymentStatus
};
