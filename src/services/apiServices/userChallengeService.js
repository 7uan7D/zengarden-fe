import axios from "../customizeAxios";

export async function GetAllUserChallenges() {
    const response = await axios.get(`/UserChallenges`);
    return response.data;
}

export async function GetUserChallengeById(userChallengeId) {
    const response = await axios.get(`/UserChallenges/${userChallengeId}`);
    return response.data;
}