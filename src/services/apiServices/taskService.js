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

export async function UpdateTaskById(taskId, taskData) {
  const formData = new FormData();

  // Lưu ý phải dùng đúng key với API (ví dụ: 'TaskName', không phải 'taskName')
  formData.append("TotalDuration", taskData.TotalDuration?.toString() || "0");
  formData.append("StartDate", taskData.StartDate);
  formData.append("EndDate", taskData.EndDate);
  formData.append("TaskTypeId", taskData.TaskTypeId?.toString() || "1");

  // Nếu bạn có file:
  // formData.append('TaskFile', taskData.TaskFile);

  const response = await axios.patch(`/Task/Update-Task/${taskId}`, formData, {
    headers: {
      "Content-Type": "multipart/form-data",
    },
  });

  return response.data;
}

export async function DeleteTaskById(taskId) {
  const response = await axios.delete(`/Task/${taskId}`);
  return response.data;
}

export async function StartTask(taskId) {
  const token = localStorage.getItem("token");

  const response = await axios.post(`/Task/start-task/${taskId}`, null, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  return response.data;
}

export async function PauseTask(taskId) {
  const response = await axios.post(`/Task/pause/${taskId}`);
  return response.data;
}

export async function CompleteTask(taskId, userTreeId) {
  const response = await axios.post(`/Task/complete-task/${taskId}`, {
    userTreeId: userTreeId, // hoặc userTreeId nếu bạn có sẵn giá trị
  });
  return response.data;
}

export async function ChangePriority(userTreeId, reorderedTasks) {
  const response = await axios.post(
    `/Task/reorder/${userTreeId}`,
    reorderedTasks,
    {
      headers: {
        "Content-Type": "application/json",
      },
    }
  );
  return response.data;
}

export async function ChangeTaskType(taskId, newTaskTypeId) {
  const token = localStorage.getItem("token");

  const response = await axios.put(
    `/Task/${taskId}/task-type`,
    { newTaskTypeId: newTaskTypeId },
    {
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
    }
  );

  return response.data;
}

export async function UpdateOverdueTasks() {
  const response = await axios.post(`/Task/update-overdue`);
  return response.data;
}

export async function ResetWeeklyPriorities() {
  const response = await axios.post(`/Task/reset-weekly-priorities`);
  return response.data;
}

export async function ResetDailyStatus() {
  const response = await axios.post(`/Task/reset-daily-status`);
  return response.data;
}

export async function AutoPauseTasks() {
  const response = await axios.post(`/Task/auto-pause`);
  return response.data;
}

export async function UpdateTaskDurationById(taskId, totalDuration) {
  const response = await axios.patch(`/Task/${taskId}/duration`, {
    totalDuration: totalDuration,
  });
  return response.data;
}
