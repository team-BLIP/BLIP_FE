import axios from "axios";

const FeedBackApi = async (teamId) => {
  console.log("FeedBackApi 호출 - teamId:", teamId);

  try {
    // API URL 구성
    const apiUrl = import.meta.env.VITE_API_URL_BASE;
    if (!apiUrl) {
      throw new Error("API URL이 설정되지 않았습니다");
    }

    const feedbackUrl = `${apiUrl}teams/${teamId}/feedbacks`;
    console.log("요청 URL:", feedbackUrl);

    // 로컬 스토리지에서 토큰 가져오기
    const accessToken = localStorage.getItem("accessToken");
    if (!accessToken) {
      throw new Error("인증 토큰이 없습니다. 로그인이 필요합니다.");
    }

    // 요청 보내기
    const response = await axios.get(feedbackUrl, {
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
        Authorization: `Bearer ${accessToken.trim()}`,
      },
    });

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
      data = data.feedbacks || [data] || [];
    }

    // 각 피드백 항목에 필수 필드가 있는지 확인하고 처리
    return data.map((feedback) => ({
      meeting_id: feedback.meeting_id || Date.now(), // 고유 ID 보장
      team_id: feedback.team_id || teamId,
      feedback: feedback.feedback || "피드백 내용이 없습니다.",
      created_at: feedback.created_at || new Date().toISOString(),
      endTime:
        feedback.endTime || feedback.created_at || new Date().toISOString(),
    }));
  } catch (error) {
    console.error("피드백 API 요청 실패:", error);

    if (error.response) {
      console.error("서버 응답:", error.response.status);
      console.error("응답 데이터:", error.response.data);
    } else if (error.request) {
      console.error("서버 응답 없음");
    }

    // 오류 발생 시 빈 배열 반환
    return [];
  }
};

export default FeedBackApi;
