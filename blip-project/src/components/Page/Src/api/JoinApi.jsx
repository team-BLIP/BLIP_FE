import axios from "axios";

/**
 * 팀 데이터 정규화 함수
 */
/**
 * 팀 데이터 정규화 함수
 */
const normalizeTeamData = (team) => {
  if (!team) {
    console.error("정규화할 팀 데이터가 없습니다.");
    return null;
  }

  // 안전하게 값 추출 (undefined 방지)
  const teamId = team.team_id || team.backendId || team.id || "";
  const teamName = team.team_name || team.content || "팀 이름";
  const teamUrl = team.createTeamUrl || team.TeamUrl || "";

  // ID가 비어있는 경우 유니크 ID 생성
  const safeId =
    teamId ||
    `team-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;

  // 데이터 검증 로깅
  console.log("팀 데이터 정규화:", {
    원본ID: teamId,
    정규화ID: safeId,
    이름: teamName,
  });

  return {
    id: `Join-${safeId}`, // 클라이언트 ID 형식 통일
    backendId: safeId, // 백엔드 ID
    _originalId: safeId, // 원본 ID 저장
    _orginalId: safeId, // 호환성 유지 (오타 포함)
    TeamUrl: teamUrl,
    content: teamName,
    itemContent: teamName,
    isPlus: false,
    team_id: safeId, // 백엔드 통신 호환성
    team_name: teamName, // 백엔드 통신 호환성
  };
};

/**
 * 로컬 스토리지에서 팀 목록을 가져오는 함수
 */
const getTeamsFromStorage = (key = "teamsList") => {
  try {
    const teamsData = localStorage.getItem(key);
    if (!teamsData) return [];

    // 문자열 "[object Object]"나 "[object Array]"가 저장된 경우 처리
    if (teamsData === "[object Object]" || teamsData === "[object Array]") {
      localStorage.setItem(key, "[]"); // 초기화
      return [];
    }

    const parsedData = JSON.parse(teamsData);
    return Array.isArray(parsedData) ? parsedData : [];
  } catch (error) {
    console.error(`로컬 스토리지 데이터(${key}) 파싱 실패:`, error);
    localStorage.setItem(key, "[]"); // 오류 시 초기화
    return [];
  }
};

/**
 * 중복 팀 ID 확인 함수
 */
const isDuplicateTeam = (existingTeams, newTeam) => {
  if (!newTeam || !newTeam.backendId) return true;

  // 모든 ID 필드 확인
  const newTeamIds = [
    String(newTeam.backendId),
    String(newTeam.id).replace(/^Join-/, ""),
    String(newTeam._originalId),
    String(newTeam.team_id),
  ].filter(Boolean);

  // 가장 짧은 고유 ID (일반적으로 숫자)
  const shortestId = newTeamIds.sort((a, b) => a.length - b.length)[0];

  // 중복 확인: 여러 ID 형식 모두 체크
  return existingTeams.some((team) => {
    if (!team) return false;

    const teamIds = [
      String(team.backendId),
      String(team.id).replace(/^Join-/, ""),
      String(team._originalId),
      String(team.team_id),
    ].filter(Boolean);

    return teamIds.some(
      (id) =>
        newTeamIds.includes(id) ||
        id === shortestId ||
        teamIds.includes(shortestId)
    );
  });
};

/**
 * 로컬 스토리지에 팀 정보 저장 (병합 로직)
 */
const saveTeamToLocalStorage = (newTeam) => {
  try {
    if (!newTeam || !newTeam.backendId) {
      console.error("저장할 팀 데이터가 유효하지 않습니다:", newTeam);
      return false;
    }

    // 1. 현재 teamsList 데이터 가져오기
    const teamsListData = getTeamsFromStorage("teamsList");
    console.log("저장 전 teamsList 데이터 개수:", teamsListData.length);

    // 2. 현재 teams 데이터 가져오기 (하위 호환성)
    const teamsData = getTeamsFromStorage("teams");
    console.log("저장 전 teams 데이터 개수:", teamsData.length);

    // 3. 중복 체크 - 개선된 함수 사용
    const isDuplicate = isDuplicateTeam(teamsListData, newTeam);

    if (!isDuplicate) {
      // 4. 새 팀 추가 (교체가 아닌 추가)
      const normalizedTeam = normalizeTeamData(newTeam); // 재정규화
      const updatedTeamsList = [...teamsListData, normalizedTeam];
      localStorage.setItem("teamsList", JSON.stringify(updatedTeamsList));

      // 5. teams 데이터도 업데이트 (하위 호환성)
      const updatedTeams = [...teamsData, normalizedTeam];
      localStorage.setItem("teams", JSON.stringify(updatedTeams));

      // 6. 새로운 팀 가입 알림 이벤트 발생
      window.dispatchEvent(
        new CustomEvent("teamJoined", {
          detail: {
            team: normalizedTeam,
            allTeams: updatedTeamsList,
            timestamp: Date.now(),
            source: "JoinApi",
          },
        })
      );

      // 7. 디버깅 정보
      console.log("로컬 스토리지에 팀 저장 완료:", normalizedTeam);
      console.log("현재 총 팀 수:", updatedTeamsList.length);

      // 팀 ID들 로깅
      console.log(
        "저장된 팀 ID들:",
        updatedTeamsList.map((t) => ({
          id: t.id,
          backendId: t.backendId,
          _originalId: t._originalId,
        }))
      );

      return true;
    } else {
      console.log("이미 존재하는 팀입니다:", newTeam);
      return false;
    }
  } catch (error) {
    console.error("로컬 스토리지 저장 실패:", error);
    return false;
  }
};

/**
 * 팀 가입 API 호출 함수
 */
const joinTeam = async (inviteLink) => {
  const apiUrl = import.meta.env.VITE_API_URL_URL_CREATE_JOIN;
  const accessToken = import.meta.env.VITE_API_URL_URL_KEY;

  try {
    const response = await axios.post(
      apiUrl,
      { invite_link: inviteLink },
      {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${accessToken}`,
        },
      }
    );

    return { success: true, data: response.data };
  } catch (error) {
    console.error("팀 가입 API 호출 실패:", error);
    return { success: false, error };
  }
};

