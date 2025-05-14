// 개선된 ListApi 함수
import axios from "axios";
import Add from "../../../../svg/add.svg";

/**
 * 팀 목록을 가져오는 API 함수
 */
const listApi = async (forceRefresh = false) => {
  // 기본 '새 스페이스 만들기' 팀 정의
  const defaultTeam = {
    id: "default-team",
    team_id: "default-team",
    content: "새 스페이스 만들기",
    name: "새 스페이스 만들기",
    team_name: "새 스페이스 만들기",
    backendId: "default-team",
    _originalId: "default-team",
    TeamUrl: "",
    isPlus: true,
    isDefault: true,
    isDefaultAddButton: true,
    itemContent: "ADD_BUTTON",
  };

  // 캐시 사용 결정 (forceRefresh가 true면 캐시 무시)
  if (!forceRefresh) {
    // 캐시된 팀 목록 확인
    const cachedTeams = localStorage.getItem("teamsList");
    const lastFetched = localStorage.getItem("teamsLastFetched");

    // 캐시 유효성 확인 (5분 이내의 데이터만 사용)
    const isCacheValid =
      lastFetched &&
      new Date().getTime() - new Date(lastFetched).getTime() < 5 * 60 * 1000;

    if (cachedTeams && isCacheValid) {
      console.log("캐시된 팀 목록 사용 (5분 이내)");
      try {
        let parsedTeams = JSON.parse(cachedTeams);
        return ensureDefaultTeam(parsedTeams, defaultTeam);
      } catch (error) {
        console.error("캐시된 팀 목록 파싱 오류:", error);
        // 캐시 오류 시 새로 가져오기
      }
    }
  }

  // API 환경 변수 가져오기
  const apiUrl = import.meta.env.VITE_API_URL_URL_LIST_TEAM;
  const accessToken = localStorage.getItem("accessToken");

  if (!accessToken) {
    console.warn("인증 토큰이 없습니다. 기본 팀만 반환합니다.");
    return [defaultTeam];
  }

  try {
    // 올바른 API URL 구성
    const listUrl = apiUrl;
    console.log("API 요청 시작 - URL:", listUrl);

    const response = await axios.get(listUrl, {
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${accessToken.trim()}`,
      },
    });

    console.log("API 응답 성공:", response.status);

    // API 응답 검증
    if (!response.data) {
      console.warn("API 응답에 데이터가 없습니다");
      return [defaultTeam];
    }

    // 배열이 아닌 경우 처리
    const teamsData = Array.isArray(response.data)
      ? response.data
      : response.data.teams || response.data.data || [];

    if (!teamsData.length) {
      console.log("팀 데이터가 없습니다");
      return [defaultTeam];
    }

    // API 응답 데이터 정규화
    const teams = teamsData
      .filter((team) => team && (team.team_id || team.id)) // 유효한 팀만 처리
      .map((team) => ({
        id: `create-${team.team_id || team.id}`,
        team_id: team.team_id || team.id,
        backendId: team.team_id || team.id,
        _originalId: team.team_id || team.id,
        _orginalId: team.team_id || team.id,
        content: team.team_name || team.name || "",
        team_name: team.team_name || team.name || "",
        name: team.team_name || team.name || "",
        itemContent: team.team_name || team.name || "",
        TeamUrl: team.invite_link || team.url || team.TeamUrl || "",
        invite_link: team.invite_link || team.url || team.TeamUrl || "",
        createTeamUrl: team.invite_link || team.url || team.TeamUrl || "",
        isPlus: false,
      }));

    console.log("정규화된 팀 데이터:", teams);

    // 기본 팀 추가
    const teamsWithDefault = [...teams, defaultTeam];

    // 캐시 업데이트
    localStorage.setItem("teamsList", JSON.stringify(teamsWithDefault));
    localStorage.setItem("teamsLastFetched", new Date().toISOString());

    return teamsWithDefault;
  } catch (error) {
    console.error("팀 목록 가져오기 실패:", error.message || error);

    if (error.response) {
      console.error("응답 상태:", error.response.status);

      // 인증 오류 처리
      if (error.response.status === 401 || error.response.status === 403) {
        console.warn("인증이 만료되었거나 권한이 없습니다");
        // 이벤트 발생 (필요한 경우)
        window.dispatchEvent(new CustomEvent("auth:required"));
      }
    }

    // API 오류 시 캐시 데이터 사용
    const cachedTeams = localStorage.getItem("teamsList");
    if (cachedTeams) {
      console.log("API 오류로 인해 캐시된 팀 목록 사용");
      try {
        const parsedTeams = JSON.parse(cachedTeams);
        return ensureDefaultTeam(parsedTeams, defaultTeam);
      } catch (parseError) {
        console.error("캐시 데이터 파싱 오류:", parseError);
      }
    }

    // 모든 시도 실패 시 기본 팀만 반환
    return [defaultTeam];
  }
};

/**
 * 팀 목록에 '새 스페이스 만들기' 항목이 있는지 확인하고 없으면 추가하는 함수
 */
const ensureDefaultTeam = (teams, defaultTeam) => {
  if (!Array.isArray(teams)) {
    console.warn("teams가 배열이 아닙니다. 기본 팀만 반환합니다.");
    return [defaultTeam];
  }

  // 유효한 팀만 필터링
  const validTeams = teams.filter(
    (team) =>
      team && (team.id || team.team_id || team.backendId || team._originalId)
  );

  // 기본 팀이 이미 있는지 확인
  const hasDefaultTeam = validTeams.some(
    (team) =>
      team.isDefault ||
      team.isDefaultAddButton ||
      team.id === "default-team" ||
      team.team_id === "default-team" ||
      team.itemContent === "ADD_BUTTON"
  );

  // 없으면 추가
  return hasDefaultTeam ? validTeams : [...validTeams, defaultTeam];
};

export default listApi;
