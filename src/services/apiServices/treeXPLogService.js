import axios from "../customizeAxios";

export async function GetAllTreeXPLogs() {
    const response = await axios.get("/TreeXpLogs");
    return response.data;
}

export async function GetTreeXPLogById(id) {
    const response = await axios.get(`/TreeXpLogs/${id}`);
    return response.data;
}

export async function CreateTreeXPLog(data) {
    const response = await axios.post("/TreeXpLogs", data);
    return response.data;
}

export async function UpdateTreeXPLog(id, data) {
    const response = await axios.put(`/TreeXpLogs/${id}`, data);
    return response.data;
}

export async function DeleteTreeXPLog(id) {
    const response = await axios.delete(`/TreeXpLogs/${id}`);
    return response.data;
}