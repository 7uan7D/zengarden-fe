import axios from "axios";

const instance = axios.create({
  baseURL: "https://localhost:7262/api/",
});

export default instance;
