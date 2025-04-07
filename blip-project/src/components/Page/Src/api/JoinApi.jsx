import axios from "axios";

const JoinApi = async (JoinUrl, targetId, setTargetId, content) => {
  const apiUrl = import.meta.env.VITE_API_URL_URL_JOIN;
  const accessToken = import.meta.env.VITE_API_REACT_APP_API_KEY;

  const data = {
    invite_link: JoinUrl,
  };
  console.log("JoinUrl", JoinUrl);
  try {
    const response = await axios.post(apiUrl, data, {
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${accessToken}`,
      },
    });
    console.log("팀 가입 성공", response.data);

    const newTeamId = response.data.team_id;
    if (typeof setTargetId === "function") {
      setTargetId(newTeamId);
      console.log("newTeamId", targetId);
    } else {
      alert("팀 참가 오류");
    }

    const TeamJoinId = `Join-${response.data.team_id}`;
    console.log("TeamjoinId", TeamJoinId);

    const newTeamJoin = {
      id: TeamJoinId,
      content: String(content),
      isPlus: false,
    };
  } catch (error) {
    console.log("팀 가입 실패", error);
    alert("팀 참가에 실패했습니다. 다시 시도해주세요.");
  }
};

export default JoinApi;
