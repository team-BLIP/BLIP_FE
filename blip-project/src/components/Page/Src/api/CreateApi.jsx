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

  const apiUrl = import.meta.env.VITE_API_URL_URL_CREATE_TEAM;
  const accessToken = import.meta.env.VITE_API_URL_URL_KEY;

  const data = {
    team_name: content,
    nick_name: "",
  };

  try {
    // API 호출
    const response = await axios.post(apiUrl, data, {
      headers: {
        "Content-Type": "application/json",
        Authorization: accessToken ? `Bearer ${accessToken.trim()}` : "",
      },
    });

    const newTeamId = response.data.team_id;
    const createTeamId = `create-${newTeamId}`;
    const createTeamUrl = response.data.invite_link || null;
    console.log("새 팀 ID:", newTeamId);

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
      _originalId: newTeamId, // 철자 수정: _orginalId -> _originalId
      _orginalId: newTeamId, // 호환성을 위해 오타 버전도 유지
      content: content,
      team_name: content, // API 응답과 일치하도록 추가
      name: content, // UI와의 호환성을 위해 추가
      isPlus: false,
      createTeamUrl,
    };

    // 디스패치 처리 (조건에 따라)
    handleDispatch(memoizedDispatch, newTeam);

    // 로컬 스토리지 업데이트 - 중복 제거된 버전
    updateLocalStorage(createTeamId, newTeamId, newTeam); // newTeam 매개변수 추가

    // 네비게이션 처리
    nav("/", {
      state: {
        content: String(content),
        createTeamId,
        newTeamId,
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
    if (!createTeamId || !newTeamId) {
      console.error("필수 ID 값이 누락되었습니다:", {
        createTeamId,
        newTeamId,
      });
      return;
    }
    const removeCreatePrefix = (createTeamId) => {
      if (createTeamId.startsWith("create-")) {
        return createTeamId.substring("create-".length);
      }
    };
    const fixId = removeCreatePrefix(createTeamId);
    // newTeam이 없을 경우 기본 객체 생성
    if (!newTeam) {
      console.warn("newTeam 객체가 제공되지 않아 기본값 사용");
      newTeam = {
        id: fixId,
        _originalId: newTeamId,
        _orginalId: newTeamId,
        content: "새 팀",
        team_name: "새 팀",
        name: "새 팀",
        isPlus: false,
      };
    }

    // 로컬 스토리지에서 팀 데이터 가져오기
    let storedTeams;
    try {
      const teamsJSON = localStorage.getItem("teams");
      storedTeams = teamsJSON ? JSON.parse(teamsJSON) : [];
    } catch (parseError) {
      console.error("teams JSON 파싱 오류:", parseError);
      storedTeams = [];
    }

    // 배열 확인
    const validStoredTeams = Array.isArray(storedTeams) ? storedTeams : [];

    // 기존 팀 검색
    const existingTeamIndex = validStoredTeams.findIndex((team) => {
      if (!team) return false;
      const teamId = team.id || "";
      const originalId = team._originalId || team._orginalId || "";
      return teamId === createTeamId || originalId === newTeamId;
    });

    let updatedTeams;
    if (existingTeamIndex >= 0) {
      // 기존 팀 업데이트
      updatedTeams = [...validStoredTeams];
      updatedTeams[existingTeamIndex] = {
        ...updatedTeams[existingTeamIndex],
        ...newTeam,
      };
    } else {
      // 새 팀 추가
      updatedTeams = [...validStoredTeams, newTeam];
    }

    // 로컬 스토리지에 저장
    localStorage.setItem("teams", JSON.stringify(updatedTeams));

    // teamsList 데이터도 업데이트
    updateTeamsList(newTeam, newTeamId);

    console.log("로컬 스토리지 업데이트 완료");
  } catch (error) {
    console.error("로컬 스토리지 업데이트 실패:", error);
  }
}

// teamsList 데이터 업데이트 함수
function updateTeamsList(newTeam, newTeamId) {
  try {
    // teamsList에서 데이터 가져오기
    let teamsList;
    try {
      const teamsListJSON = localStorage.getItem("teamsList");
      teamsList = teamsListJSON ? JSON.parse(teamsListJSON) : [];
    } catch (parseError) {
      console.error("teamsList JSON 파싱 오류:", parseError);
      teamsList = [];
    }

    // 배열 확인
    const validTeamsList = Array.isArray(teamsList) ? teamsList : [];
    
    // ID 정제 함수 추가
    const removeCreatePrefix = (id) => {
      return id.startsWith('create-') ? id.substring('create-'.length) : id;
    };

    // teamsList용 팀 객체 생성
    const teamsListEntry = {
      id: removeCreatePrefix(newTeam.id),
      team_id: newTeamId,
      backendId: newTeamId,
      _originalId: newTeamId,
      name: newTeam.content,
      team_name: newTeam.content,
      content: newTeam.content,
      TeamUrl: newTeam.createTeamUrl || "",
      isPlus: false,
    };

    // 기존 항목 검색
    const existingIndex = validTeamsList.findIndex((team) => {
      if (!team) return false;
      return (
        (team.id && team.id === newTeam.id) ||
        (team.team_id && team.team_id === newTeamId) ||
        (team.backendId && team.backendId === newTeamId) ||
        (team._originalId && team._originalId === newTeamId)
      );
    });

    let updatedTeamsList;
    if (existingIndex >= 0) {
      // 기존 항목 업데이트
      updatedTeamsList = [...validTeamsList];
      updatedTeamsList[existingIndex] = {
        ...updatedTeamsList[existingIndex],
        ...teamsListEntry,
      };
    } else {
      // 새 항목 추가
      updatedTeamsList = [...validTeamsList, teamsListEntry];
    }

    // 로컬 스토리지에 저장
    localStorage.setItem("teamsList", JSON.stringify(updatedTeamsList));
  } catch (error) {
    console.error("teamsList 업데이트 실패:", error);
  }
}

export default CreateApi;
