import { useState } from "react";
import "./App.css";
import { BrowserRouter, Route, Routes, useLocation } from "react-router-dom";
import { AnimatePresence, motion } from "framer-motion";
import HeroPage from "./pages/common/hero/index.jsx";
import PlayerHome from "./pages/player/home/index.jsx";
import { Toaster } from "sonner";
import Sidebar from "./components/common/Sidebar";
import Overview from "./pages/Overview";
import Products from "./pages/Products";
import Users from "./pages/Users";
import Sales from "./pages/Sales";
import Orders from "./pages/Orders";
import Marketplace from "./pages/player/marketplace/index.jsx";

const pageVariants = {
  initial: { opacity: 0 },
  animate: { opacity: 1, transition: { duration: 0.2 } },
  exit: { opacity: 0, transition: { duration: 0.2 } },
};

function AnimatedRoutes() {
  const location = useLocation();

  return (
    <AnimatePresence mode="wait">
      <motion.div
        key={location.pathname}
        variants={pageVariants}
        initial="initial"
        animate="animate"
        exit="exit"
      >
        <Routes location={location}>
          <Route path="/" element={<HeroPage />} />
          <Route path="/home" element={<PlayerHome />} />
          <Route path="/marketplace" element={<Marketplace />} />
        </Routes>
      </motion.div>
    </AnimatePresence>
  );
}

function AdminLayout() {
  return (
    <div className="flex w-screen h-screen bg-gray-900 text-gray-100 overflow-hidden">
      <div className="fixed inset-0 z-0">
        <div className="absolute inset-0 bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 opacity-80" />
        <div className="absolute inset-0 backdrop-blur-sm" />
      </div>
      <Sidebar />
      <Routes>
        <Route path="/overview" element={<Overview />} />
        <Route path="/products" element={<Products />} />
        <Route path="/users" element={<Users />} />
        <Route path="/sales" element={<Sales />} />
        <Route path="/orders" element={<Orders />} />
      </Routes>
    </div>
  );
}

function ConditionalRoutes() {
  const location = useLocation();
  const isAdminRoute =
    location.pathname.startsWith("/overview") ||
    location.pathname.startsWith("/products") ||
    location.pathname.startsWith("/users") ||
    location.pathname.startsWith("/sales") ||
    location.pathname.startsWith("/orders");

  return isAdminRoute ? <AdminLayout /> : <AnimatedRoutes />;
}

function App() {
  const [count, setCount] = useState(0);

  return (
    <BrowserRouter>
      <ConditionalRoutes />
      <Toaster expand={true} />
    </BrowserRouter>
  );
}

export default App;
