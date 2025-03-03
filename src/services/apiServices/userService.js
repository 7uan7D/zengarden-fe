import axios from "../customizeAxios";

export async function GetUserInfo(id) {
  const response = await axios.get(`/User/Get?id=${id}`, ngrokSkipWarning);
  return response.data;
}
