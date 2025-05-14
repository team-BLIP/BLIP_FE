// listApi.ts - 팀 목록 가져오기
import axios from "axios";
import Add from "../../../../svg/add.svg";

//팀 목록을 가져오는 API 함수
const listApi = async (forceRefresh = false) => {
  // 기본 '새 스페이스 만들기' 팀 정의
  const defaultTeam = {
    id: "default-team",
    team_id: "default-team",
    content: "d",
    name: <img src={Add} />,
    team_name: "새 스페이스 만들기",
    backendId: "default-team",
    _originalId: "default-team",
    TeamUrl: "",
    isPlus: true,
    isDefault: true,
  };

  // 캐시 사용 결정 (forceRefresh가 true면 캐시 무시)
  if (!forceRefresh) {
    // 최근에 삭제된 팀 ID 확인
    const recentlyDeletedTeamId = localStorage.getItem("recentlyDeletedTeamId");

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

        // 최근 삭제된 팀이 있으면 캐시에서도 제거
        if (recentlyDeletedTeamId) {
          const teamIdStr = String(recentlyDeletedTeamId);
          parsedTeams = parsedTeams.filter(
            (team) =>
              String(team.id) !== teamIdStr &&
              String(team.team_id || "") !== teamIdStr &&
              String(team.backendId || "") !== teamIdStr &&
              String(team._originalId || "") !== teamIdStr
          );

          // 필터링된 목록 캐시 업데이트
          localStorage.setItem("teamsList", JSON.stringify(parsedTeams));
          // 삭제된 팀 ID 정보 제거
          localStorage.removeItem("recentlyDeletedTeamId");
        }

        return ensureDefaultTeam(parsedTeams, defaultTeam);
      } catch (error) {
        console.error("캐시된 팀 목록 파싱 오류:", error);
        // 캐시 오류 시 새로 가져오기
      }
    }
  }

  // API 환경 변수 가져오기
  const apiUrl = import.meta.env.VITE_API_URL_URL_LIST_TEAM;
  const accessToken = import.meta.env.VITE_API_URL_URL_KEY;

  // 현재 팀 ID 가져오기
  const currentTeamId = localStorage.getItem("currentTeamId");
  if (!currentTeamId) {
    console.error("현재 팀 ID를 찾을 수 없습니다.");
    return [defaultTeam];
  }

  // URL 구성
  const listUrl = `${apiUrl}teams/${currentTeamId}`;
  console.log("API 요청 URL:", listUrl);

  try {
    const headers = {
      "Content-Type": "application/json",
      Authorization: accessToken ? `Bearer ${accessToken.trim()}` : "",
    };

    console.log("API 요청 시작 - URL:", listUrl);
    const response = await axios.get(listUrl, { headers });
    console.log("API 응답 성공:", response.status);
    console.log(
      "응답 데이터 구조:",
      JSON.stringify(response.data).substring(0, 200)
    );

    // API 응답 데이터를 배열로 정규화
    const teamsData = Array.isArray(response.data)
      ? response.data
      : response.data?.teams || response.data?.data || [];

    if (!Array.isArray(teamsData)) {
      console.error("API 응답에서 팀 배열을 찾을 수 없습니다:", response.data);
      // 캐시에서 가져오기 시도
      return tryUsingCachedTeams(defaultTeam);
    }

    // 팀 데이터 정규화
    const teams = teamsData.map((team) => ({
      id: `create-${team.team_id}`,
      team_id: team.team_id,
      backendId: team.team_id,
      _originalId: team.team_id,
      content: team.team_name,
      team_name: team.team_name,
      name: team.team_name,
      itemContent: team.team_name,
      TeamUrl: team.invite_link || team.TeamUrl || "",
      invite_link: team.invite_link || team.TeamUrl || "",
      createTeamUrl: team.invite_link || team.TeamUrl || "",
      isPlus: false,
      meetings: team.meetings || [],
    }));

    console.log("정규화된 팀 데이터:", teams);

    // 기본 팀 추가
    const teamsWithDefault = [...teams, defaultTeam];

    // 캐시 업데이트
    localStorage.setItem("teamsList", JSON.stringify(teamsWithDefault));
    localStorage.setItem("teamsLastFetched", new Date().toISOString());

    return teamsWithDefault;
  } catch (error) {
    console.error("팀 목록 가져오기 실패:", error.message);

    if (error.response) {
      console.error("상태 코드:", error.response.status);
      console.error("응답 헤더:", error.response.headers);
      console.error("응답 데이터:", error.response.data);

      // 401 또는 403 에러 처리
      if (error.response.status === 401 || error.response.status === 403) {
        console.error(
          "인증이 만료되었거나 권한이 없습니다. 다시 로그인해주세요."
        );
        // 토큰 제거
        localStorage.removeItem("accessToken");
        // 다른 관련 데이터도 제거
        localStorage.removeItem("userEmail");
        localStorage.removeItem("userName");

        // 로그인 페이지로 리디렉션하기 위한 이벤트 발생
        window.dispatchEvent(new CustomEvent("auth:required"));

        throw new Error("인증이 만료되었습니다. 다시 로그인해주세요.");
      }
    } else if (error.request) {
      console.error("서버 응답 없음:", error.request);
    } else {
      console.error("요청 오류:", error.message);
    }

    return tryUsingCachedTeams(defaultTeam);
  }
};

// 캐시된 팀 데이터 시도
const tryUsingCachedTeams = (defaultTeam) => {
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
};

// 팀 목록에 '새 스페이스 만들기' 항목이 있는지 확인하고 없으면 추가하는 함수
const ensureDefaultTeam = (teams, defaultTeam) => {
  if (!Array.isArray(teams)) {
    console.warn("teams가 배열이 아닙니다. 기본 팀만 반환합니다.");
    return [defaultTeam];
  }

  // 기본 팀이 이미 있는지 확인
  const hasDefaultTeam = teams.some(
    (team) =>
      team.isDefault ||
      team.id === "default-team" ||
      team.team_id === "default-team"
  );

  // 없으면 추가
  return hasDefaultTeam ? teams : [...teams, defaultTeam];
};

export default listApi;
