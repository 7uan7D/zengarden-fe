import axios from "../customizeAxios";

export async function GetAllChallenges() {
    const response = await axios.get(`/Challenges/get-all`);
    return response.data;
}

export async function GetChallengeById(challengeId) {
    const response = await axios.get(`/Challenges/get-by-id/${challengeId}`);
    return response.data;
}