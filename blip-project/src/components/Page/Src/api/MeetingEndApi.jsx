import axios from "axios";

/**
 * MeetingEndApi 클래스
 * 회의 종료와 녹음 파일 업로드를 처리하는 클래스
 */
class MeetingEndApi {
  constructor() {
    // baseUrl에서 trailing slash 제거
    this.baseUrl = (
      import.meta.env.VITE_API_URL_BASE || "http://3.38.233.219:8080"
    ).replace(/\/$/, "");
    this.cachedRecordings = new Map();
    this.pendingUploads = new Map();
    this.state = {
      isUploading: false,
      lastError: null,
      lastSuccess: null,
    };
  }

  /**
   * 팀 ID 정제 - 함수 처리 포함
   */
  cleanTeamId(teamId) {
    // 함수가 전달된 경우
    if (typeof teamId === "function") {
      console.warn("teamId로 함수가 전달되었습니다. 적절한 값으로 대체합니다.");
      // localStorage에서 ID를 가져오거나 기본값 사용
      const storedId =
        localStorage.getItem("activeTeamId") ||
        localStorage.getItem("currentMeetingId") ||
        localStorage.getItem("currentTeamId") ||
        "1";
      return String(storedId);
    }

    // null/undefined 처리
    if (teamId == null) {
      // localStorage에서 검색
      const storedId =
        localStorage.getItem("activeTeamId") ||
        localStorage.getItem("currentMeetingId") ||
        localStorage.getItem("currentTeamId") ||
        "1";
      return String(storedId);
    }

    // 객체인 경우
    if (typeof teamId === "object" && teamId !== null) {
      return String(
        teamId?.id || teamId?.teamId || teamId?.meetingId || teamId
      );
    }

    // 문자열 형태의 "create-숫자" 패턴 처리
    if (typeof teamId === "string") {
      if (teamId.includes("create-")) {
        const match = teamId.match(/create-(\d+)/);
        if (match?.[1]) {
          return match[1];
        }
      }
    }

    return String(teamId);
  }

  /**
   * 녹음 파일 유효성 검사 강화
   */
  isValidBlob(blob) {
    console.log("녹음 파일 유효성 검사:", {
      isBlob: blob instanceof Blob,
      size: blob?.size || 0,
      type: blob?.type || "unknown",
    });

    return (
      blob &&
      blob instanceof Blob &&
      blob.size > 0 &&
      (blob.type.startsWith("audio/") ||
        blob.type === "application/octet-stream")
    );
  }

  /**
   * 토큰 가져오기 메서드
   */
  getAuthToken() {
    // localStorage에서 토큰 가져오기
    const token = import.meta.env.VITE_API_URL_URL_KEY;
    // 토큰이 없으면 경고 로그
    if (!token) {
      console.warn(
        "인증 토큰을 찾을 수 없습니다. localStorage의 'accessToken' 또는 'token'을 확인하세요."
      );
    }

    return token;
  }

  /**
   * URL 정규화 헬퍼 함수 - 중복 슬래시 제거
   */
  normalizeUrl(url) {
    // 연속된 슬래시를 하나로 변환 (http://나 https:// 다음의 슬래시는 유지)
    return url.replace(/(https?:\/\/)|(\/)+/g, function (match) {
      if (match.startsWith("http")) return match; // http:// 또는 https:// 유지
      return "/"; // 다른 연속 슬래시는 하나로 변환
    });
  }

  /**
   * API 요청 헬퍼 함수 - 오류 처리 및 재시도 로직 포함
   */
  async makeApiRequest(method, url, data = null, config = {}, retries = 2) {
    // URL 정규화
    const normalizedUrl = this.normalizeUrl(url);
    console.log(`API 요청 시작: ${method} ${normalizedUrl}`);

    // 기본 설정과 사용자 설정 병합
    const mergedConfig = {
      timeout: 20000, // 타임아웃 증가
      ...config,
    };

    let lastError = null;

    // 재시도 로직
    for (let attempt = 0; attempt <= retries; attempt++) {
      try {
        if (attempt > 0) {
          console.log(
            `재시도 ${attempt}/${retries}: ${method} ${normalizedUrl}`
          );
        }

        // 요청 수행
        const response = await axios({
          method,
          url: normalizedUrl,
          data,
          ...mergedConfig,
        });

        console.log(
          `API 요청 성공: ${method} ${normalizedUrl} 상태 코드=${response.status}`
        );
        return response;
      } catch (error) {
        lastError = error;
        console.error(
          `API 요청 실패 (시도 ${attempt + 1}/${retries + 1}):`,
          error.message
        );

        // 타임아웃이나 네트워크 오류의 경우에만 재시도
        if (
          error.code !== "ECONNABORTED" &&
          error.code !== "ERR_NETWORK" &&
          attempt >= retries
        ) {
          break;
        }

        // 재시도 전 지연
        if (attempt < retries) {
          const delay = Math.min(1000 * Math.pow(2, attempt), 5000); // 지수 백오프
          console.log(`${delay}ms 후 재시도...`);
          await new Promise((resolve) => setTimeout(resolve, delay));
        }
      }
    }

    throw lastError;
  }

