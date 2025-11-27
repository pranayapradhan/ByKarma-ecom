const Order = require("../../models/Order");
const Cart = require("../../models/Cart");
const Product = require("../../models/Product");
const User = require("../../models/User");

const createCodOrder = async (req, res) => {
  try {
    const {
      userId,
      cartItems,
      addressInfo,
      paymentMethod,
      totalAmount,
      cartId,
    } = req.body;
    // console.log(req.body)

    // Step 1: Validate products exist and have enough stock
    for (let item of cartItems) {
      const product = await Product.findById(item.productId);
      if (!product || product.totalStock < item.quantity) {
        return res.status(400).json({
          success: false,
          message: `Insufficient stock for ${item.title}`,
        });
      }
    }

    // Step 2: Create order
    const newOrder = new Order({
      userId,
      cartId,
      cartItems,
      addressInfo,
      orderStatus: "confirmed",
      paymentMethod,
      paymentStatus: "pending",
      totalAmount,
      orderDate: new Date(),
      orderUpdateDate: new Date(),
    });
    // console.log(newOrder)
    await newOrder.save();

    // Step 3: Associate order with user
    await User.findByIdAndUpdate(userId, {
      $push: { orders: newOrder._id },
    });

    // Step 4: Reduce product stock
    for (let item of cartItems) {
      const product = await Product.findById(item.productId);
      product.totalStock -= item.quantity;
      await product.save();
    }

    // Step 5: Remove cart
    await Cart.findByIdAndDelete(cartId);

    res.status(200).json({
      success: true,
      message: "Order placed successfully!",
      data: newOrder,
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({
      success: false,
      message: "Something went wrong while placing the order.",
    });
  }
};

module.exports = createCodOrder;
