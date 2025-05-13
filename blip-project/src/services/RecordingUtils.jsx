// src/services/RecordingUtils.js
import axios from "axios";

/**
 * Presigned URL 요청 함수
 * @param {string} fileName - 파일 이름 (경로 포함)
 * @returns {Promise<string>} - Presigned URL
 */
export const getPresignedUrl = async (fileName) => {
  try {
    // 환경 변수에서 기본 URL 가져오기
    const baseUrl = import.meta.env.VITE_API_URL_BASE?.endsWith("/")
      ? import.meta.env.VITE_API_URL_BASE.slice(0, -1)
      : import.meta.env.VITE_API_URL_BASE || "";

    // API URL 구성
    const apiUrl = `${baseUrl}/files/presigned-url`;
    console.log("Presigned URL 요청 API URL:", apiUrl); // API URL 출력

    // 토큰 가져오기
    const accessToken = import.meta.env.VITE_API_URL_URL_KEY;
    if (!accessToken) {
      throw new Error("인증 토큰이 없습니다. 로그인이 필요합니다.");
    }

    // Presigned URL 요청
    const response = await axios.get(apiUrl, {
      params: { fileName },
      headers: {
        Authorization: `Bearer ${accessToken.trim()}`,
      },
      timeout: 10000, // 10초 타임아웃
    });

    console.log("Presigned URL 응답 원본:", response.data); // 응답 데이터 원본 출력

    // 응답 검증 및 반환
    let presignedUrl;
    if (typeof response.data === "string") {
      presignedUrl = response.data;
    } else if (response.data && response.data.presignedUrl) {
      presignedUrl = response.data.presignedUrl;
    } else {
      throw new Error("서버 응답에서 유효한 Presigned URL을 찾을 수 없습니다.");
    }

    console.log("추출된 Presigned URL:", presignedUrl); // 추출된 URL 출력
    return presignedUrl;
  } catch (error) {
    console.error("Presigned URL 요청 실패:", error);
    throw new Error(`Presigned URL 요청에 실패했습니다: ${error.message}`);
  }
};

/**
 * S3에 파일 업로드 함수
 * @param {string} presignedUrl - S3 Presigned URL
 * @param {Blob} file - 업로드할 파일
 * @returns {Promise<boolean>} - 업로드 성공 여부
 */
export const uploadFileToS3 = async (presignedUrl, file) => {
  try {
    // URL 검증
    if (!presignedUrl) {
      throw new Error("유효하지 않은 Presigned URL입니다.");
    }

    // 파일 검증
    if (!file || !(file instanceof Blob) || file.size === 0) {
      throw new Error("유효하지 않은 파일입니다.");
    }

    console.log("S3 업로드 시작...");
    console.log("사용된 presigned URL:", presignedUrl); // presigned URL 출력

    // S3에 업로드
    const response = await axios.put(presignedUrl, file, {
      headers: {
        "Content-Type": file.type || "audio/webm",
      },
      timeout: 30000, // 30초 타임아웃 (큰 파일 업로드를 위해)
    });

    console.log("S3 업로드 성공:", response.status);
    console.log("S3 업로드 응답:", response.data); // 응답 데이터 출력 (있는 경우)
    return true;
  } catch (error) {
    // 자세한 오류 정보 기록
    console.error("S3 업로드 상세 오류:", {
      message: error.message,
      response: error.response?.data,
      status: error.response?.status,
      url: error.config?.url,
    });

    throw new Error(`S3 업로드에 실패했습니다: ${error.message}`);
  }
};

/**
 * 파일 업로드 및 회의 종료 처리 함수
 * @param {Blob} file - 업로드할 녹음 파일
 * @param {string|number} teamId - 팀 ID
 * @returns {Promise<Object>} - 처리 결과
 */