  /**
   * PresignedURL 요청 - API 명세에 맞게 수정
   */
  async getPresignedUrl(fileName) {
    console.log(`PresignedURL 요청 시작 - 파일명: ${fileName}`);

    try {
      const apiUrl = `${this.baseUrl}/files/presigned-url`;
      const params = { fileName };
      const token = this.getAuthToken();
      const headers = token
        ? {
            Authorization: `Bearer ${token}`,
          }
        : {};

      console.log("PresignedURL 요청 정보:", { apiUrl, fileName });

      const response = await this.makeApiRequest("get", apiUrl, null, {
        params,
        headers,
      });

      const presignedUrl = response.data;
      console.log(`PresignedURL 획득 성공: ${presignedUrl}`);

      return presignedUrl;
    } catch (error) {
      console.error("PresignedURL 요청 실패:", error);
      throw new Error(`PresignedURL 요청에 실패했습니다: ${error.message}`);
    }
  }

  /**
   * S3 파일 업로드
   */
  async uploadFileToS3(presignedUrl, file) {
    console.log(`S3 업로드 시작 - URL: ${presignedUrl}`);
    console.log("파일 정보:", {
      type: file?.type,
      size: file?.size,
      isBlob: file instanceof Blob,
    });

    if (!presignedUrl) {
      throw new Error("유효한 PresignedURL이 없습니다");
    }

    if (!this.isValidBlob(file)) {
      throw new Error("유효한 파일이 없습니다");
    }

    try {
      // S3 업로드는 재시도 로직 없이 직접 axios 사용
      const response = await axios.put(presignedUrl, file, {
        headers: {
          "Content-Type": file.type || "audio/webm",
        },
        timeout: 60000, // S3 업로드는 타임아웃 값 증가
        maxContentLength: Infinity,
        onUploadProgress: (progressEvent) => {
          const percentCompleted = Math.round(
            (progressEvent.loaded * 100) / progressEvent.total
          );
          console.log(`업로드 진행률: ${percentCompleted}%`);
        },
      });

      console.log(`S3 업로드 성공: 상태 코드=${response.status}`);
      return true;
    } catch (error) {
      console.error("S3 업로드 실패:", error);
      throw new Error(`S3 업로드에 실패했습니다: ${error.message}`);
    }
  }

