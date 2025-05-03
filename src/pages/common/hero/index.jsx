import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Toaster, toast } from "sonner";
import { RegisterService } from "@/services/apiServices/authService";
import "./index.css";

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
      caption: "Cultivate your productivity with ZenGarden!",
      subCaption: "Grow your virtual garden daily.",
    },
    {
      src: "/images/hero_image_2.png",
      caption: "Stay focused, earn rewards!",
      subCaption: "Turn tasks into fun challenges.",
    },
    {
      src: "/images/hero_image_3.png",
      caption: "Find calm in your ZenGarden!",
      subCaption: "Relax with serene visuals.",
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
    <div className="hero-page">
      {/* Hero Section */}
      <section className="hero-section">
        <div className="hero-overlay"></div>
        <div className="hero-content">
          <motion.h1
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
          >
            Welcome to ZenGarden
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
          >
            Transform your daily tasks into a journey of growth and serenity.
          </motion.p>
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.4 }}
          >
            <Dialog>
              <DialogTrigger asChild>
                <Button className="hero-btn">Start Your Journey</Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                  <DialogTitle>Create Your ZenGarden Account</DialogTitle>
                  <DialogDescription>
                    Sign up to start growing your virtual garden.
                  </DialogDescription>
                </DialogHeader>
                <div className="grid gap-4 py-4">
                  <div className="grid gap-2">
                    <Label htmlFor="userName">Username</Label>
                    <Input
                      id="userName"
                      placeholder="ZenGardener"
                      onChange={handleChange}
                    />
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="email">Email</Label>
                    <Input
                      id="email"
                      type="email"
                      placeholder="you@example.com"
                      onChange={handleChange}
                    />
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="phone">Phone</Label>
                    <Input
                      id="phone"
                      type="tel"
                      placeholder="Your phone number"
                      onChange={handleChange}
                    />
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="password">Password</Label>
                    <Input
                      id="password"
                      type="password"
                      placeholder="••••••••"
                      onChange={handleChange}
                    />
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="confirmPassword">Confirm Password</Label>
                    <Input
                      id="confirmPassword"
                      type="password"
                      placeholder="••••••••"
                      onChange={handleChange}
                    />
                  </div>
                </div>
                <Button onClick={handleSubmit} disabled={isSubmitting}>
                  {isSubmitting ? "Creating Account..." : "Sign Up"}
                </Button>
              </DialogContent>
            </Dialog>
          </motion.div>
        </div>
        <div className="hero-carousel">
          <AnimatePresence mode="wait">
            <motion.div
              key={currentImageIndex}
              className="carousel-slide"
              initial={{ opacity: 0, scale: 1.1 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              transition={{ duration: 0.7 }}
            >
              <img
                src={carouselItems[currentImageIndex].src}
                alt={`Hero image ${currentImageIndex + 1}`}
                className="carousel-img"
              />
              <div className="carousel-caption">
                <h2>{carouselItems[currentImageIndex].caption}</h2>
                <p>{carouselItems[currentImageIndex].subCaption}</p>
              </div>
            </motion.div>
          </AnimatePresence>
          <div className="carousel-dots">
            {carouselItems.map((_, index) => (
              <span
                key={index}
                className={`dot ${index === currentImageIndex ? "active" : ""}`}
                onClick={() => goToImage(index)}
              />
            ))}
          </div>
        </div>
      </section>

      {/* Gamify Section */}
      <section className="gamify-section">
        <motion.div
          className="section-content"
          initial={{ opacity: 0, y: 50 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          viewport={{ once: true }}
        >
          <h2>Gamify Your Productivity</h2>
          <p>Turn your daily tasks into an engaging adventure with rewards and growth.</p>
        </motion.div>
        <div className="gamify-cards">
          <motion.div
            className="gamify-card"
            initial={{ opacity: 0, x: -50 }}
            whileInView={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            viewport={{ once: true }}
          >
            <img src="/images/task_status.png" alt="Track Tasks" />
            <h3>Track Your Goals</h3>
            <p>Organize tasks effortlessly with our intuitive workspace.</p>
          </motion.div>
          <motion.div
            className="gamify-card"
            initial={{ opacity: 0, x: 50 }}
            whileInView={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8, delay: 0.4 }}
            viewport={{ once: true }}
          >
            <img src="/images/grow_plants.png" alt="Grow Plants" />
            <h3>Nurture Your Garden</h3>
            <p>Watch your virtual plants thrive as you complete tasks.</p>
          </motion.div>
          <motion.div
            className="gamify-card"
            initial={{ opacity: 0, x: -50 }}
            whileInView={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8, delay: 0.6 }}
            viewport={{ once: true }}
          >
            <img src="/images/relax.png" alt="Relax" />
            <h3>Find Serenity</h3>
            <p>Relax with calming visuals and a peaceful interface.</p>
          </motion.div>
        </div>
      </section>

      {/* Benefits Section */}
      <section className="benefits-section">
        <motion.div
          className="section-content"
          initial={{ opacity: 0, y: 50 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          viewport={{ once: true }}
        >
          <h2>Why ZenGarden?</h2>
          <p>Elevate your routine with productivity, mindfulness, and fun.</p>
        </motion.div>
        <div className="benefits-cards">
          <motion.div
            className="benefit-card"
            initial={{ opacity: 0, y: 50 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            viewport={{ once: true }}
          >
            <div className="benefit-icon">🚀</div>
            <h3>Boost Productivity</h3>
            <p>Turn tasks into rewarding challenges.</p>
          </motion.div>
          <motion.div
            className="benefit-card"
            initial={{ opacity: 0, y: 50 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.4 }}
            viewport={{ once: true }}
          >
            <div className="benefit-icon">🌼</div>
            <h3>Mindful Growth</h3>
            <p>Build habits with your virtual garden.</p>
          </motion.div>
          <motion.div
            className="benefit-card"
            initial={{ opacity: 0, y: 50 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.6 }}
            viewport={{ once: true }}
          >
            <div className="benefit-icon">🌟</div>
            <h3>Find Your Zen</h3>
            <p>Reduce stress with a serene experience.</p>
          </motion.div>
        </div>
      </section>
      <Toaster expand={true} />
    </div>
  );
}