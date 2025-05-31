import axios from "axios";

const instance = axios.create({
  baseURL:
    "https://zengarden-api-bmhbarbtcwc0dffg.southeastasia-01.azurewebsites.net/api/",
});

export default instance;
