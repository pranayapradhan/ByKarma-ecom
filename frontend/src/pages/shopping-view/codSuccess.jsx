import React from "react";
import { useNavigate } from "react-router-dom";

const SuccessUI = ({ isSuccess = true }) => {
  const navigate = useNavigate();

  const handleReturnHome = () => {
    navigate("/");
  };

  if (!isSuccess) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center text-center px-4 bg-gray-50">
        <h1 className="text-3xl font-bold text-red-600 mb-2">Oops! Error verifying Order</h1>
        <p className="text-gray-600 mb-6">We’ll resolve it soon. Please try again later.</p>
        <button onClick={handleReturnHome} className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition">
          Go to Homepage
        </button>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center text-center px-4 bg-white">
      <header className="w-full py-4 border-b flex justify-center items-center gap-2">
        <MountainIcon className="w-6 h-6 text-black" />
        <span className="text-lg font-semibold">By Karma Fashion</span>
      </header>

      <main className="flex flex-col items-center justify-center flex-grow py-10">
        <CircleCheckIcon className="w-16 h-16 text-green-600 mb-4" />
        <h1 className="text-3xl font-bold text-gray-800 mb-2">Order Successful</h1>
        <p className="text-gray-600 mb-6">Thank you for your purchase!</p>
        <button onClick={handleReturnHome} className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition">
          Return to Homepage
        </button>
      </main>

      <footer className="w-full py-4 border-t text-sm text-gray-500 text-center">
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
      stroke="currentColor"
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
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="m8 3 4 8 5-5 5 15H2L8 3z" />
    </svg>
  );
}

export default SuccessUI;
