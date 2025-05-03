import axios from "../customizeAxios";

export async function GetUserExperiencesInfo(userId) {
  const response = await axios.get(`/UserExperiences/${userId}`);
  return response.data;
}
