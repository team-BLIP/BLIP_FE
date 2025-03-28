import axios from "axios";

const JoinApi = async (TeamId) => {
  const apiUrl = import.meta.env.VITE_API_URL_URL_JOIN;
  const url = `${apiUrl}/data`;
  const accessToken = "토큰 값";

  const data = {
    meetingId: TeamId,
    // userId: "Long",
  };
  try {
    const response = await axios.post(url, data, {
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${accessToken}`,
      },
    });
    console.log("팀 가입 성공", response.data);
    return response.data;
  } catch (error) {
    console.log("팀 가입 실패", error);
    alert("팀 참가에 실패했습니다. 다시 시도해주세요.");
  }
};

export default JoinApi;
