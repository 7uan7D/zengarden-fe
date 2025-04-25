import axios from "../customizeAxios";

export async function Checkin() {
  const token = localStorage.getItem("token");
  const response = await axios.post(
    `/UserXPLogs/claim-daily-xp`,
    {}, // Không có body nên truyền object rỗng
    {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }
  );
  return response.data;
}

export async function GetCheckinHistory(month, year) {
  const token = localStorage.getItem("token");
  if (!token) throw new Error("Token not found");

  const response = await axios.get(`/UserXPLogs/checkin-history`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
    params: {
      month,
      year,
    },
  });

  return response.data;
}
