import axios from "axios";

const instance = axios.create({
  baseURL: "https://zengarden-be-fdre.onrender.com/api/",
});

export default instance;
