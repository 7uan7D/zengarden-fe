import axios from "../customizeAxios";

export async function GetAllTrees() {
  const response = await axios.get("/trees");
  return response.data;
}
