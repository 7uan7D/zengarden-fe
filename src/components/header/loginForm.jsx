import { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
  SheetFooter,
} from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { toast } from "sonner";
import { motion, AnimatePresence } from "framer-motion";
import {
  InputOTP,
  InputOTPGroup,
  InputOTPSlot,
} from "@/components/ui/input-otp";
import RegisterButton from "@/pages/common/hero/registerButton";
import {
  LoginService,
  ForgotPassword,
  ResetPassword,
} from "@/services/apiServices/authService";
import parseJwt from "@/services/parseJwt";

const LoginForm = ({ setIsLoggedIn, setIsSheetOpen }) => {
  const [credentials, setCredentials] = useState({
    email: "",
    phone: "",
    password: "",
  });
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [usePhone, setUsePhone] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const [step, setStep] = useState("login");
  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const navigate = useNavigate();

  const stepConfig = {
    login: { title: "Login", description: "Sign in to manage your ZenGarden." },
    forgot: {
      title: "Forgot Password",
      description: "Enter your email to reset password.",
    },
    otp: {
      title: "Enter OTP",
      description: "Enter the OTP sent to your email.",
    },
    "new-password": {
      title: "New Password",
      description: "Enter your new password.",
    },
  };

  const stepVariants = {
    initial: { opacity: 0, x: 50 },
    animate: { opacity: 1, x: 0, transition: { duration: 0.3 } },
    exit: { opacity: 0, x: -50, transition: { duration: 0.2 } },
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    setError("");
    setIsLoading(true);
    try {
      const payload = { password: credentials.password };
      if (usePhone) payload.phone = credentials.phone;
      else payload.email = credentials.email;

      const data = await LoginService(payload);
      const token = data.token;

      localStorage.setItem("token", token);
      localStorage.setItem("refreshToken", data.refreshToken);
      setIsLoggedIn(true);

      // Decode token để lấy role
      const decoded = parseJwt(token);
      const role = decoded?.role;

      toast.success("Login Successfully!");
      setIsSheetOpen(false);

      // Điều hướng theo role
      if (role === "Admin") {
        navigate("/users");
      } else if (role === "Moderator") {
        navigate("/challenges-moderate");
      } else if (role === "Player") {
        navigate("/home");
      } else {
        navigate("/home"); // fallback
      }

      window.location.reload(); // reload lại để cập nhật state
    } catch (err) {
      setError("Please check the information again!");
      toast.error("Login failed!");
    } finally {
      setIsLoading(false);
    }
  };

  const handleForgotPassword = async () => {
    if (!email) return toast.error("Please enter your email!");
    try {
      await ForgotPassword(email);
      toast.success("OTP has been sent to your email.");
      setStep("otp");
    } catch (error) {
      toast.error(
        error.response?.data?.message || "Failed to send OTP. Try again!"
      );
    }
  };

  const handleVerifyOTP = async () => {
    if (!otp) return toast.error("Please enter OTP!");
    try {
      toast.success("OTP verified!");
      setStep("new-password");
    } catch (error) {
      toast.error(error.response?.data?.message || "Invalid OTP. Try again!");
    }
  };

  const handleResetPassword = async () => {
    if (!newPassword) return toast.error("Please enter a new password!");
    if (!otp) return toast.error("Please enter OTP!");
    try {
      await ResetPassword(email, otp, newPassword);
      toast.success("Password reset successful. Please login.");
      setStep("login");
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to reset password!");
    }
  };

  return (
    <SheetContent>
      <SheetHeader>
        <SheetTitle>{stepConfig[step]?.title}</SheetTitle>
        <SheetDescription>{stepConfig[step]?.description}</SheetDescription>
      </SheetHeader>
      <AnimatePresence mode="wait">
        {step === "login" && (
          <motion.div
            key="login"
            variants={stepVariants}
            initial="initial"
            animate="animate"
            exit="exit"
          >
            <form onSubmit={handleLogin}>
              <div className="flex items-center justify-between py-2">
                <span>Use Phone Number</span>
                <Switch checked={usePhone} onCheckedChange={setUsePhone} />
              </div>
              <div className="grid gap-4 py-4">
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label
                    htmlFor={usePhone ? "phone" : "email"}
                    className="text-right"
                  >
                    {usePhone ? "Phone Number" : "Email"}
                  </Label>
                  <Input
                    id={usePhone ? "phone" : "email"}
                    type={usePhone ? "tel" : "email"}
                    placeholder={usePhone ? "0123456789" : "example@email.com"}
                    className="col-span-3"
                    value={usePhone ? credentials.phone : credentials.email}
                    onChange={(e) =>
                      setCredentials({
                        ...credentials,
                        [usePhone ? "phone" : "email"]: e.target.value,
                      })
                    }
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
                    value={credentials.password}
                    onChange={(e) =>
                      setCredentials({
                        ...credentials,
                        password: e.target.value,
                      })
                    }
                  />
                </div>
              </div>
              {error && <p className="text-red-500 text-sm">{error}</p>}
              <SheetFooter>
                <Button type="submit" disabled={isLoading}>
                  {isLoading ? (
                    <div className="flex items-center gap-2">
                      <span className="animate-spin w-4 h-4 border-2 border-t-transparent border-white rounded-full" />
                      Loading...
                    </div>
                  ) : (
                    "Login"
                  )}
                </Button>
              </SheetFooter>
              <div className="flex justify-end mt-2">
                <span
                  className="text-sm text-green-600 cursor-pointer"
                  onClick={() => setStep("forgot")}
                >
                  Forgot Password?
                </span>
              </div>
              <div className="mt-4 text-left text-sm text-gray-500">
                <RegisterButton isOpen={isOpen} setIsOpen={setIsOpen} />
              </div>
            </form>
          </motion.div>
        )}
        {step === "forgot" && (
          <motion.div
            key="forgot"
            variants={stepVariants}
            initial="initial"
            animate="animate"
            exit="exit"
          >
            <div className="grid gap-4">
              <Label>Email</Label>
              <Input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
              <SheetFooter>
                <Button onClick={handleForgotPassword} disabled={isLoading}>
                  Send OTP
                </Button>
                <Button variant="outline" onClick={() => setStep("login")}>
                  Back to Login
                </Button>
              </SheetFooter>
            </div>
          </motion.div>
        )}
        {step === "otp" && (
          <motion.div
            key="otp"
            variants={stepVariants}
            initial="initial"
            animate="animate"
            exit="exit"
          >
            <div className="grid gap-4">
              <Label>OTP</Label>
              <InputOTP
                maxLength={6}
                value={otp}
                onChange={setOtp}
                autoFocus
                className="flex justify-center gap-2"
              >
                <InputOTPGroup>
                  {[...Array(6)].map((_, i) => (
                    <InputOTPSlot key={i} index={i} />
                  ))}
                </InputOTPGroup>
              </InputOTP>
              <SheetFooter>
                <Button onClick={handleVerifyOTP} disabled={isLoading}>
                  Verify OTP
                </Button>
              </SheetFooter>
            </div>
          </motion.div>
        )}
        {step === "new-password" && (
          <motion.div
            key="new-password"
            variants={stepVariants}
            initial="initial"
            animate="animate"
            exit="exit"
          >
            <div className="grid gap-4">
              <Label>New Password</Label>
              <Input
                type="password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
              />
              <SheetFooter>
                <Button onClick={handleResetPassword} disabled={isLoading}>
                  Reset Password
                </Button>
              </SheetFooter>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </SheetContent>
  );
};

export default LoginForm;
