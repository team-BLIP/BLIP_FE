import axios from "axios";

const getSummaryApi = async (teamId) => {
  console.log("getSummaryApi 호출 - teamId:", teamId);

  try {
    alert(`팀 ID ${teamId}의 요약 정보 요청 성공!`);
    const apiUrl = import.meta.env.VITE_API_URL_BASE;
    if (!apiUrl) {
      throw new Error("API URL이 설정되지 않았습니다");
    }

    const requestUrl = `${apiUrl}teams/${teamId}`;
    console.log("요청 URL:", requestUrl);

    const accessToken = import.meta.env.VITE_API_URL_URL_KEY;
    if (!accessToken) {
      throw new Error("인증 토큰이 설정되지 않았습니다");
    }

    // axios 요청 설정 - JSON 형식 명시
    const config = {
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
        Authorization: `Bearer ${accessToken}`,
      },
      responseType: "json",
    };

    console.log("API 요청 시작");
    const response = await axios.get(requestUrl, config);

    // 응답 데이터가 문자열인 경우 JSON으로 파싱
    let data = response.data;
    if (typeof data === "string") {
      try {
        data = JSON.parse(data);
      } catch (e) {
        console.warn("응답 데이터 JSON 파싱 실패. 원본 응답 사용:", e);
      }
    }

    console.log("API 요청 성공:", data);
    return data;
  } catch (error) {
    console.error("회의 요약 API 요청 실패:", error);

    if (error.response) {
      console.error("서버 응답:", error.response.status);
      console.error("응답 데이터:", error.response.data);
    } else if (error.request) {
      console.error("서버 응답 없음");
    }

    throw error;
  }
};

const getMeetingSummaryApi = async (teamId, meetingId) => {
  console.log(
    "getMeetingSummaryApi 호출 - teamId:",
    teamId,
    "meetingId:",
    meetingId
  );

  try {
    const apiUrl = import.meta.env.VITE_API_URL_BASE;
    if (!apiUrl) {
      throw new Error("API URL이 설정되지 않았습니다");
    }

    const requestUrl = `${apiUrl}teams/${teamId}/meetings/${meetingId}`;
    console.log("요청 URL:", requestUrl);

    const accessToken = import.meta.env.VITE_API_URL_URL_KEY;
    if (!accessToken) {
      throw new Error("인증 토큰이 설정되지 않았습니다");
    }

    // axios 요청 설정 - JSON 형식 명시
    const config = {
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
        Authorization: `Bearer ${accessToken}`,
      },
      responseType: "json",
    };

    console.log("API 요청 시작");
    const response = await axios.get(requestUrl, config);

    // 응답 데이터가 문자열인 경우 JSON으로 파싱
    let data = response.data;
    if (typeof data === "string") {
      try {
        data = JSON.parse(data);
      } catch (e) {
        console.warn("응답 데이터 JSON 파싱 실패. 원본 응답 사용:", e);
      }
    }

    console.log("API 요청 성공:", data);
    return data;
  } catch (error) {
    console.error("특정 회의 요약 API 요청 실패:", error);

    if (error.response) {
      console.error("서버 응답:", error.response.status);
      console.error("응답 데이터:", error.response.data);
    } else if (error.request) {
      console.error("서버 응답 없음");
    }

    throw error;
  }
};

const createUpdateSummaryApi = async (teamId, summaryData) => {
  console.log("createUpdateSummaryApi 호출 - teamId:", teamId);
  console.log("전송할 데이터:", summaryData);

  try {
    const apiUrl = import.meta.env.VITE_API_URL_BASE;
    if (!apiUrl) {
      throw new Error("API URL이 설정되지 않았습니다");
    }

    const requestUrl = `${apiUrl}teams/${teamId}/summary`;
    console.log("요청 URL:", requestUrl);

    const accessToken = import.meta.env.VITE_API_URL_URL_KEY;
    if (!accessToken) {
      throw new Error("인증 토큰이 설정되지 않았습니다");
    }

    // axios 요청 설정 - JSON 형식 명시
    const config = {
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
        Authorization: `Bearer ${accessToken}`,
      },
    };

    // 데이터를 JSON 문자열로 변환
    const jsonData = JSON.stringify(summaryData);
    console.log("JSON 문자열화된 데이터:", jsonData);

    console.log("API POST 요청 시작");
    const response = await axios.post(requestUrl, jsonData, config);

    // 응답 데이터가 문자열인 경우 JSON으로 파싱
    let data = response.data;
    if (typeof data === "string") {
      try {
        data = JSON.parse(data);
      } catch (e) {
        console.warn("응답 데이터 JSON 파싱 실패. 원본 응답 사용:", e);
      }
    }

    console.log("API 요청 성공:", data);
    return data;
  } catch (error) {
    console.error("요약 생성/업데이트 API 요청 실패:", error);

    if (error.response) {
      console.error("서버 응답:", error.response.status);
      console.error("응답 데이터:", error.response.data);
    } else if (error.request) {
      console.error("서버 응답 없음");
    }

    throw error;
  }
};

export { getSummaryApi, getMeetingSummaryApi, createUpdateSummaryApi };
