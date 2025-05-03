import axios from "../customizeAxios";

export async function GetAllTransaction() {
  const response = await axios.get("/Transactions");
  return response.data;
}
