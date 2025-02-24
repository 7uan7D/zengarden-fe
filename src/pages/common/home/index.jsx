import { motion } from "framer-motion";
// import { useNavigate } from "react-router-dom"; // Ensure routing works
import { BadgeCheck } from "lucide-react"; // Correct import for icon
import "./index.css";

export default function HomePage() {
  // const navigate = useNavigate(); // Ensure navigation works

  return (
    <div className="main-container">
        <img src="/src/assets/logo/zengarden-logo.png" alt="ZenGarden Logo" className="logo" />

        <motion.div 
  className="farmer-badge" 
  onClick={() => navigate("/login")}
  whileHover={{ scale: 1.1, rotate: 2 }}
  whileTap={{ scale: 0.5 }}
>
  <BadgeCheck className="icon" />
  <span>Farmer Verified</span>
</motion.div>

      <div className="hero">
        <h1>Welcome to ZenGarden</h1>
        <p>Grow your plants and do task every day!</p>

        <motion.button 
          className="btn"
          whileHover={{ scale: 1.25 }}
          whileTap={{ scale: 0.5 }}
        >
          Get Started
        </motion.button>
      </div>
      <div className="cards">

      <motion.div className="card" whileHover={{ scale: 1.05 }}>
    <h2>📝</h2>
    <h2>Doing Tasks</h2>
    <img src="/src/assets/images/tasks.png" alt="Achievements" className="card-img" />
    <p>Do the task and unlock a tons of exciting milestones.</p>
  </motion.div>
  <motion.div className="card" whileHover={{ scale: 1.05 }}>
    <h2>🌱</h2>
    <h2>Grow Plants</h2>
    <img src="/src/assets/images/grow plants.png" alt="Grow Plants" className="card-img" />
    <p>Choose a plant and start nurturing your garden.</p>
  </motion.div>
  
  <motion.div className="card" whileHover={{ scale: 1.05 }}>
    <h2>🌿</h2>
    <h2>Relax</h2>
    <img src="/src/assets/images/relax.png" alt="Relax" className="card-img" />
    <p>Enjoy a peaceful experience with a soothing interface.</p>
  </motion.div>
</div>

    </div>
  );
}
