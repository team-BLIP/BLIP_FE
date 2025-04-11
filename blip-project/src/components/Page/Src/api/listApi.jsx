// listApi.ts - 팀 목록 가져오기
import axios from "axios";
import Add from "../../../../svg/add.svg";

const listApi = async () => {
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

    const teamsData =
      response.data.teams || response.data.items || response.data;

    if (Array.isArray(teamsData)) {
      console.log(`${teamsData.length}개의 팀 데이터 로드됨`);

      const hasPlusTeam = teamsData.some(
        (team) =>
          team.isPlus === true ||
          team.id === defaultTeam.id ||
          team.team_id === defaultTeam.team_id ||
          team.name === defaultTeam.name ||
          team.team_name === defaultTeam.team_name
      );

      const teamsWithDefault = hasPlusTeam
        ? teamsData
        : [...teamsData, defaultTeam];

      localStorage.setItem("teamsList", JSON.stringify(teamsWithDefault));
      localStorage.setItem("teamsLastFetched", new Date().toISOString());

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

    const cachedTeams = localStorage.getItem("teamsList");
    if (cachedTeams) {
      console.log("캐시된 팀 목록 사용");
      const parsedTeams = JSON.parse(cachedTeams);

      return parsedTeams;
    }

    const defaultTeamArray = [defaultTeam];
    localStorage.setItem("teamsList", JSON.stringify(defaultTeamArray));

    return defaultTeamArray;
  }
};

export default listApi;
