import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
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
      <div className="pt-[80px] hero">
        <h1>Welcome to ZenGarden</h1>
        <p>Grow your plants and do tasks every day!</p>

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
                  type="userName"
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
      </div>

      {/* Phần Gamify Your Life */}
      <div className="section gamify-section">
        <motion.div
          className="gamify-content"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <h1>Gamify your life</h1>
          <p>
            ZenGarden is a free habit-building and productivity app that treats
            your real life like a game. With in-game rewards and punishments to
            motivate you and a strong social network to inspire you, ZenGarden
            can help you achieve your goals to become healthy, hard-working, and
            happy.
          </p>
        </motion.div>
        <div className="cards">
          <motion.div className="card" whileHover={{ scale: 1.05 }}>
            <img
              src="/images/task_status.png"
              alt="Achievements"
              className="card-img"
            />
            <h2>Track Your Tasks and Goals📝</h2>
            <p>
              Stay accountable by tracking and managing your Tasks, Daily goals,
              and To-do list with ZenGarden's workspace.
            </p>
          </motion.div>
          <motion.div className="card" whileHover={{ scale: 1.05 }}>
            <img
              src="/images/grow plants.png"
              alt="Grow Plants"
              className="card-img"
            />
            <h2>Nurture Your Plants and Garden🌱</h2>
            <p>
              Pick your favorite plants and watch them flourish as you complete
              daily tasks. Build a thriving virtual garden that reflects your
              progress and dedication.
            </p>
          </motion.div>
          <motion.div className="card" whileHover={{ scale: 1.05 }}>
            <img src="/images/relax.png" alt="Relax" className="card-img" />
            <h2>Relax🌿</h2>
            <p>
              Take a moment to unwind with calming visuals and a tranquil
              atmosphere. ZenGarden offers a stress-free escape to recharge your
              mind and soul.
            </p>
          </motion.div>
        </div>
      </div>

      {/* Phần Benefits of using ZenGarden */}
      <div className="section benefits-section">
        <motion.div
          className="gamify-content"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <h1>ZenGarden help Farmers improve</h1>
        </motion.div>
        <div className="cards">
          <motion.div className="card" whileHover={{ scale: 1.05 }}>
            <img
              src="/images/tasks.png"
              alt="Achievements"
              className="card-img"
            />
            <h2>Boost Your Productivity 🚀</h2>
            <p>
              Transform your daily tasks into fun challenges. ZenGarden helps
              you stay focused and get more done with a rewarding system.
            </p>
          </motion.div>
          <motion.div className="card" whileHover={{ scale: 1.05 }}>
            <img
              src="/images/grow plants.png"
              alt="Grow Plants"
              className="card-img"
            />
            <h2>Nurture Your Mind 🌼</h2>
            <p>
              Grow virtual plants as you build healthy habits. A calm mind
              blooms alongside your thriving garden.
            </p>
          </motion.div>
          <motion.div className="card" whileHover={{ scale: 1.05 }}>
            <img src="/images/relax.png" alt="Relax" className="card-img" />
            <h2>Find Your Zen 🌟</h2>
            <p>
              Unwind with a serene interface designed to reduce stress and bring
              peace to your busy day.
            </p>
          </motion.div>
        </div>
      </div>
    </div>
  );
}
