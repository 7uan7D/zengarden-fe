import axios from "axios";

const instance = axios.create({
  baseURL: "https://zengarden-be.onrender.com/api/",
});

export default instance;
