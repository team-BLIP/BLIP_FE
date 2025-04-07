import axios from "axios";

const MeetingStartApi = async ({ isTopic, content, userName, TeamId }) => {
  const apiStart = import.meta.env.VITE_API_URL_URL_MEETINGS_START;
  const accessToken = import.meta.env.VITE_API_REACT_APP_API_KEY;

  const data = {
    team_id: TeamId || content,
    topic: isTopic,
  };

  try {
    const response = await axios.post(apiStart, data, {
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${accessToken?.trim()}`,
      },
    });
    console.log("팀 생성 성공", response.data);
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