export const uploadRecordingFile = async (file, teamId) => {
  // 파라미터 검증
  if (!teamId) {
    console.error("유효한 팀 ID가 필요합니다.");
    return { success: false, error: "유효한 팀 ID가 필요합니다." };
  }

  if (!file || !(file instanceof Blob) || file.size === 0) {
    console.error("업로드할 유효한 녹음 파일이 필요합니다.");
    return {
      success: false,
      error: "업로드할 유효한 녹음 파일이 필요합니다.",
    };
  }

  // 파일 크기 및 타입 로깅
  console.log(`파일 업로드 시작: 크기 ${file.size} 바이트, 타입 ${file.type}`);

  // 파일 경로 구성
  const fileName = `blip/audio/${teamId}`;

  try {
    console.log("파일 업로드 시작:", fileName);
    console.log("파일 정보:", {
      size: file.size,
      type: file.type,
      teamId: teamId,
    });

    // 1. Presigned URL 요청
    const presignedUrl = await getPresignedUrl(fileName);
    if (!presignedUrl) {
      throw new Error("Presigned URL을 획득하지 못했습니다.");
    }
    console.log("Presigned URL 획득 성공:", presignedUrl);

    // 2. S3에 파일 업로드
    const uploadResult = await uploadFileToS3(presignedUrl, file);
    if (!uploadResult) {
      throw new Error("S3 업로드에 실패했습니다.");
    }
    console.log("S3 업로드 완료");

    // 3. 파일 업로드 성공 후 회의 종료 API 호출
    try {
      // 포스트맨에서 성공한 URL 직접 사용
      const meetingEndUrl = `http://3.38.233.219:8080/meetings/end/${teamId}`;
      console.log("회의 종료 API URL:", meetingEndUrl);

      // 토큰 가져오기
      const accessToken = import.meta.env.VITE_API_URL_URL_KEY;
      if (!accessToken) {
        throw new Error("인증 토큰이 없습니다. 로그인이 필요합니다.");
      }

      console.log("회의 종료 API 호출 준비:", meetingEndUrl);

      // 포스트맨과 동일한 요청 본문과 헤더 사용
      const headers = {
        Authorization: `Bearer ${accessToken.trim()}`,
      };
      console.log("회의 종료 API 호출 헤더:", headers);

      // 회의 종료 API 호출
      try {
        const response = await axios.post(meetingEndUrl, null, {
          headers: headers,
          timeout: 15000, // 타임아웃 증가
        });

        console.log("회의 종료 API 호출 성공:", response.data);

        return {
          success: true,
          fileName,
          meetingEndSuccess: true,
          data: response.data,
        };
      } catch (apiError) {
        console.error("회의 종료 API 호출 실패:", apiError);
        console.error("API 오류 상세 정보:", {
          status: apiError.response?.status,
          statusText: apiError.response?.statusText,
          data: apiError.response?.data,
          headers: apiError.response?.headers,
        });

        // S3 업로드는 성공했으므로 부분 성공으로 처리
        return {
          success: true, // S3 업로드가 성공했으므로 전체 성공
          fileName,
          meetingEndSuccess: false,
          meetingEndError: apiError.message,
          message:
            "녹음 파일은 성공적으로 업로드되었습니다. 회의 종료 처리는 서버에서 완료됩니다.",
        };
      }
    } catch (endError) {
      console.error("회의 종료 API 호출 준비 중 오류:", endError);

      // S3 업로드는 성공했으므로 부분 성공으로 처리
      return {
        success: true, // S3 업로드가 성공했으므로 전체 성공으로 간주
        fileName,
        meetingEndSuccess: false,
        meetingEndError: endError.message,
        message:
          "녹음 파일은 성공적으로 업로드되었습니다. 회의 종료 처리는 서버에서 완료됩니다.",
      };
    }
  } catch (error) {
    console.error("파일 업로드 프로세스 실패:", error);
    return { success: false, error: error.message };
  }
};

/**
 * 녹음 파일 유효성 검사 함수
 * @param {Blob} file - 검사할 파일
 * @returns {boolean} - 유효성 여부
 */
export const isValidRecordingFile = (file) => {
  return (
    file &&
    file instanceof Blob &&
    file.size > 0 &&
    (file.type === "audio/webm" ||
      file.type === "audio/mpeg" ||
      file.type.startsWith("audio/"))
  );
};

/**
 * 로컬 스토리지에서 녹음 데이터 찾기
 * @param {string|number} teamId - 팀 ID
 * @returns {Object|null} - 찾은 녹음 데이터 정보
 */
export const findLatestRecordingInfo = (teamId) => {
  if (!teamId) return null;

  // 로컬 스토리지에서 해당 팀의 녹음 정보 키 찾기
  const infoKeys = Object.keys(localStorage).filter(
    (key) => key.startsWith(`recording_${teamId}_`) && key.endsWith("_info")
  );

  if (infoKeys.length === 0) return null;

  // 타임스탬프 기준으로 정렬 (최신 데이터 먼저)
  infoKeys.sort((a, b) => {
    const timestampA = parseInt(a.split("_")[2]);
    const timestampB = parseInt(b.split("_")[2]);
    return timestampB - timestampA; // 내림차순
  });

  // 가장 최근 녹음 정보 가져오기
  const latestInfoKey = infoKeys[0];
  const infoJson = localStorage.getItem(latestInfoKey);

  try {
    const info = JSON.parse(infoJson);
    return {
      ...info,
      key: latestInfoKey.replace("_info", ""),
    };
  } catch (error) {
    console.error("녹음 정보 파싱 실패:", error);
    return null;
  }
};

export default {
  getPresignedUrl,
  uploadFileToS3,
  uploadRecordingFile,
  isValidRecordingFile,
  findLatestRecordingInfo,
};
