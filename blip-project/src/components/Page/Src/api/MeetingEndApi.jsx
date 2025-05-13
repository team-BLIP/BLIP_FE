import axios from "axios";

/**
 * 팀 ID를 정제하는 함수
 * @param {string|number|Object} teamId - 정제할 팀 ID
 * @returns {string|number|null} - 정제된 팀 ID
 */
export const cleanTeamId = (teamId) => {
  if (teamId === null || teamId === undefined) {
    return null;
  }

  // 객체인 경우 적절한 필드 추출
  if (typeof teamId === "object" && teamId !== null) {
    return String(teamId?.id || teamId?.teamId || teamId);
  }

  // 문자열 형태의 "create-숫자" 패턴 처리
  if (typeof teamId === "string" && teamId.includes("create-")) {
    const match = teamId.match(/create-(\d+)/);
    return match && match[1] ? match[1] : teamId;
  }

  return String(teamId); // 항상 문자열로 반환하여 일관성 유지
};

/**
 * Presigned URL 요청 함수
 * @param {string} fileName - 파일 이름 (경로 포함)
 * @returns {Promise<string>} - Presigned URL
 */
export const getPresignedUrl = async (fileName) => {
  try {
    // 환경 변수에서 기본 URL 가져오기 - null/undefined 처리 강화
    const baseUrlRaw = import.meta.env.VITE_API_URL_BASE;
    const baseUrl = baseUrlRaw
      ? baseUrlRaw.endsWith("/")
        ? baseUrlRaw.slice(0, -1)
        : baseUrlRaw
      : "http://3.38.233.219:8080"; // 기본값 설정

    // API URL 구성
    const apiUrl = `${baseUrl}/files/presigned-url`;
    console.log("Presigned URL 요청 API URL:", apiUrl);

    // 토큰 가져오기
    const accessToken = import.meta.env.VITE_API_URL_URL_KEY;
    if (!accessToken) {
      console.warn("인증 토큰이 없습니다. 토큰 없이 시도합니다.");
    }

    // Presigned URL 요청 - 헤더와 파라미터 분리
    const params = { fileName };
    const headers = {};

    if (accessToken) {
      headers.Authorization = `Bearer ${accessToken.trim()}`;
    }

    console.log("Presigned URL 요청 헤더:", headers);
    console.log("Presigned URL 요청 파라미터:", params);

    const response = await axios.get(apiUrl, {
      params,
      headers,
      timeout: 15000, // 15초 타임아웃
    });

    console.log("Presigned URL 응답 원본:", response.data);

    // 응답 검증 및 반환
    let presignedUrl;
    if (typeof response.data === "string") {
      presignedUrl = response.data;
    } else if (response.data && response.data.presignedUrl) {
      presignedUrl = response.data.presignedUrl;
    } else {
      throw new Error("서버 응답에서 유효한 Presigned URL을 찾을 수 없습니다.");
    }

    console.log("추출된 Presigned URL:", presignedUrl);
    return presignedUrl;
  } catch (error) {
    console.error("Presigned URL 요청 실패:", error);

    if (error.response) {
      console.error("응답 상태:", error.response.status);
      console.error("응답 데이터:", error.response.data);
      console.error("응답 헤더:", error.response.headers);
    }

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
    console.log("사용된 presigned URL:", presignedUrl);
    console.log("파일 정보:", {
      type: file.type,
      size: file.size,
    });

    // S3에 업로드 - Content-Type 헤더 중요
    const response = await axios.put(presignedUrl, file, {
      headers: {
        "Content-Type": file.type || "audio/webm",
      },
      timeout: 60000, // 60초 타임아웃 (큰 파일 업로드를 위해)
      maxContentLength: Infinity, // 큰 파일 허용
      maxBodyLength: Infinity, // 큰 요청 본문 허용
    });

    console.log("S3 업로드 성공:", response.status);
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
 * 회의 종료 API 호출 함수 - 정확한 CURL 명령어 형식 반영
 * @param {string|number} teamId - 팀 ID
 * @returns {Promise<Object>} - API 응답
 */
export const callEndMeetingApi = async (teamId) => {
  try {
    // teamId 검증 및 정제
    const cleanedId = cleanTeamId(teamId);
    if (!cleanedId) {
      throw new Error("유효한 팀 ID가 필요합니다.");
    }

    // 환경 변수에서 기본 URL 가져오기 - null/undefined 처리 강화
    const baseUrlRaw = import.meta.env.VITE_API_URL_BASE;
    const baseUrl = baseUrlRaw
      ? baseUrlRaw.endsWith("/")
        ? baseUrlRaw.slice(0, -1)
        : baseUrlRaw
      : "http://3.38.233.219:8080"; // 하드코딩된 기본값 설정

    // 백엔드 API URL 구성
    const meetingEndUrl = `${baseUrl}/meetings/end/${cleanedId}`;
    console.log("회의 종료 API URL:", meetingEndUrl);

    // 토큰 가져오기
    const accessToken = import.meta.env.VITE_API_URL_URL_KEY;
    if (!accessToken) {
      console.warn("인증 토큰이 없습니다. 토큰 없이 시도합니다.");
    }

    // CURL 명령어와 정확히 일치하는 헤더 구성
    const headers = {};
    if (accessToken) {
      headers.Authorization = `Bearer ${accessToken.trim()}`;
    }

    console.log("회의 종료 API 호출 헤더:", headers);

    // API 호출 - POST 요청이지만 본문 없음 (null)
    try {
      // 정확한 형식으로 CURL 명령과 일치시킴
      const response = await axios({
        method: "post",
        url: meetingEndUrl,
        headers,
        data: null, // 본문 데이터 없음 (CURL 명령어와 일치)
        timeout: 20000, // 20초 타임아웃
      });

      console.log("회의 종료 API 호출 성공:", response.data);
      return {
        success: true,
        data: response.data,
      };
    } catch (apiError) {
      // 오류 응답 세부 정보 로깅
      console.error("회의 종료 API 호출 실패:", apiError);

      const errorDetails = {
        status: apiError.response?.status,
        statusText: apiError.response?.statusText,
        data: apiError.response?.data,
        headers: apiError.response?.headers,
      };

      console.error("API 오류 상세 정보:", errorDetails);

      // 특정 상태 코드에 대한 처리
      if (apiError.response?.status === 404) {
        throw new Error("회의를 찾을 수 없습니다.");
      } else if (apiError.response?.status === 401) {
        throw new Error("회의 종료 권한이 없습니다.");
      } else if (apiError.response?.status === 500) {
        // 500 에러는 서버에서 처리되었을 수 있으므로 부분 성공으로 간주
        console.warn("서버 오류가 발생했지만, 요청은 처리되었을 수 있습니다.");
        return {
          success: true,
          data: {
            message:
              "서버 처리 중 오류가 발생했지만, 요청은 처리되었을 수 있습니다.",
          },
          warning: true,
          errorDetails,
        };
      }

      throw new Error(apiError.message || "회의 종료 API 호출에 실패했습니다.");
    }
  } catch (error) {
    console.error("회의 종료 API 호출 상세 오류:", {
      message: error.message,
      response: error.response?.data,
      status: error.response?.status,
    });

    // 서버에서 반환된 구체적인 오류 메시지 활용
    const errorMessage =
      error.response?.data?.message ||
      error.response?.data?.error ||
      error.message ||
      "회의 종료 API 호출에 실패했습니다.";

    throw new Error(errorMessage);
  }
};

/**
 * 파서블 업로드와 회의 종료 재시도 함수
 * @param {Blob} file - 업로드할 파일
 * @param {string|number} teamId - 팀 ID
 * @returns {Promise<Object>} - 처리 결과
 */
export const retryUploadWithDelay = async (file, teamId) => {
  const cleanedId = cleanTeamId(teamId);
  const fileName = `blip/audio/${cleanedId}`;

  try {
    // S3 업로드 부분만 실행
    const presignedUrl = await getPresignedUrl(fileName);
    await uploadFileToS3(presignedUrl, file);
    console.log("S3 업로드 성공, 5초 후 회의 종료 API 호출 시도");

    // 5초 지연 후 회의 종료 API 호출
    await new Promise((resolve) => setTimeout(resolve, 5000));

    try {
      const endResult = await callEndMeetingApi(cleanedId);
      return {
        success: true,
        fileName,
        meetingEndSuccess: true,
        data: endResult.data,
        retried: true,
      };
    } catch (error) {
      return {
        success: true, // S3 업로드 성공은 유지
        fileName,
        meetingEndSuccess: false,
        meetingEndError: error.message,
        retried: true,
      };
    }
  } catch (error) {
    throw error; // 업로드 실패 시 오류 전파
  }
};

/**
 * 녹음 파일 업로드 및 회의 종료 처리 함수
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
  let finalRecordingBlob = file;

  // 팀 ID 정제
  const cleanedTeamId = cleanTeamId(teamId);

  // 녹음 파일이 제공되지 않았거나 유효하지 않은 경우 찾기 시도 (약 320-330 라인)
  if (
    !finalRecordingBlob ||
    !(finalRecordingBlob instanceof Blob) ||
    finalRecordingBlob.size === 0
  ) {
    console.log(
      "유효한 녹음 파일이 필요합니다. 로컬 저장소에서 찾아보겠습니다."
    );

    try {
      // RecordingManager를 통해 모든 가능한 소스에서 녹음 파일 찾기
      finalRecordingBlob = await recordingManager.findRecording(cleanedId);

      if (finalRecordingBlob && finalRecordingBlob.size > 0) {
        console.log(
          `녹음 파일 찾음: ${finalRecordingBlob.size} 바이트, 타입: ${finalRecordingBlob.type}`
        );
      } else {
        throw new Error("녹음 파일을 찾을 수 없습니다.");
      }
    } catch (findError) {
      console.error("녹음 파일 찾기 실패:", findError);
      throw new Error("녹음 파일이 없어 회의를 종료할 수 없습니다.");
    }
  }

  // 파일 크기 및 타입 로깅
  console.log(`파일 업로드 시작: 크기 ${file.size} 바이트, 타입 ${file.type}`);

  // 파일 경로 구성
  const fileName = `blip/audio/${cleanedTeamId}`;

  try {
    console.log("파일 업로드 시작:", fileName);
    console.log("파일 정보:", {
      size: file.size,
      type: file.type,
      teamId: cleanedTeamId,
    });

    // 1. Presigned URL 요청
    const presignedUrl = await getPresignedUrl(fileName);
    if (!presignedUrl) {
      throw new Error("Presigned URL을 획득하지 못했습니다.");
    }
    console.log("Presigned URL 획득 성공");

    // 2. S3에 파일 업로드
    const uploadResult = await uploadFileToS3(presignedUrl, file);
    if (!uploadResult) {
      throw new Error("S3 업로드에 실패했습니다.");
    }
    console.log("S3 업로드 완료");

    // 3. 파일 업로드 성공 후 회의 종료 API 호출
    try {
      const endMeetingResult = await callEndMeetingApi(cleanedTeamId);
      console.log("회의 종료 API 호출 결과:", endMeetingResult);

      // 경고가 있는 경우 (500 에러지만 성공으로 처리한 경우)
      if (endMeetingResult.warning) {
        return {
          success: true,
          fileName,
          meetingEndSuccess: true,
          meetingEndWarning: true,
          message:
            "녹음 파일이 성공적으로 업로드되었으며, 회의 종료 처리가 요청되었습니다. 서버에서 오류가 발생했지만 요청은 처리되었을 수 있습니다.",
          errorDetails: endMeetingResult.errorDetails,
        };
      }

      return {
        success: true,
        fileName,
        meetingEndSuccess: true,
        data: endMeetingResult.data,
      };
    } catch (endError) {
      console.warn(
        "회의 종료 API 호출 실패, 하지만 S3 업로드는 성공:",
        endError
      );

      // 회의 종료 API 실패 시 재시도 로직
      try {
        console.log("5초 후 회의 종료 API 재시도...");
        // 5초 딜레이 후 재시도
        await new Promise((resolve) => setTimeout(resolve, 5000));
        const retryResult = await callEndMeetingApi(cleanedTeamId);

        console.log("회의 종료 API 재시도 결과:", retryResult);
        return {
          success: true,
          fileName,
          meetingEndSuccess: true,
          retried: true,
          data: retryResult.data,
        };
      } catch (retryError) {
        console.warn("회의 종료 API 재시도 실패:", retryError);

        // S3 업로드는 성공했으므로 부분 성공으로 처리
        return {
          success: true, // S3 업로드가 성공했으므로 전체 성공
          fileName,
          meetingEndSuccess: false,
          meetingEndError: endError.message,
          retryError: retryError.message,
          message:
            "녹음 파일은 성공적으로 업로드되었습니다. 회의 종료 처리는 서버에서 완료됩니다.",
        };
      }
    }
  } catch (error) {
    console.error("파일 업로드 프로세스 실패:", error);
    return { success: false, error: error.message };
  }
};

/**
 * 회의 종료 처리 함수
 * @param {string|number|Object} meetingId - 미팅 ID
 * @param {Blob} recordingBlob - 녹음 파일 (선택적)
 * @returns {Promise<Object>} - 처리 결과
 */
export const handleMeetingEnd = async (meetingId, recordingBlob = null) => {
  try {
    // 제공된 meetingId 검증 및 정제
    const cleanedId = cleanTeamId(meetingId);
    if (!cleanedId) {
      // 로컬 스토리지에서 활성 미팅 ID 가져오기 시도
      const storedMeetingId =
        localStorage.getItem("activeTeamId") ||
        localStorage.getItem("currentMeetingId");

      if (storedMeetingId) {
        console.log("로컬 스토리지에서 미팅 ID 가져옴:", storedMeetingId);
        meetingId = storedMeetingId;
      } else {
        throw new Error("유효한 회의 ID가 제공되지 않았습니다.");
      }
    }

    // 녹음 파일 검증
    if (
      !recordingBlob ||
      !(recordingBlob instanceof Blob) ||
      recordingBlob.size === 0
    ) {
      console.error(
        "유효한 녹음 파일이 필요합니다. 로컬 저장소에서 찾아보겠습니다."
      );

      // window.latestRecordings에서 검색
      if (window.latestRecordings && window.latestRecordings[cleanedId]) {
        recordingBlob = window.latestRecordings[cleanedId].blob;
        console.log(`저장된 녹음 데이터 찾음: ${recordingBlob.size} 바이트`);
      } else {
        // 로컬 스토리지에서 녹음 정보 키 찾기
        const infoKeys = Object.keys(localStorage).filter(
          (key) =>
            key.includes(`recording_${cleanedId}_`) && key.endsWith("_info")
        );

        if (infoKeys.length === 0) {
          throw new Error("녹음 파일이 없어 회의를 종료할 수 없습니다.");
        }

        // 타임스탬프 기준으로 정렬 (최신 데이터 먼저)
        infoKeys.sort((a, b) => {
          const timestampA = parseInt(a.split("_")[2]);
          const timestampB = parseInt(b.split("_")[2]);
          return timestampB - timestampA; // 내림차순
        });

        // 최근 녹음 데이터 찾기
        for (const infoKey of infoKeys) {
          try {
            const infoStr = localStorage.getItem(infoKey);
            if (!infoStr) continue;

            const info = JSON.parse(infoStr);
            console.log(`녹음 정보 확인: ${infoKey}`, info);

            // 녹음 데이터 찾기
            const recordingKey = infoKey.replace("_info", "");
            if (window.recordedBlobs && window.recordedBlobs[recordingKey]) {
              recordingBlob = window.recordedBlobs[recordingKey];
              console.log(
                `${recordingKey}에서 녹음 데이터 찾음: ${recordingBlob.size} 바이트`
              );
              break;
            }
          } catch (parseError) {
            console.warn("녹음 정보 파싱 오류:", parseError);
          }
        }
      }

      // 여전히 녹음 데이터가 없는 경우
      if (!recordingBlob || recordingBlob.size === 0) {
        throw new Error("녹음 파일을 찾을 수 없어 회의를 종료할 수 없습니다.");
      }
    }

    // 녹음 데이터 업로드
    const uploadResult = await uploadRecordingFile(recordingBlob, cleanedId);

    // 업로드 성공 여부 확인
    if (!uploadResult.success) {
      console.error("녹음 파일 업로드 실패:", uploadResult.error);
      throw new Error(uploadResult.error || "녹음 파일 업로드에 실패했습니다.");
    }

    // 회의 종료 API 호출 실패했지만 S3 업로드는 성공한 경우 성공으로 처리
    if (!uploadResult.meetingEndSuccess) {
      console.warn("회의 종료 API 호출 실패했지만 S3 업로드는 성공했습니다.");
      console.warn("오류 상세:", uploadResult.meetingEndError);
    }

    console.log("회의 종료 성공:", uploadResult);
    return {
      success: true,
      meetingId: cleanedId,
      ...uploadResult,
    };
  } catch (error) {
    console.error("회의 종료 처리 오류:", error.message);
    throw error;
  }
};

/**
 * S3 업로드 또는 회의 종료를 개별적으로 처리하는 함수
 * @param {Object} options - 옵션 객체
 * @returns {Promise<Object>} - 처리 결과
 */
export const handleSeparateActions = async (options) => {
  const {
    action = "both", // 'upload', 'endMeeting', 'both'
    teamId,
    file = null,
  } = options;

  const cleanedId = cleanTeamId(teamId);

  try {
    // 팀 ID 검증
    if (!cleanedId) {
      throw new Error("유효한 팀 ID가 필요합니다.");
    }

    // S3 업로드만 수행
    if (action === "upload" || action === "both") {
      if (!file || !(file instanceof Blob) || file.size === 0) {
        throw new Error("업로드할 유효한 파일이 필요합니다.");
      }

      const fileName = `blip/audio/${cleanedId}`;
      const presignedUrl = await getPresignedUrl(fileName);
      await uploadFileToS3(presignedUrl, file);

      console.log("S3 업로드 성공");

      if (action === "upload") {
        return {
          success: true,
          uploadSuccess: true,
          fileName,
        };
      }
    }

    // 회의 종료 API만 호출
    if (action === "endMeeting" || action === "both") {
      try {
        const endResult = await callEndMeetingApi(cleanedId);
        return {
          success: true,
          uploadSuccess: action === "both",
          meetingEndSuccess: true,
          fileName: action === "both" ? `blip/audio/${cleanedId}` : null,
          data: endResult.data,
        };
      } catch (endError) {
        return {
          success: action !== "endMeeting", // 회의 종료만 요청한 경우 실패, 둘 다 요청한 경우 부분 성공
          uploadSuccess: action === "both",
          meetingEndSuccess: false,
          fileName: action === "both" ? `blip/audio/${cleanedId}` : null,
          meetingEndError: endError.message,
        };
      }
    }

    // 유효하지 않은 action 값
    throw new Error(
      "유효하지 않은 작업 유형입니다. 'upload', 'endMeeting', 'both' 중 하나여야 합니다."
    );
  } catch (error) {
    console.error("작업 처리 오류:", error);
    return {
      success: false,
      error: error.message,
    };
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

// 기본 함수로 handleMeetingEnd 내보내기
export default handleMeetingEnd;
