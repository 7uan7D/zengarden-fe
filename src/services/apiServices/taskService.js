import axios from "../customizeAxios";

export async function GetAllTasks() {
  const response = await axios.get(`/Task`);
  return response.data;
}

export async function GetTaskById(taskId) {
  const response = await axios.get(`/Task/by-id/${taskId}`);
  return response.data;
}

export async function CreateTask(taskData) {
  const response = await axios.post(`/Task/create-task`, taskData);
  return response.data;
}

export async function GetTaskByUserId(userId) {
  const response = await axios.get(`/Task/by-user-id/${userId}`);
  return response.data;
}

export async function GetTaskByUserTreeId(userTreeId) {
  const response = await axios.get(`/Task/by-user-tree/${userTreeId}`);
  return response.data;
}

export async function DeleteTaskById(taskId) {
  const response = await axios.delete(`/Task/${taskId}`);
  return response.data;
}