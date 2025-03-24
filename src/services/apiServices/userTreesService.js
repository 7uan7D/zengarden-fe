import axios from "../customizeAxios";

export async function GetUserTreeByUserId(userId) {
  const response = await axios.get(`/UserTrees/GetUserTree-ByUserId/${userId}`);
  return response.data;
}
export async function CreateUserTree(userId, name) {
  const response = await axios.post(`/UserTrees`, {
    userId,
    name,
  });
  return response.data;
}
