import axios from "../customizeAxios";

export async function SuggestTaskFocusMethods(taskData) {
  const response = await axios.post(`/FocusMethods/suggest`, taskData);
  return response.data;
}
