import axios from "axios";

const CreateApi = async (
  content,
  nav,
  submitRef,
  onClose,
  memoizedDispatch,
  targetId,
  setTargetId
) => {
  const apiUrl = import.meta.env.VITE_API_URL_URL_CREATE;
  const url = `${apiUrl}`;
  const accessToken = import.meta.env.VITE_API_REACT_APP_API_KEY;
  console.log(accessToken);
  if (content === "") {
    submitRef.current.focus();
    return;
  }

  const data = {
    team_name: content,
    nick_name: "",
  };

  console.log("content 값 확인:", content);
  console.log("데이터 객체:", JSON.stringify(data, null, 2));

  try {
    const response = await axios.post(url, data, {
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${accessToken.trim()}`,
      },
    });
    console.log("팀 생성 성공:", response.data);
    console.log("팀 생성 id", response.data.team_id);

    // setOwner((prev) => !prev);
    // if (join) {
    //   setJoin((prev) => !prev);
    // }

    const newTeagetId = response.data.team_id;
    if (typeof setTargetId === "function") {
      setTargetId(newTeagetId);
      console.log(targetId);
    } else {
      alert("팀 생성 오류");
    }

    const TeamId = `create-${response.data.team_id}`;
    const TeamUrl = response.data.invite_link;
    console.log("sadfasdf" + TeamId);
    console.log("dafs", TeamUrl);
    const newTeam = {
      id: TeamId,
      content: String(content),
      isPlus: false,
      TeamUrl: TeamUrl,
    };

    if (memoizedDispatch) {
      if (typeof memoizedDispatch === "function") {
        // memoizedDispatch가 Redux 스타일 함수인 경우
        memoizedDispatch({ type: "ADD_TEAM", payload: newTeam });
      } else if (memoizedDispatch.onCreateone) {
        // memoizedDispatch가 객체이고 onCreateone 메서드가 있는 경우
        try {
          memoizedDispatch.onCreateone(newTeam.content);
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
      JSON.stringify([...validStoredTeams, newTeam])
    );

    if (TeamUrl) {
      nav("/", {
        state: {
          content: String(content),
          TeamId,
          targetId: newTeagetId,
          TeamUrl,
        },
      });
      console.log(TeamId);
    } else {
      console.log("TeamUrl이 undefined입니다");
      nav("/", {
        state: {
          content: String(content),
          TeamId,
          targetId: newTeagetId,
        },
      });
    }
    onClose();
  } catch (error) {
    console.error("팀 생성 실패:", error);
  }
  // finally {
  //   setIsLoading(false);
  // }
};

export default CreateApi;
