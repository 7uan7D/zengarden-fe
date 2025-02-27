import { useState } from "react";
import "./App.css";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import HeroPage from "./pages/common/hero/index.jsx";
import PlayerHome from "./pages/player/home/index.jsx";
import { Toaster } from "sonner";

function App() {
  const [count, setCount] = useState(0);

  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<HeroPage />} />
        <Route path="/home" element={<PlayerHome />} />
      </Routes>
      <Toaster expand={true} />
    </BrowserRouter>
  );
}

export default App;
