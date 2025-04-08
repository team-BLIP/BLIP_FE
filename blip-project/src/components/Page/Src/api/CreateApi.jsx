import axios from "axios";

const CreateApi = async (
  content,
  nav,
  submitRef,
  onClose,
  memoizedDispatch,
  targetId,
  setTargetId,
  parentOnClose,
  addIdMappings // ID 매핑 함수 추가
) => {
  // 빈 내용 검사
  if (!content) {
    submitRef.current?.focus();
    return null;
  }

  const apiUrl = import.meta.env.VITE_API_URL_URL_CREATE;
  const accessToken = import.meta.env.VITE_API_REACT_APP_API_KEY;
  
  const data = {
    team_name: content,
    nick_name: "",
  };

  try {
    // API 호출
    const response = await axios.post(apiUrl, data, {
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${accessToken.trim()}`,
      },
    });

    const newTeamId = response.data.team_id;
    const createTeamId = `create-${newTeamId}`;
    const createTeamUrl = response.data.invite_link || null;
    
    // targetId 상태 업데이트
    if (typeof setTargetId === "function") {
      setTargetId(newTeamId);
    } else {
      console.error("setTargetId가 함수가 아닙니다");
      return null;
    }
    
    // ID 매핑 추가 (제공된 경우)
    if (typeof addIdMappings === "function") {
      // 다음 사용 가능한 클라이언트 ID를 찾거나 적절한 방식으로 결정
      const clientId = Date.now(); // 또는 다른 방법으로 생성
      addIdMappings(clientId, newTeamId);
    }

    // 새 팀 객체 생성
    const newTeam = {
      id: createTeamId,
      _orginalId: newTeamId,
      content: String(content),
      isPlus: false,
      createTeamUrl,
    };

    // 디스패치 처리 (조건에 따라)
    handleDispatch(memoizedDispatch, newTeam);
    
    // 로컬 스토리지 업데이트 - 중복 제거된 버전
    updateLocalStorage(createTeamId, newTeamId, newTeam);

    // 네비게이션 처리
    nav("/", {
      state: {
        content: String(content),
        createTeamId,
        targetId: newTeamId,
        createTeamUrl,
      },
    });

    // 모달 닫기
    onClose();
    if (parentOnClose) parentOnClose();
    
    return newTeamId;
  } catch (error) {
    console.error("팀 생성 실패:", error);
    return null;
  }
};

// 디스패치 처리 함수
function handleDispatch(memoizedDispatch, newTeam) {
  if (!memoizedDispatch) {
    console.error("memoizedDispatch가 제공되지 않았습니다");
    return;
  }

  if (typeof memoizedDispatch === "function") {
    memoizedDispatch({ type: "ADD_TEAM", payload: newTeam });
  } else if (memoizedDispatch.onCreateone) {
    try {
      memoizedDispatch.onCreateone(newTeam.content);
    } catch (error) {
      console.error("onCreateone 호출 오류:", error);
    }
  } else {
    console.error("지원되지 않는 memoizedDispatch 형식:", memoizedDispatch);
  }
}

// 로컬 스토리지 업데이트 함수
function updateLocalStorage(createTeamId, newTeamId, newTeam) {
  try {
    const storedTeams = JSON.parse(localStorage.getItem("teams") || "[]");
    const validStoredTeams = Array.isArray(storedTeams) ? storedTeams : [];

    // 기존 팀 ID 검사로 팀 중복 방지
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

    localStorage.setItem("teams", JSON.stringify(updatedTeams));
  } catch (error) {
    console.error("로컬 스토리지 업데이트 실패:", error);
  }
}

export default CreateApi;