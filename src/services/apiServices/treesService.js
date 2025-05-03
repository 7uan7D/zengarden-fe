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

export async function GetTradeByStatus(status) {
  const response = await axios.get(`/TradeTree/history/by-status/${status}`);
  return response.data;
}

export async function AcceptTrade({ tradeId, userId, userTreeId }) {
  try {
    const response = await axios.put("/TradeTree/accept", null, {
      params: {
        tradeId,
        userId,
        userTreeId,
      },
    });
    return response.data;
  } catch (error) {
    console.error("Failed to accept trade:", error);
    throw error;
  }
}
