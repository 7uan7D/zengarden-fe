import axios from "../customizeAxios";

export async function GetAllTaskTypes() {
    const response = await axios.get(`/TaskTypes`);
    return response.data;
}

export async function GetTaskTypeById(id) {
    const response = await axios.get(`/TaskTypes/${id}`);
    return response.data;
}

export async function CreateTaskType(taskType) {
    const response = await axios.post(`/TaskTypes`, taskType);
    return response.data;
}

export async function UpdateTaskType(taskType) {
    const response = await axios.put(`/TaskTypes/${taskType.id}`, taskType);
    return response.data;
}

export async function DeleteTaskTypeById(id) {
    const response = await axios.delete(`/TaskTypes/${id}`);
    return response.data;
}