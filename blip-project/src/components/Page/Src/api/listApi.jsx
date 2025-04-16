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
  const apiUrl = import.meta.env.VITE_API_URL_BASE.trim();
  const accessToken = import.meta.env.VITE_API_URL_URL_KEY?.trim();

  // URL 슬래시 처리
  const listUrl = apiUrl.endsWith("/") ? `${apiUrl}teams` : `${apiUrl}/teams`;
  console.log("API 요청 URL:", listUrl);

  try {
    const headers = {
      "Content-Type": "application/json",
    };

    if (accessToken) {
      headers.Authorization = `Bearer ${accessToken}`;
      console.log("인증 토큰 사용 중");
    } else {
      console.warn("인증 토큰이 없습니다");
    }

    const response = await axios.get(listUrl, { headers });
    console.log("API 응답 성공:", response.status);

    // 응답 데이터 처리
    const teamsData =
      response.data.teams || response.data.items || response.data;

    if (Array.isArray(teamsData)) {
      console.log(`${teamsData.length}개의 팀 데이터 로드됨`);

      // '새 스페이스 만들기' 항목 포함 여부 확인 및 추가
      const teamsWithDefault = ensureDefaultTeam(teamsData, defaultTeam);

      // 로컬 스토리지에 저장
      localStorage.setItem("teamsList", JSON.stringify(teamsWithDefault));
      localStorage.setItem("teamsLastFetched", new Date().toISOString());

      // 삭제된 팀 ID 정보 제거 (새로운 데이터를 가져왔으므로)
      localStorage.removeItem("recentlyDeletedTeamId");

      return teamsWithDefault;
    } else {
      console.warn("API 응답이 예상 형식과 다릅니다:", response.data);

      const defaultTeamArray = [defaultTeam];
      localStorage.setItem("teamsList", JSON.stringify(defaultTeamArray));

      return defaultTeamArray;
    }
  } catch (error) {
    console.error("팀 목록 가져오기 실패:", error.message);

    if (error.response) {
      console.error("상태 코드:", error.response.status);
      console.error("응답 헤더:", error.response.headers);

      if (error.response.status === 403) {
        console.error("인증 오류: 권한이 없거나 토큰이 잘못되었습니다.");
        localStorage.setItem(
          "teamsApiError",
          JSON.stringify({
            status: 403,
            time: new Date().toISOString(),
            message: "인증 오류가 발생했습니다.",
          })
        );
      }

      if (error.response.data) {
        console.error("서버 응답 데이터:", error.response.data);
      }
    } else if (error.request) {
      console.error("서버 응답 없음:", error.request);
    } else {
      console.error("요청 오류:", error.message);
    }

    // API 오류 시 캐시 데이터 사용
    const cachedTeams = localStorage.getItem("teamsList");
    if (cachedTeams) {
      console.log("API 오류로 인해 캐시된 팀 목록 사용");
      try {
        const parsedTeams = JSON.parse(cachedTeams);

        // 최근 삭제된 팀 확인 및 제거
        const recentlyDeletedTeamId = localStorage.getItem(
          "recentlyDeletedTeamId"
        );
        if (recentlyDeletedTeamId) {
          const teamIdStr = String(recentlyDeletedTeamId);
          const filteredTeams = parsedTeams.filter(
            (team) =>
              String(team.id) !== teamIdStr &&
              String(team.team_id || "") !== teamIdStr &&
              String(team.backendId || "") !== teamIdStr &&
              String(team._originalId || "") !== teamIdStr
          );

          localStorage.setItem("teamsList", JSON.stringify(filteredTeams));
          localStorage.removeItem("recentlyDeletedTeamId");

          return ensureDefaultTeam(filteredTeams, defaultTeam);
        }

        return ensureDefaultTeam(parsedTeams, defaultTeam);
      } catch (error) {
        console.error("캐시된 팀 목록 파싱 오류:", error);
      }
    }

    // 캐시도 없는 경우 기본 팀만 반환
    const defaultTeamArray = [defaultTeam];
    localStorage.setItem("teamsList", JSON.stringify(defaultTeamArray));

    return defaultTeamArray;
  }
};

function ensureDefaultTeam(teams, defaultTeam) {
  if (!Array.isArray(teams)) {
    return [defaultTeam];
  }

  const hasPlusTeam = teams.some(
    (team) =>
      team.isPlus === true ||
      team.id === defaultTeam.id ||
      team.team_id === defaultTeam.team_id ||
      team.team_name === defaultTeam.team_name
  );

  return hasPlusTeam ? teams : [...teams, defaultTeam];
}

export default listApi;
