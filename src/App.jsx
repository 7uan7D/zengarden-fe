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
import TaskOverlay from "../src/pages/player/task/task_overlay";
import ChallengeDetails from "./pages/player/challenges/ChallengeDetails";
import { TimerProvider } from "./pages/player/workspace/timerContext";
import Policy from "./components/policy";
import Trees from "./pages/Trees";
import Packages from "./pages/Packages";
import TradeHistory from "./pages/TradeHistory";
import Transactions from "./pages/Transactions";
import ChallengesModerate from "./pages/ChallengesModerate";
import ItemsModerate from "./pages/ItemsModerate";
import PackagesModerate from "./pages/PackagesModerate";
import DataRefreshModerate from "./pages/DataRefreshModerate";
import parseJwt from "./services/parseJwt";
import { Navigate } from "react-router-dom";
import TasksDurationModerate from "./pages/TasksDurationModerate";

const pageVariants = {
  initial: { opacity: 0 },
  animate: { opacity: 1, transition: { duration: 0.2 } },
  exit: { opacity: 0, transition: { duration: 0.2 } },
};

const excludedPaths = ["/", "/faq", "/policy", "/workspace"];
const excludedPathsHeader = ["/workspace"];
const excludedPathsTasks = [
  "/",
  "/home",
  "/faq",
  "/policy",
  "/task",
  "/workspace",
];

function ProtectedRoute({ children, roleRequired }) {
  const role = getUserRole();
  if (role !== roleRequired) {
    return <Navigate to="/" replace />;
  }
  return children;
}