  /**
   * 회의 종료 API 호출
   */
  async callEndMeetingApi(meetingId, audioFilePath) {
    // ID 정제
    const cleanedId =
      localStorage.getItem("currentMeetingId") || this.cleanTeamId(meetingId);
    console.log(`회의 종료 API 호출 준비: meetingId=${cleanedId}`);

    // 토큰 가져오기
    const token = this.getAuthToken();

    if (!token) {
      console.error("인증 토큰이 없어 회의 종료 API를 호출할 수 없습니다.");
      return {
        success: false,
        warning: true,
        meetingId: cleanedId,
        message:
          "인증 토큰이 없어 회의 종료 처리를 할 수 없습니다. 다시 로그인해 주세요.",
      };
    }

    const meetingEndUrl = `${this.baseUrl}/meetings/end/${cleanedId}`;
    const headers = {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    };

    console.log(`회의 종료 API 호출: ${meetingEndUrl}`);
    console.log(
      "사용되는 Authorization 헤더:",
      headers.Authorization.replace(/Bearer (.{6}).+(.{4})/, "Bearer $1...$2")
    );

    // 오디오 파일 경로 로깅
    if (audioFilePath) {
      console.log(`오디오 파일 경로: ${audioFilePath}`);
    }

    try {
      // 향상된 API 요청 함수 사용 (재시도 로직 포함)
      const response = await this.makeApiRequest(
        "post",
        meetingEndUrl,
        null,
        {
          headers,
          timeout: 30000, // 타임아웃 30초로 증가
        },
        2
      );

      console.log(`회의 종료 API 성공: 상태 코드=${response.status}`);
      console.log("회의 종료 API 응답:", response.data);

      return {
        success: true,
        meetingId: cleanedId,
        data: response.data,
      };
    } catch (error) {
      console.error("회의 종료 API 실패:", error);

      // 응답 데이터 확인
      if (error.response) {
        console.error("에러 응답 데이터:", error.response.data);
        console.error("에러 상태 코드:", error.response.status);
        console.error("에러 헤더:", error.response.headers);

        // 401 에러인 경우 특별 처리
        if (error.response.status === 401) {
          console.error(
            "401 인증 오류 발생: 토큰이 만료되었거나 유효하지 않습니다."
          );
          return {
            success: false,
            warning: true,
            unauthorized: true,
            meetingId: cleanedId,
            message: "인증에 실패했습니다. 다시 로그인해 주세요.",
          };
        }

        // 500 에러인 경우 특별 처리
        if (error.response.status === 500) {
          console.error("500 서버 오류 발생: 서버에서 예외가 발생했습니다.");
          // 오류 메시지 추출 시도
          const errorMessage =
            error.response.data?.message ||
            error.response.data?.error ||
            "서버 내부 오류가 발생했습니다";
          return {
            success: false,
            warning: true,
            serverError: true,
            meetingId: cleanedId,
            message: `회의 종료 처리 중 서버 오류가 발생했습니다: ${errorMessage}`,
            originalError: error.response.data,
          };
        }
      }

      // 타임아웃이나 네트워크 오류인 경우
      if (error.code === "ECONNABORTED") {
        return {
          success: false,
          warning: true,
          timeout: true,
          meetingId: cleanedId,
          message:
            "회의 종료 API 요청 시간이 초과되었습니다. 네트워크 연결을 확인하세요.",
        };
      }

      if (error.code === "ERR_NETWORK") {
        return {
          success: false,
          warning: true,
          networkError: true,
          meetingId: cleanedId,
          message: "네트워크 오류가 발생했습니다. 인터넷 연결을 확인하세요.",
        };
      }

      // 기타 오류
      return {
        success: false,
        warning: true,
        meetingId: cleanedId,
        message:
          "녹음 파일은 성공적으로 업로드되었으나, 회의 종료 처리 중 오류가 발생했습니다: " +
          error.message,
      };
    }
  }

