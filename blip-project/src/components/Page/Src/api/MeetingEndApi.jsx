import axios from "axios";

const MeetingEndApi = async (TeamId) => {
  const apiUrl = import.meta.env.VITE_API_URL_URL_MEETINGS_END;
  const url = `${apiUrl}/data`;
  const accessToken = "토큰 값";

  const data = {
    meeting_id: TeamId,
    // leader_id: "Long",
  };

  try {
    const response = await axios.post(url, data, {
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${accessToken}`,
      },
    });
    console.log("회의 종료", response.data);
    return response.data;
  } catch (error) {
    console.log("회의가 아직 안끝났습니다.", error);
    alert("팀 회의가 아직 안끝났습니다. 다시 회의에 집중하세요!");
  }
};

export default MeetingEndApi;
