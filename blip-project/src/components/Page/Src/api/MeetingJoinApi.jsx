import axios from "axios";

const MeetingJoinApi = async (meetingId) => {
  console.log("회의 참가 API 호출 - meetingId:", meetingId);

  try {
    const apiUrl = import.meta.env.VITE_API_URL_BASE;
    if (!apiUrl) {
      throw new Error("API URL이 설정되지 않았습니다");
    }

    const requestUrl = `${apiUrl}meetings/join/${meetingId}`;
    console.log("요청 URL:", requestUrl);

    // 로컬 스토리지에서 토큰 가져오기
    const accessToken = localStorage.getItem("accessToken");
    if (!accessToken) {
      throw new Error("인증 토큰이 없습니다. 로그인이 필요합니다.");
    }

    // axios 요청 설정
    const config = {
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
        Authorization: `Bearer ${accessToken.trim()}`,
      },
    };

    console.log("API 요청 시작");
    const response = await axios.post(requestUrl, {}, config);

    // 응답 데이터가 문자열인 경우 JSON으로 파싱
    let data = response.data;
    if (typeof data === "string") {
      try {
        data = JSON.parse(data);
      } catch {
        console.warn("응답 데이터 JSON 파싱 실패. 원본 응답 사용");
      }
    }

    console.log("API 요청 성공:", data);
    return data;
  } catch (error) {
    console.error("회의 참가 API 요청 실패:", error);

    if (error.response) {
      console.error("서버 응답:", error.response.status);
      console.error("응답 데이터:", error.response.data);

      // 401 Unauthorized 에러 처리
      if (error.response.status === 401) {
        throw new Error("인증이 만료되었습니다. 다시 로그인해주세요.");
      }
    } else if (error.request) {
      console.error("서버 응답 없음");
    }

    throw error;
  }
};

export default MeetingJoinApi; 