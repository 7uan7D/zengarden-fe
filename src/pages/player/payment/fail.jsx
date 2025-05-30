import React from "react";
import { Link } from "react-router-dom";
import { XCircle } from "lucide-react";

const Fail = () => {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-red-50 text-red-700 px-4">
      <XCircle size={80} className="text-red-500 animate-pulse mb-6" />
      <h1 className="text-5xl font-extrabold mb-4 text-center">
        Payment Failed
      </h1>
      <p className="text-lg mb-8 text-center">
        Something went wrong during the transaction. Please try again.
      </p>
      <Link
        to="/Marketplace"
        className="bg-red-600 text-white px-6 py-3 rounded-xl shadow hover:bg-red-700 transition"
      >
        Try Again
      </Link>
    </div>
  );
};

export default Fail;
