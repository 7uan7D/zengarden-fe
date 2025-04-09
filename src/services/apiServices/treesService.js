import axios from "../customizeAxios";

export async function GetAllTrees() {
  const response = await axios.get("/trees");
  return response.data;
}

export async function TradeTree({
  requesterId,
  requesterTreeId,
  requestDesiredTreeId,
}) {
  const response = await axios.post("/TradeTree/trade", {
    requesterId,
    requesterTreeId,
    requestDesiredTreeId,
  });
  return response.data;
}
