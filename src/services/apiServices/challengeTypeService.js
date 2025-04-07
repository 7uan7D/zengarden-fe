import axios from "../customizeAxios";

export async function GetAllChallengeTypes() {
    const response = await axios.get(`/ChallengeTypes`);
    return response.data;
}

export async function GetChallengeTypeById(challengeTypeId) {
    const response = await axios.get(`/ChallengeTypes/${challengeTypeId}`);
    return response.data;
}