function AnimatedRoutes() {
  const location = useLocation();

  const [isPlaying, setIsPlaying] = useState(false);
  const [currentIndex, setCurrentIndex] = useState(0);

  const rightPositionPaths = ["/workspace", "/marketplace"];
  const taskOverlayPositionClass = rightPositionPaths.includes(
    location.pathname
  )
    ? "fixed top-12 right-4 z-50 mt-20"
    : "fixed top-6 left-4 z-50 mt-20";

  return (
    <UserExperienceProvider>
      <TreeExperienceProvider>
        <>
          <TimerProvider>
            {!excludedPathsHeader.includes(location.pathname) && <Header />}
            {!excludedPaths.includes(location.pathname) && (
              <div className="fixed bottom-4 right-4 z-50">
                <MusicPlayerController
                  positionClass="fixed bottom-4 right-4 z-50 mb-5"
                  setPlaying={setIsPlaying}
                  setCurrentIndex={setCurrentIndex}
                />
              </div>
            )}
            {!excludedPathsTasks.includes(location.pathname) && (
              <div className={taskOverlayPositionClass}>
                <TaskOverlay positionClass={taskOverlayPositionClass} />
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

                  <Route
                    path="/tree"
                    element={
                      //<ProtectedRoute roleRequired="Player">
                      <Tree />
                      //</ProtectedRoute>
                    }
                  />

                  <Route
                    path="/workspace"
                    element={
                      //<ProtectedRoute roleRequired="Player">
                      <Workspace />
                      //</ProtectedRoute>
                    }
                  />

                  <Route
                    path="/calendar"
                    element={
                      <ProtectedRoute roleRequired="Player">
                        <Calendar />
                      </ProtectedRoute>
                    }
                  />

                  <Route
                    path="/home"
                    element={
                      <ProtectedRoute roleRequired="Player">
                        <PlayerHome />
                      </ProtectedRoute>
                    }
                  />

                  <Route
                    path="/task"
                    element={
                      //<ProtectedRoute roleRequired="Player">
                      <TaskPage />
                      //</ProtectedRoute>
                    }
                  />

                  <Route
                    path="/marketplace"
                    element={
                      <ProtectedRoute roleRequired="Player">
                        <Marketplace />
                      </ProtectedRoute>
                    }
                  />

                  <Route
                    path="/challenges"
                    element={
                      <ProtectedRoute roleRequired="Player">
                        <Challenges />
                      </ProtectedRoute>
                    }
                  />

                  <Route
                    path="/challenges/:id"
                    element={<ChallengeDetails />}
                  />
                  <Route path="/policy" element={<Policy />} />

                  <Route path="/payment/success" element={<Success />} />
                  <Route path="/payment/fail" element={<Fail />} />
                </Routes>
              </motion.div>
            </AnimatePresence>
            {!excludedPathsHeader.includes(location.pathname) && <Footer />}
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
        <Route
          path="/overview"
          element={
            <ProtectedRoute roleRequired="Admin">
              <Overview />
            </ProtectedRoute>
          }
        />
        <Route
          path="/users"
          element={
            <ProtectedRoute roleRequired="Admin">
              <Users />
            </ProtectedRoute>
          }
        />
        <Route
          path="/users"
          element={
            <ProtectedRoute roleRequired="Admin">
              <Users />
            </ProtectedRoute>
          }
        />

        {/* admin */}
        <Route
          path="/items"
          element={
            <ProtectedRoute roleRequired="Admin">
              <Items />
            </ProtectedRoute>
          }
        />

        <Route
          path="/tasks"
          element={
            <ProtectedRoute roleRequired="Admin">
              <Tasks />
            </ProtectedRoute>
          }
        />

        <Route
          path="/challenges-admin"
          element={
            <ProtectedRoute roleRequired="Admin">
              <Challenge />
            </ProtectedRoute>
          }
        />

        <Route
          path="/trees"
          element={
            <ProtectedRoute roleRequired="Admin">
              <Trees />
            </ProtectedRoute>
          }
        />

        <Route
          path="/packages"
          element={
            <ProtectedRoute roleRequired="Admin">
              <Packages />
            </ProtectedRoute>
          }
        />

        <Route
          path="/trade-history"
          element={
            <ProtectedRoute roleRequired="Admin">
              <TradeHistory />
            </ProtectedRoute>
          }
        />

        <Route
          path="/transactions"
          element={
            <ProtectedRoute roleRequired="Admin">
              <Transactions />
            </ProtectedRoute>
          }
        />

        <Route
          path="/treeXPLog"
          element={
            <ProtectedRoute roleRequired="Admin">
              <TreeXPLog />
            </ProtectedRoute>
          }
        />

        <Route
          path="/settings"
          element={
            // <ProtectedRoute roleRequired="Admin">
            <Settings />
            // </ProtectedRoute>
          }
        />

        {/* moderator */}
        <Route
          path="/challenges-moderate"
          element={
            <ProtectedRoute roleRequired="Moderator">
              <ChallengesModerate />
            </ProtectedRoute>
          }
        />

        <Route
          path="/tasks-moderate"
          element={
            <ProtectedRoute roleRequired="Moderator">
              <TasksDurationModerate />
            </ProtectedRoute>
          }
        />

        <Route
          path="/items-moderate"
          element={
            <ProtectedRoute roleRequired="Moderator">
              <ItemsModerate />
            </ProtectedRoute>
          }
        />

        <Route
          path="/packages-moderate"
          element={
            <ProtectedRoute roleRequired="Moderator">
              <PackagesModerate />
            </ProtectedRoute>
          }
        />

        <Route
          path="/data-refresh-moderate"
          element={
            <ProtectedRoute roleRequired="Moderator">
              <DataRefreshModerate />
            </ProtectedRoute>
          }
        />
        {/* test */}
        {/* <Route path="/userXPLog" element={<UserXPLog />} /> 

        <Route path="/sales" element={<Sales />} />
        <Route path="/analytics" element={<Analytics />} /> */}
      </Routes>
    </div>
  );
}

function getUserRole() {
  const token = localStorage.getItem("token"); // hoặc nơi bạn lưu token
  if (!token) return null;
  try {
    const decoded = parseJwt(token);
    return decoded.role || null;
  } catch (error) {
    console.error("Invalid token", error);
    return null;
  }
}

function ConditionalRoutes() {
  const location = useLocation();
  const role = getUserRole();

  const isAdminRoute =
    location.pathname.startsWith("/users") ||
    location.pathname.startsWith("/items") ||
    location.pathname.startsWith("/tasks") ||
    location.pathname.startsWith("/challenges-admin") ||
    location.pathname.startsWith("/trees") ||
    location.pathname.startsWith("/packages") ||
    location.pathname.startsWith("/trade-history") ||
    location.pathname.startsWith("/transactions") ||
    location.pathname.startsWith("/userXPLog") ||
    location.pathname.startsWith("/treeXPLog") ||
    location.pathname.startsWith("/challenges-moderate") ||
    location.pathname.startsWith("/tasks-moderate") ||
    location.pathname.startsWith("/items-moderate") ||
    location.pathname.startsWith("/packages-moderate") ||
    location.pathname.startsWith("/data-refresh-moderate") ||
    location.pathname.startsWith("/settings");

  const isModeratorRoute =
    location.pathname.startsWith("/challenges-moderate") ||
    location.pathname.startsWith("/items-moderate");

  if (role === "Admin" && isAdminRoute) return <AdminLayout />;
  if (role === "Moderator" && isModeratorRoute) return <AdminLayout />;
  if (role === "Player" && !isAdminRoute && !isModeratorRoute)
    return <AnimatedRoutes />;

  // ✅ Redirect từ "/" hoặc route không hợp lệ dựa vào role
  if (location.pathname === "/") {
    if (role === "Admin") return <Navigate to="/users" replace />;
    if (role === "Moderator")
      return <Navigate to="/challenges-moderate" replace />;
    if (role === "Player") return <Navigate to="/home" replace />;
  }

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
