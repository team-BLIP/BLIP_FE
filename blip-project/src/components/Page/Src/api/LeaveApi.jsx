import axios from "axios";

const LeaveApi = async (TeamId) => {
  const apiurl = import.meta.env.VITE_API_URL_URL_MEETINGS_LEAVE;
  const url = `${apiurl}/data`;
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
    console.log("팀 삭제 성공", response.data);
    return response.data;
  } catch (error) {
    console.log("팀 삭제 실패", error);
    alert("팀 삭제에 실패했습니다. 다시 시도해주세요요");
  }
};

export default LeaveApi;
