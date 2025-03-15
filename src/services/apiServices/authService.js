import axios from "../customizeAxios";

export async function LoginService(credentials) {
  const response = await axios.post(`/Auth/login`, credentials);
  return response.data;
}

export async function RegisterService(credentials) {
  const response = await axios.post(`/Auth/register`, credentials);
  return response.data;
}

export async function ChangePassword(credentials) {
  const token = localStorage.getItem("token");
  const response = await axios.post(`/Auth/change-password`, credentials, {
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
  });

  return response.data;
}
export async function ForgotPassword(email) {
  const response = await axios.post(`/Auth/forgot-password`, { email });
  return response.data;
}
export async function ResetPassword(email, otp, newPassword) {
  const response = await axios.post(`/Auth/reset-password`, {
    email,
    otp,
    newPassword,
  });
  return response.data;
}
