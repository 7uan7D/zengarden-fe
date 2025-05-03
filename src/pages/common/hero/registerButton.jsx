import { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerDescription,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle,
} from "@/components/ui/drawer";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RegisterService } from "@/services/apiServices/authService";
import { Toaster, toast } from "sonner";

const RegisterButton = ({ isOpen, setIsOpen }) => {
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
    <>
      <div className="mt-4 text-right text-sm text-gray-500">
        Don’t have a Zengarden account?{" "}
        <span
          className="text-green-600 cursor-pointer hover:underline"
          onClick={() => setIsOpen(true)}
        >
          Sign up
        </span>
        .
      </div>

      <Drawer open={isOpen} onOpenChange={setIsOpen}>
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
    </>
  );
};

export default RegisterButton;
