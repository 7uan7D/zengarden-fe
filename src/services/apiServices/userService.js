import axios from "../customizeAxios";

export async function GetAllUsers() {
  const response = await axios.get("/User");
  return response.data;
}

export async function GetUserInfo(userId) {
  const response = await axios.get(`/User/${userId}`);
  return response.data;
}

export async function UpdateUserInfo(userData) {
  const response = await axios.put(`/User/update-user`, userData);
  return response.data;
}

export async function DeleteUser(userId) {
  const response = await axios.delete(`/User/${userId}`);
  return response.data;
}