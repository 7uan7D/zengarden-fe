import { useState } from 'react';
import './App.css';
import HeroPage from "./pages/common/hero/index.jsx";

function App() {
  const [count, setCount] = useState(0);

  return (
      <HeroPage />
  );
}

export default App;