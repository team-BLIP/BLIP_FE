import axios from "axios";

const FeedBackApi = async (teamId) => {
  console.log("FeedBackApi 호출 - teamId:", teamId);

  try {
    // API URL 구성
    let apiUrl = import.meta.env.VITE_API_URL_BASE;
    if (!apiUrl) {
      console.warn("환경 변수에 API URL이 설정되지 않았습니다. 기본값 사용");
      apiUrl = "http://3.38.233.219:8080/"; // 기본값 설정
    }

    // URL 슬래시 처리
    if (!apiUrl.endsWith("/")) {
      apiUrl += "/";
    }

    const feedbackUrl = `${apiUrl}teams/${teamId}/feedbacks`;
    console.log("요청 URL:", feedbackUrl);

    // 인증 토큰 가져오기 - 여러 소스 확인
    let accessToken =
      localStorage.getItem("accessToken") ||
      localStorage.getItem("token") ||
      sessionStorage.getItem("accessToken") ||
      sessionStorage.getItem("token");

    // 환경 변수에서도 확인 (VITE_API_URL_URL_KEY는 이름이 이상합니다. 실제로는 다른 환경 변수일 수 있음)
    if (!accessToken) {
      accessToken =
        import.meta.env.VITE_AUTH_TOKEN ||
        import.meta.env.VITE_API_TOKEN ||
        import.meta.env.VITE_API_URL_URL_KEY;
    }

    // 실제로 토큰이 있는지 명확하게 검사
    const hasToken =
      accessToken &&
      typeof accessToken === "string" &&
      accessToken.trim().length > 0;

    if (!hasToken) {
      console.warn(
        "유효한 인증 토큰을 찾을 수 없습니다. 인증 없이 요청을 시도합니다."
      );
    }

    // 헤더 구성
    const headers = {
      "Content-Type": "application/json",
      Accept: "application/json",
    };

    // 토큰이 있는 경우만 Authorization 헤더 추가
    if (hasToken) {
      headers.Authorization = `Bearer ${accessToken.trim()}`;
      console.log("Authorization 헤더 설정 완료");
    }

    // 요청 옵션
    const requestOptions = {
      headers,
      timeout: 10000, // 10초 타임아웃
    };

    console.log("API 요청 헤더:", headers);

    // 요청 보내기
    const response = await axios.get(feedbackUrl, requestOptions);

    // 응답 데이터가 문자열인 경우 JSON으로 파싱
    let data = response.data;
    if (typeof data === "string") {
      try {
        data = JSON.parse(data);
      } catch (e) {
        console.warn("응답 데이터 JSON 파싱 실패. 원본 응답 사용");
      }
    }

    console.log("피드백 API 응답 성공:", data);

    // 응답이 배열이 아닌 경우 적절한 형식으로 변환
    if (!Array.isArray(data)) {
      console.warn("응답이 배열이 아닙니다. 데이터 형식 변환");
      data = data.feedbacks || data.data || [data] || [];
    }

    // 빈 배열 검사
    if (data.length === 0) {
      console.log("서버에서 반환된 피드백이 없습니다.");
      return [];
    }

    // 각 피드백 항목에 필수 필드가 있는지 확인하고 처리
    return data.map((feedback) => ({
      meeting_id: feedback.meeting_id || feedback.meetingId || Date.now(), // 고유 ID 보장
      team_id: feedback.team_id || feedback.teamId || teamId,
      feedback:
        feedback.feedback || feedback.content || "피드백 내용이 없습니다.",
      created_at:
        feedback.created_at || feedback.createdAt || new Date().toISOString(),
      endTime:
        feedback.endTime ||
        feedback.end_time ||
        feedback.created_at ||
        new Date().toISOString(),
    }));
  } catch (error) {
    console.error("피드백 API 요청 실패:", error);

    if (error.response) {
      console.error("서버 응답:", error.response.status);
      console.error("응답 데이터:", error.response.data);

      // 401 오류 처리
      if (error.response.status === 401) {
        console.warn("인증 토큰이 유효하지 않습니다. 재로그인이 필요합니다.");

        // 토큰 관련 오류 메시지 표시를 위한 데이터 설정
        const errorFeedback = [
          {
            meeting_id: Date.now(),
            team_id: teamId,
            feedback: "인증 토큰이 만료되었습니다. 재로그인이 필요합니다.",
            created_at: new Date().toISOString(),
            endTime: new Date().toISOString(),
            isError: true,
            errorType: "auth",
          },
        ];

        // 개발 환경에서는 목업 데이터 반환
        if (process.env.NODE_ENV === "development") {
          console.log("개발 환경에서는 목업 데이터 반환");
          return getMockFeedbacks(teamId);
        }

        // 프로덕션에서는 빈 배열 반환
        return [];
      }
    } else if (error.request) {
      console.error("서버 응답 없음. 네트워크 연결을 확인하세요.");
    }

    // 오류 발생 시 빈 배열 반환
    return [];
  }
};

// 개발 환경용 목업 데이터
function getMockFeedbacks(teamId) {
  return [
    {
      meeting_id: 1001,
      team_id: teamId,
      feedback:
        "회의 진행이 원활했습니다. 다음에도 이런 방식으로 진행해보세요.",
      created_at: new Date().toISOString(),
      endTime: new Date().toISOString(),
    },
    {
      meeting_id: 1002,
      team_id: teamId,
      feedback: "발표 자료가 잘 준비되었습니다. 시각 자료를 더 활용해보세요.",
      created_at: new Date(Date.now() - 86400000).toISOString(), // 1일 전
      endTime: new Date(Date.now() - 86400000).toISOString(),
    },
  ];
}

export default FeedBackApi;
