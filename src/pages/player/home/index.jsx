import React from "react";
import Header from "../../../components/header/index.jsx"; // Import Header

const HomePage = () => {
  return (
    <div>
      <Header />
      <main className="p-6">
        <h1 className="text-2xl font-bold">Welcome to Player Home</h1>
        <p className="text-gray-600">This is the player home page.</p>
      </main>
    </div>
  );
};

export default HomePage;
