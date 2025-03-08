import axios from "../customizeAxios";

export async function GetUserInfo(userId) {
  const response = await axios.get(`/User/${userId}`);
  return response.data;
}

export async function UpdateUserInfo(userData) {
  const response = await axios.post(`/User/update-user`, userData);
  return response.data;
}
