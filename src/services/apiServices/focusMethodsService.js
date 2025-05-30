import axios from "../customizeAxios";

export async function SuggestTaskFocusMethods(taskData) {
  const response = await axios.post(`/FocusMethods/suggest`, taskData);
  return response.data;
}

export async function GetAllFocusMethods() {
  const response = await axios.get(`/FocusMethods`);
  return response.data;
}
