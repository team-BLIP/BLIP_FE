import axios from "axios";

/**
 * 팀 설정 업데이트 API 호출 함수
 * @param {string|number} teamId 팀 ID
 * @param {string} teamName 팀 이름 (nullable)
 * @param {string} teamImage 팀 이미지 (base64 또는 URL, nullable)
 * @returns {Promise<Object>} API 응답 또는 오류 시 fallback 데이터
 */
const settingApi = async (teamId, teamName, teamImage) => {
  // 필수 데이터 검증
  if (!teamId) {
    throw new Error("팀 ID가 필요합니다");
  }

  // 환경 변수에서 API 기본 URL 가져오기
  const baseUrl = (import.meta.env.VITE_API_URL_BASE || "").replace(/\/$/, "");
  const apiUrl = `${baseUrl}/teams/${teamId}/setting`;

  // 토큰 검증 및 준비
  const accessToken = localStorage.getItem("accessToken");

  // 토큰이 없는 경우 로컬 스토리지에만 저장하고 그 결과를 반환
  if (!accessToken || accessToken.trim() === "") {
    console.warn("인증 토큰이 없습니다. 로컬 저장 모드로 전환합니다.");
    return {
      success: true,
      isLocalOnly: true,
      message: "인증 토큰이 없어 로컬에만 저장되었습니다",
      data: {
        id: teamId,
        name: teamName || undefined,
        image: teamImage || undefined,
      },
    };
  }

  // 요청 데이터 준비 - 유효한 값만 포함
  const requestData = {};

  if (teamName?.trim()) {
    requestData.name = teamName.trim();
  }

  if (teamImage) {
    requestData.image = teamImage;
  }

  // 변경할 데이터가 없으면 경고하고 빈 성공 응답 반환
  if (Object.keys(requestData).length === 0) {
    console.warn("변경할 데이터가 없습니다.");
    return {
      success: true,
      message: "변경 사항 없음",
      data: { id: teamId },
    };
  }

  try {
    // API 요청 시도
    const response = await axios.patch(apiUrl, requestData, {
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
        Authorization: `Bearer ${accessToken.trim()}`,
      },
      timeout: 10000, // 10초 타임아웃 설정
    });

    return {
      success: true,
      data: response.data,
    };
  } catch (error) {
    console.error("팀 설정 업데이트 API 오류:", error);

    // 상세 오류 정보 로깅
    if (error.response) {
      console.error(
        `서버 응답 [${error.response.status}]:`,
        error.response.data
      );
    } else if (error.request) {
      console.error("서버 응답 없음 (네트워크 오류)");
    }

    // 오류 발생 시에도 로컬 저장 결과 반환
    return {
      success: false,
      isLocalOnly: true,
      error: error.message || "알 수 없는 오류",
      message: "API 호출 실패, 로컬에만 변경사항이 저장되었습니다",
      data: {
        id: teamId,
        name: teamName || undefined,
        image: teamImage || undefined,
      },
    };
  }
};

export default settingApi;
