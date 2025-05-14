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

  // 액세스 토큰 가져오기 (환경 변수 대신 localStorage 사용)
  // 환경 변수는 빌드 시점에 결정되므로 동적인 사용자 토큰에는 적합하지 않음
  const accessToken = localStorage.getItem("accessToken") || "";

  if (!accessToken) {
    console.error("인증 토큰이 없습니다. 로그인이 필요합니다.");
    return null;
  }

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
        Authorization: `Bearer ${accessToken.trim()}`,
      },
    });

    console.log("팀 생성 API 응답:", response.data);

    if (!response.data || !response.data.team_id) {
      throw new Error("API 응답에 team_id가 없습니다.");
    }

    // 응답에서 필요한 데이터 추출
    const newTeamId = response.data.team_id;
    const createTeamId = `create-${newTeamId}`;
    const inviteLink = response.data.invite_link;

    if (!inviteLink) {
      console.warn("초대 링크가 API 응답에 없습니다:", response.data);
    }

    // 새 팀 객체 생성
    const newTeam = createTeamObject(
      createTeamId,
      newTeamId,
      content,
      inviteLink
    );

    // 상태 업데이트 (있는 경우)
    if (typeof setTargetId === "function") {
      setTargetId(newTeamId);
    }

    // ID 매핑 추가 (있는 경우)
    if (typeof addIdMappings === "function") {
      addIdMappings(createTeamId, newTeamId);
    }

    // 로컬 스토리지 업데이트
    updateTeamInStorage(newTeam);

    // 디스패치 처리 (있는 경우)
    if (memoizedDispatch) {
      dispatchTeamAction(memoizedDispatch, newTeam);
    }

    // 네비게이션 처리
    if (nav) {
      nav("/mainPage", {
        state: {
          content: String(content),
          createTeamId,
          newTeamId,
          createTeamUrl: inviteLink,
        },
      });
    }

    // 모달 닫기
    if (onClose) onClose();
    if (parentOnClose) parentOnClose();

    return newTeamId;
  } catch (error) {
    console.error("팀 생성 실패:", error);

    // 오류 메시지 구체화
    if (error.response?.status === 401) {
      console.error("인증 오류: 로그인이 필요하거나 토큰이 만료되었습니다.");
    } else if (error.response?.status === 400) {
      console.error("잘못된 요청: 요청 데이터를 확인하세요.");
    }

    return null;
  }
};

/**
 * 팀 객체 생성 함수
 */
function createTeamObject(createTeamId, teamId, content, inviteLink) {
  return {
    id: createTeamId,
    team_id: teamId,
    backendId: teamId,
    _originalId: teamId,
    _orginalId: teamId, // 원래 코드의 오타 유지
    content: content,
    team_name: content,
    name: content,
    itemContent: content,
    TeamUrl: inviteLink,
    invite_link: inviteLink,
    createTeamUrl: inviteLink,
    isPlus: false,
  };
}

/**
 * 로컬 스토리지에 팀 정보 업데이트
 */
function updateTeamInStorage(newTeam) {
  try {
    const teamsListJSON = localStorage.getItem("teamsList");
    const teamsList = teamsListJSON ? JSON.parse(teamsListJSON) : [];

    // 기존 항목 검색
    const existingIndex = teamsList.findIndex(
      (team) =>
        team && (team.id === newTeam.id || team.team_id === newTeam.team_id)
    );

    let updatedTeamsList;
    if (existingIndex >= 0) {
      // 기존 항목 업데이트
      updatedTeamsList = [...teamsList];
      updatedTeamsList[existingIndex] = {
        ...updatedTeamsList[existingIndex],
        ...newTeam,
      };
    } else {
      // 새 항목 추가
      updatedTeamsList = [...teamsList, newTeam];
    }

    localStorage.setItem("teamsList", JSON.stringify(updatedTeamsList));
  } catch (error) {
    console.error("로컬 스토리지 업데이트 실패:", error);
  }
}

/**
 * 디스패치 처리 함수
 */
function dispatchTeamAction(memoizedDispatch, newTeam) {
  try {
    if (typeof memoizedDispatch === "function") {
      memoizedDispatch({ type: "ADD_TEAM", payload: newTeam });
    } else if (memoizedDispatch.onCreateone) {
      memoizedDispatch.onCreateone(newTeam.content);
    }
  } catch (error) {
    console.error("디스패치 처리 중 오류:", error);
  }
}

export default CreateApi;
