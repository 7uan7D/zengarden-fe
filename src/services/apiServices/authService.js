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
