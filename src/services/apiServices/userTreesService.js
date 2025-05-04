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

export async function GetUserTreeByOwnerId(ownerId) {
  const response = await axios.get(
    `/UserTrees/ListUserTree-ByOwner/${ownerId}`
  );
  return response.data;
}

export async function UpdateTreeHealth(userTreeId) {
  const response = await axios.post(
    `/UserTrees/test/update-tree-health/${userTreeId}`
  );
  return response.data;
}

export async function GetAllUserTrees() {
  const response = await axios.get(`/UserTrees`);
  return response.data;
}