  /**
   * 이전 코드의 녹음 파일 찾기 로직을 사용하는 함수
   */
  async findRecordingBlob(teamId) {
    // ID 정제
    const cleanedTeamId = this.cleanTeamId(teamId);
    console.log(`녹음 파일 찾기 시작: teamId=${cleanedTeamId}`);

    try {
      // 캐시 확인
      if (this.cachedRecordings.has(cleanedTeamId)) {
        const cachedBlob = this.cachedRecordings.get(cleanedTeamId);
        if (this.isValidBlob(cachedBlob)) {
          console.log(`캐시에서 녹음 찾음: ${cachedBlob.size} 바이트`);
          return cachedBlob;
        }
      }

      // 최근 녹음 데이터 찾기 (window.latestRecordings)
      if (window.latestRecordings && window.latestRecordings[cleanedTeamId]) {
        const latestRecording = window.latestRecordings[cleanedTeamId].blob;

        if (this.isValidBlob(latestRecording)) {
          console.log(
            `window.latestRecordings에서 녹음 찾음: ${latestRecording.size} 바이트`
          );
          // 캐시에 저장
          this.cachedRecordings.set(cleanedTeamId, latestRecording);
          return latestRecording;
        } else {
          console.warn("window.latestRecordings에서 찾은 녹음이 유효하지 않음");
        }
      }

      // localStorage 검색 (recording_teamId_*)
      const infoKeys = Object.keys(localStorage).filter(
        (key) =>
          key.startsWith(`recording_${cleanedTeamId}_`) && key.endsWith("_info")
      );

      if (infoKeys.length > 0) {
        console.log(`localStorage에서 녹음 정보 키 ${infoKeys.length}개 발견`);

        // 타임스탬프로 정렬
        infoKeys.sort((a, b) => {
          const timestampA = parseInt(a.split("_")[2]);
          const timestampB = parseInt(b.split("_")[2]);
          return timestampB - timestampA;
        });

        // 가장 최근 키
        const latestKey = infoKeys[0].replace("_info", "");
        console.log(`최신 녹음 키: ${latestKey}`);

        // window.recordedBlobs에서 검색
        if (window.recordedBlobs && window.recordedBlobs[latestKey]) {
          const recordedBlob = window.recordedBlobs[latestKey];

          if (this.isValidBlob(recordedBlob)) {
            console.log(
              `window.recordedBlobs에서 녹음 찾음: ${recordedBlob.size} 바이트`
            );
            // 캐시에 저장
            this.cachedRecordings.set(cleanedTeamId, recordedBlob);
            return recordedBlob;
          } else {
            console.warn("window.recordedBlobs에서 찾은 녹음이 유효하지 않음");
          }
        }

        // sessionStorage에서 URL 확인
        const blobUrl = sessionStorage.getItem(`${latestKey}_url`);
        if (blobUrl) {
          console.log(`sessionStorage에서 Blob URL 발견: ${blobUrl}`);

          try {
            // Blob URL을 fetch하여 파일 가져오기 시도
            const response = await fetch(blobUrl);
            const blob = await response.blob();

            if (this.isValidBlob(blob)) {
              console.log(`Blob URL에서 파일 가져옴: ${blob.size} 바이트`);
              // 캐시에 저장
              this.cachedRecordings.set(cleanedTeamId, blob);
              return blob;
            }
          } catch (fetchError) {
            console.warn("Blob URL에서 파일 가져오기 실패:", fetchError);
          }
        }
      }

      // 임시 녹음 파일 생성 시도
      console.log("녹음 파일을 찾을 수 없어 임시 파일 생성");
      const emptyAudio = this.createEmptyAudioBlob();
      this.cachedRecordings.set(cleanedTeamId, emptyAudio);

      console.log(`임시 녹음 파일 생성됨: ${emptyAudio.size} 바이트`);
      return emptyAudio;
    } catch (error) {
      console.error("녹음 파일 찾기 실패:", error);
      throw error;
    }
  }

  /**
   * 전체 업로드 프로세스
   */
  async uploadRecordingFile(file, teamId) {
    // ID 정제
    const cleanedTeamId = this.cleanTeamId(teamId);
    console.log(`uploadRecordingFile 호출됨: teamId=${cleanedTeamId}`);
    const cleanId = localStorage.getItem("currentMeetingId");

    if (!cleanedTeamId) {
      throw new Error("유효한 팀 ID가 필요합니다");
    }

    if (!this.isValidBlob(file)) {
      throw new Error("유효한 녹음 파일이 필요합니다");
    }

    try {
      console.log(
        `녹음 파일 업로드: 팀 ID=${cleanedTeamId}, 파일 크기=${file.size} 바이트`
      );

      // 1. 파일 이름 생성
      // Postman 응답을 참고하여 meeting_[ID].mp3 형태로 변경
      const fileName = `blip/audio/meeting_${cleanId}.mp3`;
      console.log(`파일 경로: ${fileName}`);

      // 2. PresignedURL 요청
      const presignedUrl = await this.getPresignedUrl(fileName);

      // 3. S3 업로드
      const uploadSuccess = await this.uploadFileToS3(presignedUrl, file);

      if (!uploadSuccess) {
        throw new Error("S3 업로드에 실패했습니다");
      }

      // 4. 회의 종료 API 호출
      console.log("회의 종료 API 호출 시작");
      const endResult = await this.callEndMeetingApi(cleanedTeamId, fileName);

      // 결과 반환
      return {
        success: endResult.success !== false,
        teamId: cleanedTeamId,
        fileName,
        uploadSuccess: true,
        meetingEndSuccess: !endResult.warning,
        warning: endResult.warning,
        unauthorized: endResult.unauthorized,
        serverError: endResult.serverError,
        timeout: endResult.timeout,
        networkError: endResult.networkError,
        message:
          endResult.message ||
          (endResult.warning
            ? "녹음 파일은 성공적으로 업로드되었으나, 회의 종료 처리 중 오류가 발생했습니다"
            : "회의가 성공적으로 종료되었습니다"),
        originalError: endResult.originalError,
      };
    } catch (error) {
      console.error("업로드 프로세스 실패:", error);

      return {
        success: false,
        error: error.message,
      };
    }
  }

