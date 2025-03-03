import { useState } from "react";
import "./App.css";
import { BrowserRouter, Route, Routes, useLocation } from "react-router-dom";
import { AnimatePresence, motion } from "framer-motion";
import HeroPage from "./pages/common/hero/index.jsx";
import PlayerHome from "./pages/player/home/index.jsx";
import { Toaster } from "sonner";
import Overview from "./pages/Overview";
import Products from "./pages/Products";
import Sidebar from "./components/sidebar/Sidebar";

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
      </Routes>
    </div>
  );
}

function ConditionalRoutes() {
  const location = useLocation();
  const isAdminRoute = location.pathname.startsWith("/overview") || location.pathname.startsWith("/products");

  return isAdminRoute ? (
    <AdminLayout />
  ) : (
    <AnimatedRoutes />
  );
}

function App() {
  const [count, setCount] = useState(0)

  return (
    <BrowserRouter>
      <ConditionalRoutes />
      <Toaster expand={true} />
    </BrowserRouter>
  );
}

export default App
