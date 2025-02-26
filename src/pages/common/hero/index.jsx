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
import Header from "../../../components/header/index.jsx";

export default function HeroPage() {
  return (
    <div className="main-container">
      <Header />
      <div className="pt-[80px] hero">
        <h1>Welcome to ZenGarden</h1>
        <p>Grow your plants and do tasks every day!</p>

        <Drawer>
          <DrawerTrigger asChild>
            <motion.button
              className="btn"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.5 }}
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
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="example@email.com"
                />

                <Label htmlFor="phone">Phone</Label>
                <Input
                  id="phone"
                  type="tel"
                  placeholder="Enter your phone number"
                />

                <Label htmlFor="password">Password</Label>
                <Input id="password" type="password" placeholder="••••••••" />

                <Label htmlFor="confirmPassword">Confirm Password</Label>
                <Input
                  id="confirmPassword"
                  type="password"
                  placeholder="••••••••"
                />
              </div>
              <DrawerFooter className="mt-4">
                <Button>Sign Up</Button>
                <DrawerClose asChild>
                  <Button variant="outline">Cancel</Button>
                </DrawerClose>
              </DrawerFooter>
            </div>
          </DrawerContent>
        </Drawer>
      </div>

      <div className="cards">
        <motion.div className="card" whileHover={{ scale: 1.05 }}>
          <h2>📝</h2>
          <h2>Doing Tasks</h2>
          <img
            src="/src/assets/images/tasks.png"
            alt="Achievements"
            className="card-img"
          />
          <p>Do the task and unlock tons of exciting milestones.</p>
        </motion.div>
        <motion.div className="card" whileHover={{ scale: 1.05 }}>
          <h2>🌱</h2>
          <h2>Grow Plants</h2>
          <img
            src="/src/assets/images/grow plants.png"
            alt="Grow Plants"
            className="card-img"
          />
          <p>Choose a plant and start nurturing your garden.</p>
        </motion.div>
        <motion.div className="card" whileHover={{ scale: 1.05 }}>
          <h2>🌿</h2>
          <h2>Relax</h2>
          <img
            src="/src/assets/images/relax.png"
            alt="Relax"
            className="card-img"
          />
          <p>Enjoy a peaceful experience with a soothing interface.</p>
        </motion.div>
      </div>
    </div>
  );
}
