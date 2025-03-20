import axios from "../customizeAxios";

export async function GetUserTreeByUserId(userId) {
  const response = await axios.get(`/UserTrees/GetUserTree-ByUserId/${userId}`);
  return response.data;
}
