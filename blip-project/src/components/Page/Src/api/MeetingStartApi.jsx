import axios from "axios";

const MeetingStartApi = async ({
  isTopic,
  targetId,
  createTeamId,
  setMeetingId,
  userEmail,
}) => {
  // ID 변환 유틸리티 함수
  const getBackendId = (id) => {
    console.log("ID 변환 상세 디버그", {
      originalId: id,
      originalType: typeof id,
    });

    // 로컬 스토리지에서 매핑 정보 가져오기
    try {
      const teamsListJSON = localStorage.getItem("teamsList");
      if (teamsListJSON) {
        const teamsList = JSON.parse(teamsListJSON);

        // ID와 일치하는 팀 찾기
        // 1. 정확히 일치하는 경우
        let matchingTeam = teamsList.find((team) => team && team.id === id);

        // 2. create- 형식인 경우 (create-116 -> 116)
        if (
          !matchingTeam &&
          typeof id === "string" &&
          id.startsWith("create-")
        ) {
          const cleanId = id.replace("create-", "");
          matchingTeam = teamsList.find((team) => team && team.id === cleanId);
        }

        if (matchingTeam) {
          // team_id 또는 backendId 사용 (숫자 값)
          const backendId =
            matchingTeam.team_id ||
            matchingTeam.backendId ||
            matchingTeam._originalId;
          if (backendId && !isNaN(Number(backendId))) {
            console.log("로컬 스토리지에서 팀 ID 찾음:", backendId);
            return Number(backendId);
          }
        }
      }
    } catch (error) {
      console.error("localStorage 검색 오류:", error);
    }

    // 문자열 ID 처리
    if (typeof id === "string") {
      // "create-" 접두어가 있으면 제거
      const cleanId = id.replace("create-", "");
      // 숫자로 변환 가능한지 확인
      const numericId = Number(cleanId);
      if (!isNaN(numericId) && numericId > 0) {
        return numericId;
      }
    }

    // 숫자 변환 시도
    const numericId = Number(id);
    if (!isNaN(numericId) && numericId > 0) {
      return numericId;
    }

    // 기본값 (더 이상 1을 반환하지 않음)
    console.warn("유효한 팀 ID를 찾을 수 없습니다:", id);
    return null; // null을 반환하여 오류를 명확히 함
  };

  // API URL과 토큰 가져오기
  const apiUrl = import.meta.env.VITE_API_URL_URL_MEETING_START;
  const accessToken = import.meta.env.VITE_API_URL_URL_KEY;

  // createTeamId로부터 팀 ID 추출
  const cleanedTeamId = getBackendId(createTeamId);

  console.log("원본 createTeamId:", createTeamId);
  console.log("정제된 teamId:", cleanedTeamId);
  console.log("사용자 이메일:", userEmail || "없음");

  // 팀 ID 값 검증
  if (!cleanedTeamId) {
    console.error("팀 ID가 없습니다.");
    throw new Error("팀 ID가 필요합니다.");
  }

  // 유효하지 않은 ID 값 확인
  if (isNaN(cleanedTeamId) || cleanedTeamId <= 0) {
    console.error("유효하지 않은 팀 ID입니다:", cleanedTeamId);
    throw new Error("유효하지 않은 팀 ID입니다.");
  }

  console.log("최종 사용 teamId:", cleanedTeamId);
  console.log("isTopic:", isTopic);

  // 팀 ID가 1이면 enhld00@gmail.com을 리더로, 2이면 enhld00@dsm.hs.kr을 리더로 설정
  let leaderEmail = userEmail;
  if (!leaderEmail) {
    if (cleanedTeamId === 1) {
      leaderEmail = "enhld00@gmail.com";
      console.log("팀 ID 1의 기본 리더 이메일 사용:", leaderEmail);
    } else if (cleanedTeamId === 2) {
      leaderEmail = "enhld00@dsm.hs.kr";
      console.log("팀 ID 2의 기본 리더 이메일 사용:", leaderEmail);
    } else {
      console.warn("알 수 없는 팀 ID. 리더 이메일을 확인할 수 없습니다.");
    }
  }

  const data = {
    team_id: cleanedTeamId, // 정제된 팀 ID 사용
    topic: isTopic || "BLIP 회의",
  };

  console.log("API 요청 데이터:", data);
  console.log("API URL:", apiUrl);

  try {
    const response = await axios.post(apiUrl, data, {
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${accessToken?.trim()}`,
      },
    });

    const newMeetingId = response.data.meeting_id;
    console.log("meeting_id", newMeetingId);
    setMeetingId(newMeetingId);

    console.log("회의 시작 성공", response.data);
    return response.data;
  } catch (error) {
    // 에러 세부 정보 로깅
    if (error.response) {
      // 서버가 응답을 반환한 경우
      console.error("서버 응답 에러:", {
        status: error.response.status,
        data: error.response.data,
        headers: error.response.headers,
      });

      // 토큰 관련 문제인 경우
      if (error.response.status === 403) {
        console.error("권한이 없습니다. 인증 토큰을 확인하세요.");
        console.log("사용된 토큰:", accessToken);
      } else if (error.response.status === 400) {
        console.error("잘못된 요청. 팀 ID 확인 필요:", cleanedTeamId);
        if (error.response.data && typeof error.response.data === "string") {
          console.error("서버 응답 메시지:", error.response.data);
        }
      } else if (error.response.status === 401) {
        console.error(
          "인증이 만료되었거나 유효하지 않습니다. 다시 로그인해주세요."
        );
        // 토큰 만료 처리
        localStorage.removeItem("authToken");
        // 로그인 페이지로 리디렉션 또는 이벤트 발생
        window.dispatchEvent(new CustomEvent("auth:required"));
      }
    } else if (error.request) {
      // 요청은 보냈지만 응답을 받지 못한 경우
      console.error("응답을 받지 못했습니다:", error.request);
    } else {
      // 요청 설정 과정에서 오류가 발생한 경우
      console.error("요청 설정 오류:", error.message);
    }

    throw error;
  }
};

export default MeetingStartApi;
