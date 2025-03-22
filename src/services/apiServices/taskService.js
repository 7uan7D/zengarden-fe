import axios from "../customizeAxios";

export async function GetAllTasks() {
    const response = await axios.get(`/Task`);
    return response.data;
}

export async function GetTaskById(id) {
    const response = await axios.get(`/Task/${id}`);
    return response.data;
}