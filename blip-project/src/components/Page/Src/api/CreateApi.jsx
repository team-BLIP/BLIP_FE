import axios from "axios";

/**
 * 팀 생성 API 함수
 */
const CreateApi = async (
  content,
  nav,
  submitRef,
  onClose,
  memoizedDispatch,
  targetId,
  setTargetId,
  parentOnClose,
  addIdMappings
) => {
  const apiUrl = import.meta.env.VITE_API_URL_URL_CREATE_TEAM;
  const accessToken = import.meta.env.VITE_API_URL_URL_KEY;

  const data = {
    team_name: content,
    nick_name: "",
  };

  try {
    console.log("팀 생성 API 호출 시작:", { content });

    // API 호출
    const response = await axios.post(apiUrl, data, {
      headers: {
        "Content-Type": "application/json",
        Authorization: accessToken ? `Bearer ${accessToken.trim()}` : "",
      },
    });

    console.log("팀 생성 API 응답:", response.data);

    if (!response.data || !response.data.team_id) {
      throw new Error("API 응답에 team_id가 없습니다.");
    }

    const newTeamId = response.data.team_id;
    const createTeamId = `create-${newTeamId}`;
    
    // invite_link를 우선적으로 추출
    const invite_link = response.data.invite_link;
    
    // 디버깅을 위한 로그 추가
    console.log("API 응답 전체:", response.data);
    console.log("추출된 초대 링크:", invite_link);

    if (!invite_link) {
      console.warn("초대 링크가 API 응답에 없습니다:", response.data);
    }

    console.log("새 팀 ID:", newTeamId, "createTeamId:", createTeamId);
    console.log("초대 링크:", invite_link);

    // 새 팀 객체 생성 - 모든 필드를 일관되게 설정
    const newTeam = {
      id: createTeamId,
      team_id: newTeamId,
      backendId: newTeamId,
      _originalId: newTeamId,
      _orginalId: newTeamId,
      content: content,
      team_name: content,
      name: content,
      itemContent: content,
      TeamUrl: invite_link,
      invite_link: invite_link,
      createTeamUrl: invite_link,
      isPlus: false
    };

    console.log("생성된 팀 객체:", newTeam);

    if (typeof setTargetId === "function") {
      setTargetId(newTeamId);
      console.log("targetId 설정됨:", newTeamId);
    }

    // ID 매핑 추가
    if (typeof addIdMappings === "function") {
      try {
        addIdMappings(createTeamId, newTeamId);
        console.log("ID 매핑 추가됨:", { createTeamId, newTeamId });
      } catch (mappingError) {
        console.error("ID 매핑 추가 실패:", mappingError);
      }
    }

    // 로컬 스토리지 업데이트
    try {
      const teamsListJSON = localStorage.getItem("teamsList");
      const teamsList = teamsListJSON ? JSON.parse(teamsListJSON) : [];
      const updatedTeamsList = [...teamsList, newTeam];
      localStorage.setItem("teamsList", JSON.stringify(updatedTeamsList));
      console.log("팀 목록 업데이트됨:", updatedTeamsList);
    } catch (error) {
      console.error("로컬 스토리지 업데이트 실패:", error);
    }

    // 네비게이션 처리
    nav("/mainPage", {
      state: {
        content: String(content),
        createTeamId,
        newTeamId,
        createTeamUrl: invite_link,
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

/**
 * 디스패치 처리 함수
 */
function handleDispatch(memoizedDispatch, newTeam) {
  if (!memoizedDispatch) {
    console.error("memoizedDispatch가 제공되지 않았습니다");
    return;
  }

  try {
    if (typeof memoizedDispatch === "function") {
      console.log("디스패치 실행 (함수):", { type: "ADD_TEAM", team: newTeam });
      memoizedDispatch({ type: "ADD_TEAM", payload: newTeam });
    } else if (memoizedDispatch.onCreateone) {
      console.log("디스패치 실행 (onCreateone):", { content: newTeam.content });
      memoizedDispatch.onCreateone(newTeam.content);
    } else {
      console.error("지원되지 않는 memoizedDispatch 형식:", memoizedDispatch);
    }
  } catch (error) {
    console.error("디스패치 처리 중 오류:", error);
  }
}

/**
 * 로컬 스토리지 업데이트 함수 - teamsList만 사용
 */
function updateLocalStorage(createTeamId, newTeamId, newTeam) {
  try {
    if (!createTeamId || !newTeamId) {
      console.error("필수 ID 값이 누락되었습니다:", {
        createTeamId,
        newTeamId,
      });
      return;
    }

    // ID 정규화
    const removeCreatePrefix = (id) => {
      return typeof id === "string" && id.startsWith("create-")
        ? id.substring("create-".length)
        : id;
    };

    // teamsList에서만 데이터 로드
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

    // teamsList용 팀 객체 생성 (ID 필드 통일)
    const teamsListEntry = {
      id: createTeamId, // 'create-123' 형식 유지
      team_id: newTeamId, // 실제 백엔드 ID (숫자)
      backendId: newTeamId, // 실제 백엔드 ID (숫자)
      _originalId: newTeamId, // 실제 백엔드 ID (숫자)
      _orginalId: newTeamId, // 호환성 유지 (오타)
      name: newTeam.content || "",
      team_name: newTeam.content || "",
      content: newTeam.content || "",
      TeamUrl: newTeam.TeamUrl || "",
      invite_link: newTeam.invite_link || "", // 추가: 두 가지 형식 모두 저장
      isPlus: false,
      itemContent: newTeam.content || "", // SidebarTeam에서 사용하는 필드
    };

    // 기존 항목 검색 (ID 정규화 적용)
    const existingIndex = validTeamsList.findIndex((team) => {
      if (!team) return false;

      // ID 정규화 적용
      const teamId = team.id || "";
      const teamBackendId =
        team.backendId || team._originalId || team.team_id || "";

      // 'create-' 접두어 제거한 ID로 비교
      const normalizedTeamId = removeCreatePrefix(teamId);
      const normalizedCreateTeamId = removeCreatePrefix(createTeamId);

      return (
        // ID 직접 비교
        teamId === createTeamId ||
        // 'create-' 접두어 제거한 ID로 비교
        normalizedTeamId === normalizedCreateTeamId ||
        // 백엔드 ID로 비교
        String(teamBackendId) === String(newTeamId)
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
      console.log("기존 팀 업데이트:", teamsListEntry);
    } else {
      // 새 항목 추가
      updatedTeamsList = [...validTeamsList, teamsListEntry];
      console.log("새 팀 추가:", teamsListEntry);
    }

    // teamsList에만 저장
    localStorage.setItem("teamsList", JSON.stringify(updatedTeamsList));

    // teams는 비워두기 (더 이상 사용하지 않음)
    localStorage.setItem("teams", "[]");

    console.log("로컬 스토리지 업데이트 완료");
  } catch (error) {
    console.error("로컬 스토리지 업데이트 실패:", error);
  }
}

export default CreateApi;
