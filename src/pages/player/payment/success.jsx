import React from "react";
import { Link } from "react-router-dom";
import { CheckCircle } from "lucide-react";

const Success = () => {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-green-50 text-green-700 px-4">
      <CheckCircle size={80} className="text-green-500 animate-bounce mb-6" />
      <h1 className="text-5xl font-extrabold mb-4 text-center">
        Payment Successful!
      </h1>
      <p className="text-lg mb-8 text-center">
        Thank you for your purchase. Your order has been placed successfully.
      </p>
      <Link
        to="/Marketplace"
        className="bg-green-600 text-white px-6 py-3 rounded-xl shadow hover:bg-green-700 transition"
      >
        Go back to Marketplace
      </Link>
    </div>
  );
};

export default Success;
