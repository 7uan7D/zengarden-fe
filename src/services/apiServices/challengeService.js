import axios from "../customizeAxios";

export async function GetAllChallenges() {
    const response = await axios.get(`/Challenges/get-all`);
    return response.data;
}

export async function GetChallengeById(challengeId) {
    const response = await axios.get(`/Challenges/get-by-id/${challengeId}`);
    return response.data;
}

export async function CreateChallenge(challenge) {
    const token = localStorage.getItem("token");
    const response = await axios.post(
        `/Challenges/create-challenge`, 
        challenge, 
        {
            headers: {
                Authorization: `Bearer ${token}`,
        },
    });
    return response.data;
}

export async function CreateTaskByChallengeId(challengeId, task) {
    const token = localStorage.getItem("token");
    const response = await axios.post(
        `/Challenges/tasks/${challengeId}/`, 
        task, 
        {
            headers: {
                Authorization: `Bearer ${token}`,
            },
        }
    );
    return response.data;
}

export async function JoinChallengeById(challengeId, userTreeId) {
    const token = localStorage.getItem("token");
    const response = await axios.post(
        `/Challenges/join/${challengeId}`,
        userTreeId,
        {
            headers: {
                Authorization: `Bearer ${token}`,
            },
        }
    );
    return response.data;
}

export async function LeaveChallengeById(challengeId) {
    const token = localStorage.getItem("token");
    const response = await axios.put(
        `/Challenges/leave/${challengeId}`,
        {},
        {
            headers: {
                Authorization: `Bearer ${token}`,
            },
        }
    );
    return response.data;
}

export async function GetRankingByChallengeId(challengeId) {
    const token = localStorage.getItem("token");
    const response = await axios.get(
        `/Challenges/${challengeId}/ranking`,
        {
            headers: {
                Authorization: `Bearer ${token}`,
            },
        }
    );
    return response.data;
}

export async function GetProgressByChallengeId(challengeId) {
    const token = localStorage.getItem("token");
    const response = await axios.get(
        `/Challenges/progress/${challengeId}`,
        {
            headers: {
                Authorization: `Bearer ${token}`,
            },
        }
    );
    return response.data;
}   

export async function ActiveChallengeById(challengeId) {
    const token = localStorage.getItem("token");
    const response = await axios.put(
        `/Challenges/change-status/${challengeId}`,
        {},
        {
            headers: {
                Authorization: `Bearer ${token}`,
            },
        }
    );
    return response.data;
}

export async function CancelChallengeById(challengeId) {
    const token = localStorage.getItem("token");
    const response = await axios.put(
        `/Challenges/cancel/${challengeId}`,
        {},
        {
            headers: {
                Authorization: `Bearer ${token}`,
            },
        }
    );
    return response.data;
}

export async function UpdateChallengeById(challengeId, challenge) {
    const token = localStorage.getItem("token");
    const response = await axios.patch(
        `/Challenges/update-challenge?challengeId=${challengeId}`,
        challenge,
        {
            headers: {
                Authorization: `Bearer ${token}`,
            },
        }
    );
    return response.data;
}