import axios from "axios";

const JoinApi = async (
  JoinUrl,
  targetId,
  setTargetId,
  content,
  memoizedDispatch,
  createTeamUrl,
  nav
) => {
  const apiUrl = import.meta.env.VITE_API_URL_URL_CREATE_JOIN;
  const accessToken = import.meta.env.VITE_API_URL_URL_KEY;

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
      createTeamUrl: createTeamUrl,
    };

    if (memoizedDispatch) {
      if (typeof memoizedDispatch === "function") {
        // memoizedDispatch가 Redux 스타일 함수인 경우
        memoizedDispatch({ type: "ADD_TEAM", payload: newTeamJoin });
      } else if (memoizedDispatch.onCreateone) {
        // memoizedDispatch가 객체이고 onCreateone 메서드가 있는 경우
        try {
          memoizedDispatch.onCreateone(newTeamJoin.content);
        } catch (error) {
          console.error("onCreateone 호출 오류:", error);
        }
      } else {
        console.error("memoizedDispatch 객체에 onCreateone 메서드가 없습니다");
      }
    } else {
      console.error("memoizedDispatch가 유효하지 않습니다:", memoizedDispatch);
    }

    const storedTeams = JSON.parse(localStorage.getItem("teams") || "[]");
    const validStoredTeams = Array.isArray(storedTeams) ? storedTeams : [];
    localStorage.setItem(
      "teams",
      JSON.stringify([...validStoredTeams, newTeamJoin])
    );

    if (createTeamUrl) {
      nav("/mainPage", {
        state: {
          content: String(content),
          TeamJoinId,
          targetId: TeamJoinId,
        },
      });
    }
  } catch (error) {
    console.log("팀 가입 실패", error);
    alert("팀 참가에 실패했습니다. 다시 시도해주세요.");
  }
};

export default JoinApi;
