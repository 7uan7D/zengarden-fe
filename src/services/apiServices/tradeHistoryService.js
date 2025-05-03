import axios from "../customizeAxios";

export async function GetAllTradeHistory() {
  const response = await axios.get("/TradeHistories");
  return response.data;
}