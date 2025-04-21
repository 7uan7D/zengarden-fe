import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerDescription,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
} from "@/components/ui/drawer";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import "./index.css";
import { RegisterService } from "@/services/apiServices/authService";
import { Toaster, toast } from "sonner";

export default function HeroPage() {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    email: "",
    phone: "",
    userName: "",
    password: "",
    confirmPassword: "",
    roleId: 2,
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Carousel state
  const carouselItems = [
    {
      src: "/images/hero_image_1.png",
      caption: "Grow your virtual garden with daily tasks!",
    },
    {
      src: "/images/hero_image_2.png",
      caption: "Stay productive and earn rewards!",
    },
    {
      src: "/images/hero_image_3.png",
      caption: "Find peace in your ZenGarden!",
    },
  ];
  const [currentImageIndex, setCurrentImageIndex] = useState(0);

  // Auto-transition every 5 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentImageIndex((prevIndex) => (prevIndex + 1) % carouselItems.length);
    }, 5000);
    return () => clearInterval(interval);
  }, [carouselItems.length]);

  // Hàm điều hướng carousel
  const goToPrevious = () => {
    setCurrentImageIndex((prevIndex) =>
      prevIndex === 0 ? carouselItems.length - 1 : prevIndex - 1
    );
  };

  const goToNext = () => {
    setCurrentImageIndex((prevIndex) => (prevIndex + 1) % carouselItems.length);
  };

  const goToImage = (index) => {
    setCurrentImageIndex(index);
  };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.id]: e.target.value });
  };

  const handleSubmit = async () => {
    if (formData.password !== formData.confirmPassword) {
      toast.error("Passwords do not match!");
      return;
    }

    setIsSubmitting(true);
    try {
      const response = await RegisterService(formData);
      const token = response.token;

      if (token) {
        localStorage.setItem("token", token);
        toast.success("Registration successful!");

        setTimeout(() => {
          navigate("/home");
        }, 500);
      } else {
        toast.error("Registration succeeded but no token returned!");
      }
    } catch (error) {
      toast.error(error.response?.data?.message || "Registration failed");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="main-container">
      <div className="hero">
        <div className="hero-content">
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            Welcome to ZenGarden
          </motion.h1>
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            style={{ fontSize: "1.5rem", color: "#83aa6c", fontWeight: 500 }}
          >
            Your Journey to Productivity
          </motion.h2>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.4 }}
          >
            Grow your plants, complete tasks, and find your zen every day!
          </motion.p>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.6 }}
          >
            <Drawer>
              <DrawerTrigger asChild>
                <motion.button
                  className="btn"
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.95 }}
                >
                  Get Started
                </motion.button>
              </DrawerTrigger>
              <DrawerContent>
                <div className="mx-auto w-full max-w-sm p-4">
                  <DrawerHeader>
                    <DrawerTitle>Sign Up</DrawerTitle>
                    <DrawerDescription>
                      Join ZenGarden and start your journey.
                    </DrawerDescription>
                  </DrawerHeader>
                  <div className="grid gap-4">
                    <Label htmlFor="userName">Username</Label>
                    <Input
                      id="userName"
                      type="text"
                      placeholder="Zenman"
                      onChange={handleChange}
                    />
                    <Label htmlFor="email">Email</Label>
                    <Input
                      id="email"
                      type="email"
                      placeholder="example@email.com"
                      onChange={handleChange}
                    />
                    <Label htmlFor="phone">Phone</Label>
                    <Input
                      id="phone"
                      type="tel"
                      placeholder="Enter your phone number"
                      onChange={handleChange}
                    />
                    <Label htmlFor="password">Password</Label>
                    <Input
                      id="password"
                      type="password"
                      placeholder="••••••••"
                      onChange={handleChange}
                    />
                    <Label htmlFor="confirmPassword">Confirm Password</Label>
                    <Input
                      id="confirmPassword"
                      type="password"
                      placeholder="••••••••"
                      onChange={handleChange}
                    />
                  </div>
                  <DrawerFooter className="mt-4">
                    <Button onClick={handleSubmit} disabled={isSubmitting}>
                      {isSubmitting ? "Signing Up..." : "Sign Up"}
                    </Button>
                    <DrawerClose asChild>
                      <Button variant="outline">Cancel</Button>
                    </DrawerClose>
                  </DrawerFooter>
                </div>
              </DrawerContent>
              <Toaster expand={true} />
            </Drawer>
          </motion.div>
        </div>
        <div className="hero-carousel">
          <div className="carousel-container">
            <AnimatePresence mode="wait">
              <motion.div
                key={currentImageIndex}
                initial={{ opacity: 0, x: 100 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -100 }}
                transition={{ duration: 0.5 }}
                style={{ position: "relative", width: "100%", height: "100%" }}
              >
                <img
                  src={carouselItems[currentImageIndex].src}
                  alt={`Hero image ${currentImageIndex + 1}`}
                  className="carousel-img"
                />
                <p
                  style={{
                    position: "absolute",
                    bottom: "30px",
                    left: "50%",
                    transform: "translateX(-50%)",
                    color: "white",
                    background: "rgba(0, 0, 0, 0.6)",
                    padding: "8px 16px",
                    borderRadius: "4px",
                    fontSize: "1rem",
                    textAlign: "center",
                  }}
                >
                  {carouselItems[currentImageIndex].caption}
                </p>
              </motion.div>
            </AnimatePresence>
            <motion.button
              className="carousel-btn prev"
              onClick={goToPrevious}
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
            >
              ❮
            </motion.button>
            <motion.button
              className="carousel-btn next"
              onClick={goToNext}
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
            >
              ❯
            </motion.button>
            <div className="carousel-dots">
              {carouselItems.map((_, index) => (
                <motion.span
                  key={index}
                  className={`dot ${index === currentImageIndex ? "active" : ""}`}
                  onClick={() => goToImage(index)}
                  whileHover={{ scale: 1.2 }}
                />
              ))}
            </div>
          </div>
        </div>
      </div>

      <div className="section gamify-section">
        <motion.div
          className="gamify-content"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
          >
            Gamify Your Life
          </motion.h1>
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.4 }}
            style={{ fontSize: "1.5rem", color: "#609994", fontWeight: 500 }}
          >
            Turn Tasks into Adventures
          </motion.h2>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.6 }}
          >
            ZenGarden transforms your daily routine into a fun game with rewards, challenges, and a vibrant community to keep you motivated.
          </motion.p>
        </motion.div>
        <div className="cards">
          <motion.div
            className="card"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.8 }}
            whileHover={{ scale: 1.05 }}
          >
            <img
              src="/images/task_status.png"
              alt="Track Tasks"
              className="card-img"
            />
            <h2>Track Tasks 📝</h2>
            <p>Manage your goals and to-dos with ZenGarden's intuitive workspace.</p>
          </motion.div>
          <motion.div
            className="card"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 1.0 }}
            whileHover={{ scale: 1.05 }}
          >
            <img
              src="/images/grow_plants.png"
              alt="Grow Plants"
              className="card-img"
            />
            <h2>Grow Plants 🌱</h2>
            <p>Nurture your virtual garden as you complete daily tasks.</p>
          </motion.div>
          <motion.div
            className="card"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 1.2 }}
            whileHover={{ scale: 1.05 }}
          >
            <img src="/images/relax.png" alt="Relax" className="card-img" />
            <h2>Relax 🌿</h2>
            <p>Unwind with calming visuals and a serene atmosphere.</p>
          </motion.div>
        </div>
      </div>

      <div className="section benefits-section">
        <motion.div
          className="gamify-content"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
          >
            ZenGarden Benefits
          </motion.h1>
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.4 }}
            style={{ fontSize: "1.5rem", color: "#609994", fontWeight: 500 }}
          >
            Elevate Your Daily Routine
          </motion.h2>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.6 }}
          >
            Discover how ZenGarden helps you stay productive, calm, and motivated every day.
          </motion.p>
        </motion.div>
        <div className="cards">
          <motion.div
            className="card"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.8 }}
            whileHover={{ scale: 1.05 }}
          >
            <img src="/images/tasks.png" alt="Productivity" className="card-img" />
            <h2>Boost Productivity 🚀</h2>
            <p>Turn tasks into fun challenges with rewarding progress.</p>
          </motion.div>
          <motion.div
            className="card"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 1.0 }}
            whileHover={{ scale: 1.05 }}
          >
            <img
              src="/images/grow_plants.png"
              alt="Nurture Mind"
              className="card-img"
            />
            <h2>Nurture Mind 🌼</h2>
            <p>Build healthy habits with your thriving virtual garden.</p>
          </motion.div>
          <motion.div
            className="card"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 1.2 }}
            whileHover={{ scale: 1.05 }}
          >
            <img src="/images/relax.png" alt="Find Zen" className="card-img" />
            <h2>Find Zen 🌟</h2>
            <p>Relax with a serene interface to reduce daily stress.</p>
          </motion.div>
        </div>
      </div>
    </div>
  );
}