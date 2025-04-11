import axios from "../customizeAxios";

export async function GetAllPackages() {
  const response = await axios.get("/Package");
  return response.data;
}

export async function PayPackage(userId, walletId, packageId) {
  try {
    const response = await axios.post("/Payment/create", {
      userId,
      walletId,
      packageId,
    });
    return response.data; // trả về kết quả để component xử lý
  } catch (error) {
    console.error("PayPackage error:", error);
    throw error;
  }
}
