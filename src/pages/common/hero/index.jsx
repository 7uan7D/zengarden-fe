import { motion } from "framer-motion";
import { BadgeCheck } from "lucide-react";
import {
  Sheet,
  SheetClose,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
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

export default function HeroPage() {
  return (
    <div className="main-container">
      <img
        src="/src/assets/logo/zengarden-logo.png"
        alt="ZenGarden Logo"
        className="logo"
      />

      <Sheet>
        <SheetTrigger asChild>
          <motion.div
            className="farmer-badge"
            whileHover={{ scale: 1.1, rotate: 2 }}
            whileTap={{ scale: 0.95 }}
          >
            <BadgeCheck className="icon" />
            <span>Farmer Verified</span>
          </motion.div>
        </SheetTrigger>
        <SheetContent>
          <SheetHeader>
            <SheetTitle>Login</SheetTitle>
            <SheetDescription>
              Sign in to manage your ZenGarden.
            </SheetDescription>
          </SheetHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="email" className="text-right">
                Email
              </Label>
              <Input
                id="email"
                type="email"
                placeholder="example@email.com"
                className="col-span-3"
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="password" className="text-right">
                Password
              </Label>
              <Input
                id="password"
                type="password"
                placeholder="••••••••"
                className="col-span-3"
              />
            </div>
          </div>
          <SheetFooter>
            <SheetClose asChild>
              <Button type="submit">Login</Button>
            </SheetClose>
          </SheetFooter>
        </SheetContent>
      </Sheet>

      <div className="hero">
        <h1>Welcome to ZenGarden</h1>
        <p>Grow your plants and do tasks every day!</p>

        <Drawer>
          <DrawerTrigger asChild>
            <motion.button
              className="btn"
              whileHover={{ scale: 1.25 }}
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
                <Label htmlFor="username">Username</Label>
                <Input id="username" placeholder="Enter your username" />

                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="example@email.com"
                />

                <Label htmlFor="password">Password</Label>
                <Input id="password" type="password" placeholder="••••••••" />
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
