import axios from "../customizeAxios";

export async function GetUserConfigByUserId(id) {
  const response = await axios.get(`/UserConfigs/${id}`);
  return response.data;
}
