import axios from "axios";

const CreateApi = async (
  content,
  nav,
  submitRef,
  onClose,
  memoizedDispatch,
  targetId,
  setTargetId,
  parentOnClose
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
    console.log("afsdgg", response.data.role);

    // setOwner((prev) => !prev);
    // if (join) {
    //   setJoin((prev) => !prev);
    // }

    const newTeamId = response.data.team_id;
    if (typeof setTargetId === "function") {
      setTargetId(newTeamId);
      console.log(targetId);
    } else {
      alert("팀 생성 오류");
    }

    const createTeamId = `create-${response.data.team_id}`;
    const createTeamUrl = response.data.invite_link;
    console.log("sadfasdf" + createTeamId);
    console.log("dafs", createTeamUrl);
    const newTeam = {
      id: createTeamId,
      _orginalId: newTeamId,
      content: String(content),
      isPlus: false,
      createTeamUrl: createTeamUrl,
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

    //로컬 스토리지에 저장
    const storedTeams = JSON.parse(localStorage.getItem("teams") || "[]");
    const validStoredTeams = Array.isArray(storedTeams) ? storedTeams : [];

    //기존 팀 ID 검사로 팀 중복 방지
    const existingTeamIndex = validStoredTeams.findIndex(
      (team) => team.id === createTeamId || team._orginalId === newTeamId
    );

    let updatedTeams;
    if (existingTeamIndex >= 0) {
      updatedTeams = [...validStoredTeams];
      updatedTeams[existingTeamIndex] = newTeam;
    } else {
      updatedTeams = [...validStoredTeams, newTeam];
    }

    localStorage.setItem(
      "teams",
      JSON.stringify([...validStoredTeams, newTeam])
    );

    if (createTeamUrl) {
      nav("/", {
        state: {
          content: String(content),
          createTeamId,
          targetId: newTeamId,
          createTeamUrl,
        },
      });
      console.log(createTeamUrl);
    } else {
      console.log("createTeamUrl이 undefined입니다");
      nav("/", {
        state: {
          content: String(content),
          createTeamId,
          targetId: newTeamId,
        },
      });
    }
    onClose();
    if (parentOnClose) parentOnClose();
  } catch (error) {
    console.error("팀 생성 실패:", error);
  }
  // finally {
  //   setIsLoading(false);
  // }
};

export default CreateApi;