/**
 * 디스패처 처리 함수
 */
const handleDispatch = (dispatch, newTeam) => {
  if (!dispatch) {
    console.warn("디스패처가 제공되지 않았습니다");
    return false;
  }

  try {
    if (typeof dispatch === "function") {
      // Redux 스타일 디스패처
      dispatch({ type: "ADD_TEAM", payload: newTeam });
      return true;
    } else if (
      dispatch.onCreateone &&
      typeof dispatch.onCreateone === "function"
    ) {
      // 커스텀 디스패처
      dispatch.onCreateone(newTeam.content);
      return true;
    } else {
      console.error("지원되지 않는 디스패처 타입:", dispatch);
      return false;
    }
  } catch (error) {
    console.error("디스패처 처리 실패:", error);
    return false;
  }
};

/**
 * 메인 JoinApi 함수
 */
const JoinApi = async (
  joinUrl,
  targetId,
  setTargetId,
  content,
  memoizedDispatch,
  createTeamUrl,
  nav
) => {
  if (!joinUrl) {
    console.error("초대 링크가 제공되지 않았습니다");
    return { success: false, error: "초대 링크가 필요합니다" };
  }

  console.log("초대 링크:", joinUrl);

  // 스토리지 디버깅
  console.group("JoinApi 호출 전 스토리지 상태");
  const teamsListBefore = getTeamsFromStorage("teamsList");
  console.log("기존 teamsList 데이터 개수:", teamsListBefore.length);

  if (teamsListBefore.length > 0) {
    console.log("기존 teamsList 첫 번째 항목:", teamsListBefore[0]);
  }
  console.groupEnd();

  // API 호출
  const { success, data, error } = await joinTeam(joinUrl);

  if (!success) {
    alert("팀 참가에 실패했습니다. 다시 시도해주세요.");
    return { success: false, error };
  }

  console.log("팀 가입 성공:", data);

  // targetId 업데이트
  const newTeamId = data.team_id;
  if (typeof setTargetId === "function") {
    setTargetId(newTeamId);
    console.log("새 팀 ID:", newTeamId);
  } else {
    console.warn("setTargetId가 함수가 아닙니다");
  }

  // 팀 정보 생성 및 정규화
  const teamJoinId = `Join-${data.team_id}`;
  console.log("팀 가입 ID:", teamJoinId);

  const newTeamJoin = normalizeTeamData({
    team_id: data.team_id,
    team_name: data.team_name || content,
    content: content || data.team_name,
    createTeamUrl: createTeamUrl,
    TeamUrl: createTeamUrl,
  });

  // 디스패처 처리 (선택적)
  if (memoizedDispatch) {
    handleDispatch(memoizedDispatch, newTeamJoin);
  }

  // 로컬 스토리지 저장 (기존 팀에 추가)
  const saved = saveTeamToLocalStorage(newTeamJoin);
  console.log("팀 저장 결과:", saved ? "성공" : "중복 또는 실패");

  // 저장 후 스토리지 확인
  console.group("JoinApi 호출 후 스토리지 상태");
  const teamsListAfter = getTeamsFromStorage("teamsList");
  console.log("저장 후 teamsList 데이터 개수:", teamsListAfter.length);
  console.groupEnd();

  // 현재 팀 ID 저장
  localStorage.setItem("currentTeamId", String(newTeamId));

  // 네비게이션 처리 (window.location.reload 추가)
  const navigateWithRefresh = () => {
    if (createTeamUrl && nav && typeof nav.navigate === "function") {
      nav.navigate("/mainPage", {
        state: {
          content: String(content || ""),
          TeamJoinId: teamJoinId,
          targetId: teamJoinId,
          forceRefresh: true,
          timestamp: Date.now(),
        },
      });
    } else if (nav) {
      nav("/mainPage", {
        state: {
          content: String(content || ""),
          TeamJoinId: teamJoinId,
          targetId: String(newTeamId),
          forceRefresh: true,
          timestamp: Date.now(),
        },
      });
    }

    // 페이지 새로고침을 조금 지연시켜 상태 업데이트 완료 보장
    setTimeout(() => {
      window.location.reload();
    }, 500);
  };

  navigateWithRefresh();

  return { success: true, data, teamJoinId };
};

export default JoinApi;
