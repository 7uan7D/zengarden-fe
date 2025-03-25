import { useState } from "react";
import { Toaster } from "sonner";
import "./App.css";
import { BrowserRouter, Route, Routes, useLocation } from "react-router-dom";
import { AnimatePresence, motion } from "framer-motion";
import HeroPage from "./pages/common/hero/index.jsx";
import PlayerHome from "./pages/player/home/index.jsx";
import FAQ from "./pages/faq/index.jsx";
import Calendar from "./pages/player/calendar";
import Sidebar from "./components/common/Sidebar";
import Footer from "./components/footer";
import Overview from "./pages/Overview";
import Items from "./pages/Items";
import Users from "./pages/Users";
import Sales from "./pages/Sales";
import Orders from "./pages/Orders";
import Analytics from "./pages/Analytics";
import Settings from "./pages/Settings";
import Marketplace from "./pages/player/marketplace/index.jsx";
import TreeXPLog from "./pages/TreeXPLog";
import UserXPLog from "./pages/UserXPLog";
import TaskPage from "./pages/player/task/index.jsx";
import Header from "./components/header";
import Challenges from "./pages/player/challenges";
import Tree from "./pages/player/tree/index.jsx";
import { UserExperienceProvider } from "@/context/UserExperienceContext";
import { TreeExperienceProvider } from "./context/TreeExperienceContext";

const pageVariants = {
  initial: { opacity: 0 },
  animate: { opacity: 1, transition: { duration: 0.2 } },
  exit: { opacity: 0, transition: { duration: 0.2 } },
};

function AnimatedRoutes() {
  const location = useLocation();

  return (
    <UserExperienceProvider>
      <TreeExperienceProvider>
        <>
          <Header />
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
                <Route path="/faq" element={<FAQ />} />
                <Route path="/tree" element={<Tree />} />
                <Route path="/calendar" element={<Calendar />} />
                <Route path="/home" element={<PlayerHome />} />
                <Route path="/marketplace" element={<Marketplace />} />
                <Route path="/task" element={<TaskPage />} />
                <Route path="/challenges" element={<Challenges />} />
              </Routes>
            </motion.div>
          </AnimatePresence>
          <Footer />
        </>
      </TreeExperienceProvider>
    </UserExperienceProvider>
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
        <Route path="/users" element={<Users />} />
        <Route path="/items" element={<Items />} />
        <Route path="/userXPLog" element={<UserXPLog />} />
        <Route path="/treeXPLog" element={<TreeXPLog />} />
        <Route path="/sales" element={<Sales />} />
        <Route path="/orders" element={<Orders />} />
        <Route path="/analytics" element={<Analytics />} />
        <Route path="/settings" element={<Settings />} />
      </Routes>
    </div>
  );
}

function ConditionalRoutes() {
  const location = useLocation();
  const isAdminRoute =
    location.pathname.startsWith("/overview") ||
    location.pathname.startsWith("/users") ||
    location.pathname.startsWith("/items") ||
    location.pathname.startsWith("/userXPLog") ||
    location.pathname.startsWith("/treeXPLog") ||
    location.pathname.startsWith("/sales") ||
    location.pathname.startsWith("/orders") ||
    location.pathname.startsWith("/analytics") ||
    location.pathname.startsWith("/settings");

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
