import axios from "axios";

const FeedBackApi = async (targetId) => { 
  const apiUrl = import.meta.env.VITE_API_URL_BASE;
  const FeedUrl = `${apiUrl}teams/${targetId}/feedbacks`;

  // 로컬 스토리지에서 토큰 가져오기
  const accessToken = import.meta.env.VITE_API_URL_URL_KEY;

  console.log("FeedUrl", FeedUrl);
  console.log("accessToken 존재 여부:", !!accessToken);

  try {
    const response = await axios.get(FeedUrl, {
      headers: {
        "Content-Type": "application/json",
        Authorization: accessToken ? `Bearer ${accessToken.trim()}` : "",
      },
    });

    console.log("피드백 API 응답 성공:", response.data);

    // 응답이 배열이면 그대로 사용, 아니면 빈 배열 반환
    return Array.isArray(response.data) ? response.data : [];
  } catch (error) {
    console.error("피드백 API 요청 실패:", error);
    return []; // 오류 발생 시 빈 배열 반환
  }
};

export default FeedBackApi;
