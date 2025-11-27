import React, { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { base64Decode } from "esewajs";
import axios from "axios";

const Success = () => {
  const [isSuccess, setIsSuccess] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const navigate = useNavigate();
  const location = useLocation();

  const queryParams = new URLSearchParams(location.search);
  const token = queryParams.get("data");

  useEffect(() => {
    const verifyPaymentAndUpdateStatus = async () => {
      if (!token) {
        console.error("No token found");
        setIsLoading(false);
        return;
      }

      let decoded;
      try {
        decoded = base64Decode(token);
      } catch (err) {
        console.error("Failed to decode token:", err);
        setIsLoading(false);
        return;
      }

      if (!decoded?.transaction_uuid) {
        console.error("Invalid token or missing transaction UUID");
        setIsLoading(false);
        return;
      }

      try {
        console.log("Calling backend with transaction_uuid:", decoded.transaction_uuid);
        console.log("Full URL:", `${import.meta.env.VITE_BACKEND_URL}/api/payment/status/${decoded.transaction_uuid}`);

        const response = await axios.get(
          `http://localhost:5000/api/shop/esewa/payment/status/${decoded.transaction_uuid}`
        );

        if (response.status === 200) {
          setIsSuccess(true);
        } else {
          throw new Error("Payment verification failed");
        }
      } catch (error) {
        console.error("Error verifying payment:", error);
      } finally {
        setIsLoading(false);
      }
    };

    verifyPaymentAndUpdateStatus();
  }, [token]);

  if (isLoading && !isSuccess) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-100">
        <p className="text-lg font-semibold animate-pulse text-gray-600">
          Verifying your payment...
        </p>
      </div>
    );
  }

  if (!isLoading && !isSuccess) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-red-50 px-4 text-center">
        <h1 className="text-2xl font-bold text-red-600 mb-4">
          Oops! Error verifying payment
        </h1>
        <p className="text-gray-600 mb-6">
          We’ll resolve it soon. Please try again later.
        </p>
        <button
          onClick={() => navigate("/")}
          className="bg-red-600 hover:bg-red-700 text-white font-semibold py-2 px-6 rounded transition duration-200"
        >
          Go to Homepage
        </button>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-green-50 text-center px-4">
      <header className="mb-6">
        <div className="flex items-center justify-center">
          <MountainIcon className="w-10 h-10 stroke-black" />
          <span className="ml-2 text-xl font-semibold">By Karma Fashion</span>
        </div>
      </header>

      <main>
        <CircleCheckIcon className="w-20 h-20 stroke-green-600 mb-4 animate-bounce" />
        <h1 className="text-3xl font-bold text-green-700 mb-2">
          Payment Successful
        </h1>
        <p className="text-gray-700 mb-6">Thank you for your purchase!</p>
        <button
          onClick={() => navigate("/")}
          className="bg-green-600 hover:bg-green-700 text-white font-medium py-2 px-6 rounded transition duration-200"
        >
          Return to Homepage
        </button>
      </main>

      <footer className="mt-10 text-gray-500 text-sm">
        &copy; {new Date().getFullYear()} By Karma Fashion. All rights reserved.
      </footer>
    </div>
  );
};

function CircleCheckIcon({ className }) {
  return (
    <svg
      className={className}
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="none"
      stroke="green"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <circle cx="12" cy="12" r="10" />
      <path d="m9 12 2 2 4-4" />
    </svg>
  );
}

function MountainIcon({ className }) {
  return (
    <svg
      className={className}
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="none"
      stroke="black"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="m8 3 4 8 5-5 5 15H2L8 3z" />
    </svg>
  );
}

export default Success;
