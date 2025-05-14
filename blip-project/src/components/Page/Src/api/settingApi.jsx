import axios from "axios";

/**
 * 팀 설정 업데이트 API 호출 함수
 * @param {string|number} TeamTargetId 팀 ID
 * @param {string} inputFont 팀 이름 (null 가능)
 * @param {string} image 팀 이미지 (base64 또는 URL, null 가능)
 * @returns {Promise<Object>} API 응답
 */
const settingApi = async (TeamTargetId, inputFont, image) => {
  // API URL 구성 - TeamTargetId가 유효한지 확인
  if (!TeamTargetId) {
    throw new Error("팀 ID가 필요합니다");
  }

  const url = import.meta.env.VITE_API_URL_BASE || "";
  // URL 끝에 슬래시 중복 방지
  const baseUrl = url.endsWith("/") ? url.slice(0, -1) : url;
  const ApiUrl = `${baseUrl}/teams/${TeamTargetId}/setting`;

  // 로컬 스토리지에서 토큰 가져오기
  const accessToken = localStorage.getItem("accessToken");
  if (!accessToken) {
    throw new Error("인증 토큰이 없습니다. 로그인이 필요합니다.");
  }

  // 요청 데이터 구성 - 변경할 내용이 있는지 확인
  const data = {};

  // 유효한 이름인지 확인 (빈 문자열이 아닌지)
  if (
    inputFont !== undefined &&
    inputFont !== null &&
    inputFont.trim() !== ""
  ) {
    data.name = inputFont.trim();
  }

  // 이미지 처리 (base64 또는 URL)
  if (image) {
    data.image = image;
  }

  // 변경할 데이터가 없으면 경고
  if (Object.keys(data).length === 0) {
    console.warn("변경할 데이터가 없습니다.");
  }

  // 디버깅 정보
  console.log("요청 URL:", ApiUrl);
  console.log("요청 데이터:", JSON.stringify(data, null, 2));

  try {
    const response = await axios.patch(ApiUrl, data, {
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
        Authorization: `Bearer ${accessToken.trim()}`,
      },
    });

    return response.data;
  } catch (error) {
    console.error("팀 설정 업데이트 실패:", error);
    
    if (error.response) {
      console.error("서버 응답:", error.response.status);
      console.error("응답 데이터:", error.response.data);
    } else if (error.request) {
      console.error("서버 응답 없음");
    }

    throw error;
  }
};

export default settingApi;
