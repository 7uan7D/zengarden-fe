import axios from "../customizeAxios";

export async function GetAllPackages() {
  const response = await axios.get("/Package");
  return response.data;
}

export async function GetPackageById(packageId) {
  const response = await axios.get(`/Package/${packageId}`);
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

export async function CreatePackage(packageData) {
  const token = localStorage.getItem("token");

  const response = await axios.post(
    `/Package/create-package`,
    { ...packageData },
    {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }
  );

  return response.data;
}

export async function UpdatePackageById(packageId, packageData) {
  const token = localStorage.getItem("token");

  const response = await axios.put(
    `/Package/update-package/${packageId}`,
    { ...packageData },
    {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }
  );

  return response.data;
}

export async function DeletePackageById(packageId) {
  const token = localStorage.getItem("token");

  const response = await axios.delete(`/Package/${packageId}`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  return response.data;
}