  /**
   * 회의 종료 처리
   */
  async handleMeetingEnd(
    meetingId = null,
    recordingBlob = null,
    teamId = null
  ) {
    try {
      // ID 정제
      const cleanedMeetingId = this.cleanTeamId(meetingId);
      const cleanedTeamId = this.cleanTeamId(teamId || meetingId);

      if (!cleanedMeetingId) {
        throw new Error("유효한 회의 ID가 필요합니다");
      }

      console.log(
        `회의 종료 시작: meetingId=${cleanedMeetingId}, teamId=${cleanedTeamId}`
      );

      // 녹음 파일 확인
      let finalRecordingBlob = recordingBlob;

      // 녹음 파일이 없거나 유효하지 않으면 찾기 시도
      if (!this.isValidBlob(finalRecordingBlob)) {
        console.log("녹음 파일이 유효하지 않아 찾기 시도");

        try {
          finalRecordingBlob = await this.findRecordingBlob(cleanedTeamId);
          console.log(`녹음 파일 찾음: ${finalRecordingBlob.size} 바이트`);
        } catch (findError) {
          console.error("녹음 파일 찾기 실패:", findError.message);
          throw new Error("녹음 파일이 없어 회의를 종료할 수 없습니다");
        }
      }

      // 최종 녹음 파일 유효성 검사
      if (!this.isValidBlob(finalRecordingBlob)) {
        throw new Error("유효한 녹음 파일이 없습니다");
      }

      // 업로드 및 회의 종료 처리
      return await this.uploadRecordingFile(finalRecordingBlob, cleanedTeamId);
    } catch (error) {
      console.error("회의 종료 처리 오류:", error.message);
      throw error;
    }
  }

  /**
   * 임시 녹음 파일 생성 (긴급 상황용)
   */
  createEmptyAudioBlob() {
    console.log("임시 녹음 파일 생성 중...");

    // 간단한 웨이브폼 데이터 생성 (1초 길이, 44.1kHz, 모노)
    const sampleRate = 44100;
    const seconds = 1;
    const buffer = new ArrayBuffer(44 + sampleRate * seconds * 2);
    const view = new DataView(buffer);

    // WAV 헤더 작성
    const writeString = (view, offset, string) => {
      for (let i = 0; i < string.length; i++) {
        view.setUint8(offset + i, string.charCodeAt(i));
      }
    };

    writeString(view, 0, "RIFF");
    view.setUint32(4, 36 + sampleRate * seconds * 2, true);
    writeString(view, 8, "WAVE");
    writeString(view, 12, "fmt ");
    view.setUint32(16, 16, true);
    view.setUint16(20, 1, true); // PCM 포맷
    view.setUint16(22, 1, true); // 모노
    view.setUint32(24, sampleRate, true);
    view.setUint32(28, sampleRate * 2, true);
    view.setUint16(32, 2, true);
    view.setUint16(34, 16, true);
    writeString(view, 36, "data");
    view.setUint32(40, sampleRate * seconds * 2, true);

    // 간단한 사인파 생성
    for (let i = 0; i < sampleRate * seconds; i++) {
      const value = Math.sin(i * 0.01) * 0x7fff;
      view.setInt16(44 + i * 2, value, true);
    }

    return new Blob([buffer], { type: "audio/wav" });
  }
}

// 싱글톤 인스턴스 생성 및 내보내기
const meetingEndApi = new MeetingEndApi();
export default meetingEndApi;

// 인스턴스에 바인딩된 함수 내보내기
export const handleMeetingEnd = async (meetingId, recordingBlob, teamId) => {
  return await meetingEndApi.handleMeetingEnd(meetingId, recordingBlob, teamId);
};

export const uploadRecordingFile = async (file, teamId, meetingId) => {
  return await meetingEndApi.uploadRecordingFile(file, teamId || meetingId);
};

export const callEndMeetingApi = async (meetingId) => {
  return await meetingEndApi.callEndMeetingApi(meetingId);
};

export const isValidRecordingFile = (file) => {
  return meetingEndApi.isValidBlob(file);
};
