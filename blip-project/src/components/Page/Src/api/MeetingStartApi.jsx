import axios from "axios";

const MeetingStartApi = async ({ isTopic, targetId }) => {
  // ID 변환 유틸리티 함수
  const getBackendId = (id, alternativeId) => {
    console.log("ID 변환 상세 디버그", {
      originalId: id,
      alternativeId: alternativeId,
      originalType: typeof id,
    });

    // 대체 ID가 있다면 우선 사용
    if (alternativeId && Number(alternativeId) > 0) {
      return Number(alternativeId);
    }

    // 문자열 ID 처리
    if (typeof id === "string") {
      const cleanId = id.replace("create-", "");
      return Number(cleanId);
    }

    return Number(id);
  };

  // 하드코딩된 URL 사용 (실제 API 엔드포인트로 수정 필요)
  const apiUrl = import.meta.env.VITE_API_URL_URL_MEETING_START;
  const accessToken = import.meta.env.VITE_API_URL_URL_KEY;

  // targetId와 함께 alternativeId도 전달
  const cleanedTeamId = getBackendId(targetId, 653);

  console.log("원본 targetId:", targetId);
  console.log("정제된 teamId:", cleanedTeamId);

  // 팀 ID 값 검증
  if (!cleanedTeamId) {
    console.error("팀 ID가 없습니다.");
    throw new Error("팀 ID가 필요합니다.");
  }

  // 숫자형 ID로 변환 시도
  const numericId = Number(cleanedTeamId);

  // 유효하지 않은 ID 값 확인
  if (isNaN(numericId) || numericId <= 0) {
    console.error("유효하지 않은 팀 ID입니다:", cleanedTeamId);
    throw new Error("유효하지 않은 팀 ID입니다.");
  }

  console.log("숫자형 teamId:", numericId);
  console.log("isTopic:", isTopic);

  const data = {
    team_id: numericId, // 숫자형 ID 사용
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
        console.error("잘못된 요청. 팀 ID 확인 필요:", numericId);
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
