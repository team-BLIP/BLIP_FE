import axios from "axios";

const MeetingEndApi = async (TeamId) => {
  const apiUrl = import.meta.env.VITE_API_URL_URL_MEETINGS_END;
  const accessToken = "import.meta.env.VITE_API_REACT_APP_API_KEY";

  const data = {
    meeting_id: TeamId,
  };

  try {
    const response = await axios.post(apiUrl, data, {
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
