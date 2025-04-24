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
import Tasks from "./pages/Tasks";
import Challenge from "./pages/Challenges";
import Analytics from "./pages/Analytics";
import Settings from "./pages/Settings";
import Marketplace from "./pages/player/marketplace/index.jsx";
import TreeXPLog from "./pages/TreeXPLog";
import UserXPLog from "./pages/UserXPLog";
import TaskPage from "./pages/player/task/index.jsx";
import Header from "./components/header";
import Challenges from "./pages/player/challenges";
import Tree from "./pages/player/tree/index.jsx";
import Workspace from "./pages/player/workspace";
import { UserExperienceProvider } from "@/context/UserExperienceContext";
import { TreeExperienceProvider } from "./context/TreeExperienceContext";
import MusicPlayerController from "./components/musicPlayerController";
import TaskOverlay from "../src/pages/player/task/task_overlay"; // Thêm import
import ChallengeDetails from "./pages/player/challenges/ChallengeDetails";
import { TimerProvider } from "./pages/player/workspace/timerContext";
import Policy from "./components/policy";
import Trees from "./pages/Trees";
import Packages from "./pages/Packages";
import TradeHistory from "./pages/TradeHistory";

const pageVariants = {
  initial: { opacity: 0 },
  animate: { opacity: 1, transition: { duration: 0.2 } },
  exit: { opacity: 0, transition: { duration: 0.2 } },
};

/** Mảng các path không hiển thị MusicPlayerController và TaskOverlay */
const excludedPaths = ["/", "/faq", "/workspace", "/policy"];
const excludedPathsHeader = ["/workspace"];
const excludedPathsTasks = ["/", "/faq", "/workspace", "/policy", "/task"];

function AnimatedRoutes() {
  const location = useLocation();
  const [isPlaying, setIsPlaying] = useState(false); // Trạng thái phát nhạc
  const [currentIndex, setCurrentIndex] = useState(0); // Chỉ số bài hát

  return (
    <UserExperienceProvider>
      <TreeExperienceProvider>
        <>
          <TimerProvider>
            {!excludedPathsHeader.includes(location.pathname) && (
              <div>
                <Header />
              </div>
            )}
            {/* Hiển thị MusicPlayerController */}
            {!excludedPaths.includes(location.pathname) && (
              <div className="fixed bottom-4 right-4 z-50">
                <MusicPlayerController
                  positionClass="fixed bottom-4 right-4 z-50 mb-5"
                  setPlaying={setIsPlaying}
                  setCurrentIndex={setCurrentIndex}
                />
              </div>
            )}
            {/* Hiển thị TaskOverlay */}
            {!excludedPathsTasks.includes(location.pathname) && (
              <div className="fixed top-4 left-4 z-50 mt-20">
                <TaskOverlay />
              </div>
            )}
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
                  <Route path="/workspace" element={<Workspace />} />
                  <Route path="/calendar" element={<Calendar />} />
                  <Route path="/home" element={<PlayerHome />} />
                  <Route path="/marketplace" element={<Marketplace />} />
                  <Route path="/task" element={<TaskPage />} />
                  <Route path="/challenges" element={<Challenges />} />
                  <Route path="/challenges/:id" element={<ChallengeDetails />} />
                  <Route path="/policy" element={<Policy />} />
                </Routes>
              </motion.div>
            </AnimatePresence>
            {!excludedPathsHeader.includes(location.pathname) && (
              <div>
                <Footer />
              </div>
            )}
          </TimerProvider>
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
        <Route path="/tasks" element={<Tasks />} />
        <Route path="/challenges-admin" element={<Challenge />} />
        <Route path="/trees" element={<Trees />} />
        <Route path="/packages" element={<Packages />} />
        <Route path="/trade-history" element={<TradeHistory />} />
        <Route path="/userXPLog" element={<UserXPLog />} />
        <Route path="/treeXPLog" element={<TreeXPLog />} />
        <Route path="/sales" element={<Sales />} />
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
    location.pathname.startsWith("/tasks") ||
    location.pathname.startsWith("/challenges-admin") ||
    location.pathname.startsWith("/trees") ||
    location.pathname.startsWith("/packages") ||
    location.pathname.startsWith("/trade-history") ||
    location.pathname.startsWith("/userXPLog") ||
    location.pathname.startsWith("/treeXPLog") ||
    location.pathname.startsWith("/sales") ||
    location.pathname.startsWith("/analytics") ||
    location.pathname.startsWith("/settings");

  return isAdminRoute ? <AdminLayout /> : <AnimatedRoutes />;
}

function App() {
  return (
    <BrowserRouter>
      <ConditionalRoutes />
      <Toaster expand={true} />
    </BrowserRouter>
  );
}

export default App;