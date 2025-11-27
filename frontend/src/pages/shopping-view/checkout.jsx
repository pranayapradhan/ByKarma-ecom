import Address from "@/components/shopping-view/address";
import img from "../../assets/account.jpg";
import { useDispatch, useSelector } from "react-redux";
import UserCartItemsContent from "@/components/shopping-view/cart-items-content";
import { Button } from "@/components/ui/button";
import { useState } from "react";
import {
  createNewOrder,
  EsewaInitiatePayment,
  paymentStatus,
} from "@/store/shop/order-slice";
import { Navigate } from "react-router-dom";
import { useToast } from "@/components/ui/use-toast";
import axios from "axios";
import esewa from "../../assets/esewa.png";
import cashOnDelivery from "../../assets/cod.png";

function ShoppingCheckout() {
  const { cartItems } = useSelector((state) => state.shopCart);
  const { user } = useSelector((state) => state.auth);
  const [currentSelectedAddress, setCurrentSelectedAddress] = useState(null);
  const [paymentMethod, setPaymentMethod] = useState("eSewa");
  const [isLoading, setIsLoading] = useState(false);
  const dispatch = useDispatch();
  const { toast } = useToast();

  const totalCartAmount =
    cartItems && cartItems.items && cartItems.items.length > 0
      ? cartItems.items.reduce(
          (sum, currentItem) =>
            sum +
            (currentItem?.salePrice > 0
              ? currentItem?.salePrice
              : currentItem?.price) *
              currentItem?.quantity,
          0
        )
      : 0;

  async function handleSubmit(e) {
    if (!paymentMethod) {
      toast({
        title: "Please select a payment method.",
        variant: "destructive",
      });
      return;
    }

    if (cartItems.length === 0) {
      toast({
        title: "Your cart is empty. Please add items to proceed",
        variant: "destructive",
      });
      return;
    }

    if (currentSelectedAddress === null) {
      toast({
        title: "Please select one address to proceed.",
        variant: "destructive",
      });
      return;
    }

    const orderData = {
      userId: user?.id,
      cartId: cartItems?._id,
      cartItems: cartItems.items.map((singleCartItem) => ({
        productId: singleCartItem?.productId,
        title: singleCartItem?.title,
        image: singleCartItem?.image,
        price:
          singleCartItem?.salePrice > 0
            ? singleCartItem?.salePrice
            : singleCartItem?.price,
        quantity: singleCartItem?.quantity,
      })),
      addressInfo: {
        addressId: currentSelectedAddress?._id,
        address: currentSelectedAddress?.address,
        city: currentSelectedAddress?.city,
        pincode: currentSelectedAddress?.pincode,
        phone: currentSelectedAddress?.phone,
        notes: currentSelectedAddress?.notes,
      },
      orderStatus: "pending",
      paymentMethod: paymentMethod,
      paymentStatus: "pending",
      totalAmount: totalCartAmount,
      orderDate: new Date(),
      orderUpdateDate: new Date(),
    };
    console.log(orderData);

    try {
      if (paymentMethod === "eSewa") {
        dispatch(EsewaInitiatePayment(orderData)).then((data) => {
          console.log("Data", data);
          if (data?.payload?.success) {
            toast({
              title: "Redirecting to eSewa payment...",
              variant: "default",
            });
            window.location.href = data?.payload?.url
          }
        });
      } else if (paymentMethod === "COD") {
        dispatch(createNewOrder(orderData)).then((data) => {
          if (data?.payload?.success) {
            window.location.href = "http://localhost:5173/shop/order-success";
          }
        });
      }
    } catch (error) {
      toast({
        title: "Error processing order.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <div className="flex flex-col">
      <div className="relative h-[300px] w-full overflow-hidden">
        <img src={img} className="h-full w-full object-cover object-center" />
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 mt-5 p-5">
        <Address
          selectedId={currentSelectedAddress}
          setCurrentSelectedAddress={setCurrentSelectedAddress}
        />

        <div className="flex flex-col gap-4">
          {cartItems && cartItems.items && cartItems.items.length > 0
            ? cartItems.items.map((item, index) => (
                <UserCartItemsContent key={index} cartItem={item} />
              ))
            : null}

          {/* Payment Method Buttons */}
          <div className="flex flex-col gap-2 mt-4">
            <label className="font-semibold">Select Payment Method:</label>
            <div className="flex gap-4">
              <button
                onClick={() => setPaymentMethod("COD")}
                className={`flex-1 border rounded-lg p-2 flex items-center gap-2 justify-center transition ${
                  paymentMethod === "COD"
                    ? "bg-green-100 border-green-500"
                    : "hover:bg-gray-100"
                }`}
              >
                <img
                  src={cashOnDelivery}
                  alt="COD"
                  className="w-30 h-10 object-contain"
                />
              </button>
              <button
                onClick={() => setPaymentMethod("eSewa")}
                className={`flex-1 border rounded-lg p-2 flex items-center gap-2 justify-center transition ${
                  paymentMethod === "eSewa"
                    ? "bg-green-100 border-green-500"
                    : "hover:bg-gray-100"
                }`}
              >
                <img
                  src={esewa}
                  alt="eSewa"
                  className="w-30 h-10 object-contain"
                />
              </button>
            </div>
          </div>

          {/* Total Amount */}
          <div className="mt-4 space-y-4">
            <div className="flex justify-between">
              <span className="font-bold">Total</span>
              <span className="font-bold">Rs. {totalCartAmount}</span>
            </div>
          </div>

          {/* Proceed Button */}
          <div className="mt-4 w-full">
            <Button onClick={handleSubmit} className="w-full">
              {isLoading ? "Processing..." : "Proceed to Order"}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default ShoppingCheckout;
