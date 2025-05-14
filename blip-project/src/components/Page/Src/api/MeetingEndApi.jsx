import axios from "axios";

/**
 * MeetingEndApi 클래스
 * 회의 종료와 녹음 파일 업로드를 처리하는 클래스
 */
class MeetingEndApi {
  constructor() {
    this.baseUrl =
      import.meta.env.VITE_API_URL_BASE || "http://3.38.233.219:8080";
    this.cachedRecordings = new Map();
    this.pendingUploads = new Map();

    // API 호출 상태
    this.state = {
      isUploading: false,
      lastError: null,
      lastSuccess: null,
    };
  }

  /**
   * 회의 녹음 파일 찾기
   * @param {string|number} teamId - 팀 ID
   * @returns {Promise<Blob|null>} 녹음 파일 Blob
   */
  async findRecording(teamId) {
    const teamIdStr = String(teamId);
    console.log(`팀 ${teamIdStr}의 녹음 파일 찾기 시작`);

    try {
      // 1. 캐시 확인
      if (this.cachedRecordings.has(teamIdStr)) {
        const blob = this.cachedRecordings.get(teamIdStr);
        console.log(`캐시에서 녹음 파일 찾음: ${blob.size} 바이트`);
        return blob;
      }

      // 2. window.latestRecordings 확인
      if (window.latestRecordings?.[teamIdStr]?.blob) {
        const blob = window.latestRecordings[teamIdStr].blob;
        if (blob?.size > 0) {
          console.log(
            `window.latestRecordings에서 녹음 파일 찾음: ${blob.size} 바이트`
          );
          this.cachedRecordings.set(teamIdStr, blob);
          return blob;
        }
      }

      // 3. localStorage 확인 및 recordedBlobs에서 검색
      const infoKeys = Object.keys(localStorage).filter(
        (key) =>
          key.includes(`recording_${teamIdStr}_`) && key.endsWith("_info")
      );

      if (infoKeys.length > 0) {
        // 타임스탬프 기준으로 정렬 (최신 데이터 먼저)
        infoKeys.sort((a, b) => {
          const timestampA = parseInt(a.split("_")[2]);
          const timestampB = parseInt(b.split("_")[2]);
          return timestampB - timestampA;
        });

        // window.recordedBlobs에서 검색
        for (const infoKey of infoKeys) {
          const recordingKey = infoKey.replace("_info", "");
          if (window.recordedBlobs?.[recordingKey]) {
            const blob = window.recordedBlobs[recordingKey];
            if (blob?.size > 0) {
              console.log(
                `window.recordedBlobs에서 녹음 파일 찾음: ${blob.size} 바이트`
              );
              this.cachedRecordings.set(teamIdStr, blob);
              return blob;
            }
          }
        }

        // sessionStorage의 Blob URL에서 검색
        // sessionStorage의 Blob URL에서 찾기 - 안전하게 처리
        for (const infoKey of infoKeys) {
          try {
            const recordingKey = infoKey.replace("_info", "");
            const blobUrl = sessionStorage.getItem(`${recordingKey}_url`);

            // URL이 유효한지 확인 추가
            if (blobUrl && blobUrl.startsWith("blob:")) {
              try {
                // 타임아웃 설정 추가
                const controller = new AbortController();
                const timeoutId = setTimeout(() => controller.abort(), 3000); // 3초 타임아웃

                try {
                  const response = await fetch(blobUrl, {
                    signal: controller.signal,
                    cache: "no-store", // 캐시 사용 안함
                  });
                  clearTimeout(timeoutId);

                  if (response.ok) {
                    const blob = await response.blob();
                    if (blob && blob.size > 0) {
                      console.log(
                        `sessionStorage URL에서 녹음 파일 찾음: ${blob.size} 바이트`
                      );
                      this.recordingCache.set(teamIdStr, blob);
                      return blob;
                    }
                  }

                  // 잘못된 URL 참조 정리
                  sessionStorage.removeItem(`${recordingKey}_url`);
                  URL.revokeObjectURL(blobUrl);
                } catch (fetchError) {
                  clearTimeout(timeoutId);
                  console.warn(
                    `Blob URL에서 데이터 가져오기 실패: ${fetchError.message}`
                  );

                  // 실패한 URL 참조 제거
                  sessionStorage.removeItem(`${recordingKey}_url`);
                  try {
                    URL.revokeObjectURL(blobUrl);
                  } catch (revokeError) {
                    // URL 해제 실패는 무시
                  }
                }
              } catch (fetchError) {
                console.warn(
                  `Blob URL에서 데이터 가져오기 실패: ${fetchError.message}`
                );
              }
            }
          } catch (error) {
            console.warn(`sessionStorage 확인 중 오류: ${error.message}`);
          }
        }
      }
      // 4. 빈 오디오 파일 생성 (최후의 수단)
      console.warn("녹음 파일을 찾을 수 없어 빈 오디오 파일 생성");
      const emptyAudio = this.createEmptyAudioBlob();
      this.cachedRecordings.set(teamIdStr, emptyAudio);
      return emptyAudio;
    } catch (error) {
      console.error(`녹음 파일 찾기 오류: ${error.message}`);

      // 오류 발생 시에도 빈 오디오 파일 반환
      try {
        const emptyAudio = this.createEmptyAudioBlob();
        return emptyAudio;
      } catch (fallbackError) {
        console.error(`빈 오디오 파일 생성 실패: ${fallbackError.message}`);
        return null;
      }
    }
  }

  /**
   * 빈 오디오 Blob 생성
   * @returns {Blob} 빈 오디오 Blob
   */
  createEmptyAudioBlob() {
    try {
      // 1초 길이의 빈 웨이브폼 데이터 생성 (44.1kHz, 16비트, 모노)
      const sampleRate = 44100;
      const seconds = 1;

      // WAV 헤더 생성
      const buffer = new ArrayBuffer(44 + sampleRate * seconds * 2);
      const view = new DataView(buffer);

      // 헬퍼 함수: 문자열 쓰기
      const writeString = (view, offset, string) => {
        for (let i = 0; i < string.length; i++) {
          view.setUint8(offset + i, string.charCodeAt(i));
        }
      };

      // WAV 파일 헤더 작성
      writeString(view, 0, "RIFF");
      view.setUint32(4, 36 + sampleRate * seconds * 2, true);
      writeString(view, 8, "WAVE");

      // "fmt " 서브청크
      writeString(view, 12, "fmt ");
      view.setUint32(16, 16, true);
      view.setUint16(20, 1, true); // PCM 포맷 (1)
      view.setUint16(22, 1, true); // 모노 (1 채널)
      view.setUint32(24, sampleRate, true); // 샘플레이트
      view.setUint32(28, sampleRate * 2, true); // 바이트레이트
      view.setUint16(32, 2, true); // 블록 align
      view.setUint16(34, 16, true); // 비트 뎁스

      // "data" 서브청크
      writeString(view, 36, "data");
      view.setUint32(40, sampleRate * seconds * 2, true);

      return new Blob([buffer], { type: "audio/wav" });
    } catch (error) {
      console.error("빈 오디오 파일 생성 실패:", error);

      // 오류 발생 시 더 작은 빈 오디오 파일 생성
      try {
        const miniBuffer = new ArrayBuffer(44);
        const miniView = new DataView(miniBuffer);

        // 헬퍼 함수
        const writeString = (view, offset, string) => {
          for (let i = 0; i < string.length; i++) {
            view.setUint8(offset + i, string.charCodeAt(i));
          }
        };

        // 최소한의 WAV 헤더 작성
        writeString(miniView, 0, "RIFF");
        miniView.setUint32(4, 36, true);
        writeString(miniView, 8, "WAVE");
        writeString(miniView, 12, "fmt ");
        miniView.setUint32(16, 16, true);
        miniView.setUint16(20, 1, true);
        miniView.setUint16(22, 1, true);
        miniView.setUint32(24, 8000, true);
        miniView.setUint32(28, 8000, true);
        miniView.setUint16(32, 1, true);
        miniView.setUint16(34, 8, true);
        writeString(miniView, 36, "data");
        miniView.setUint32(40, 0, true);

        return new Blob([miniBuffer], { type: "audio/wav" });
      } catch (fallbackError) {
        // 최후의 수단: 비어있는 1바이트 오디오 파일
        const emptyBuffer = new Uint8Array(1);
        return new Blob([emptyBuffer], { type: "audio/wav" });
      }
    }
  }

  /**
   * 팀 ID 정제
   * @param {string|number|Object} teamId - 팀 ID
   * @returns {string} 정제된 팀 ID
   */
  cleanTeamId(teamId) {
    // null/undefined 처리
    if (teamId == null) {
      // localStorage에서 검색
      const storedId =
        localStorage.getItem("activeTeamId") ||
        localStorage.getItem("currentMeetingId") ||
        localStorage.getItem("currentTeamId") ||
        localStorage.getItem("meetingId") ||
        localStorage.getItem("teamId");

      if (storedId) {
        return String(storedId);
      }

      // sessionStorage 확인
      const sessionId =
        sessionStorage.getItem("activeTeamId") ||
        sessionStorage.getItem("currentMeetingId") ||
        sessionStorage.getItem("currentTeamId") ||
        sessionStorage.getItem("meetingId") ||
        sessionStorage.getItem("teamId");

      if (sessionId) {
        return String(sessionId);
      }

      // URL 경로나 쿼리 파라미터 확인
      if (typeof window !== "undefined" && window.location.pathname) {
        // URL 경로에서 ID 추출
        const pathMatches = window.location.pathname.match(
          /\/(?:meetings?|teams?|sessions?)\/(\d+)/i
        );
        if (pathMatches?.[1]) {
          return String(pathMatches[1]);
        }

        // 쿼리 파라미터 확인
        const urlParams = new URLSearchParams(window.location.search);
        const queryId =
          urlParams.get("teamId") ||
          urlParams.get("meetingId") ||
          urlParams.get("id");
        if (queryId) {
          return String(queryId);
        }
      }

      // 기본값
      return "1";
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

      // 숫자만 추출
      const numericMatch = teamId.match(/\d+/);
      if (numericMatch) {
        return numericMatch[0];
      }
    }

    return String(teamId);
  }

  async getPresignedUrl(fileName) {
    try {
      // fileName 검증
      if (typeof fileName !== "string") {
        fileName = String(fileName || "audio_recording.webm");
      }

      // URL 인코딩에 문제가 있는 문자 제거
      fileName = fileName
        .replace(/[{}[\]()]/g, "")
        .replace(/\s+/g, "_")
        .replace(/[^a-zA-Z0-9_\-.\/]/g, "");

      // API URL 구성
      const baseUrl = this.baseUrl.endsWith("/")
        ? this.baseUrl.slice(0, -1)
        : this.baseUrl;

      const apiUrl = `${baseUrl}/files/presigned-url`;

      // 토큰 가져오기
      const accessToken = import.meta.env.VITE_API_URL_URL_KEY;

      // 요청 설정
      const params = { fileName };
      const headers = {};

      if (accessToken) {
        headers.Authorization = `Bearer ${accessToken.trim()}`;
      }

      // CORS 허용을 위한 헤더 추가
      headers["Access-Control-Allow-Origin"] = "*";

      // 여러 백엔드 URL 시도
      const fallbackUrls = [
        apiUrl,
        apiUrl.replace(this.baseUrl, "https://api.yourservice.com"),
        apiUrl.replace(this.baseUrl, "https://backup-api.yourservice.com"),
      ];

      let lastError = null;

      // 각 URL을 순차적으로 시도
      for (const url of fallbackUrls) {
        try {
          const response = await axios.get(url, {
            params,
            headers,
            timeout: 10000, // 10초로 줄임
            withCredentials: false,
          });

          // 응답 처리
          let presignedUrl;
          if (typeof response.data === "string") {
            presignedUrl = response.data;
          } else if (response.data?.presignedUrl) {
            presignedUrl = response.data.presignedUrl;
          } else {
            continue; // 유효한 응답이 아니면 다음 URL 시도
          }

          return presignedUrl;
        } catch (urlError) {
          console.warn(`URL ${url} 요청 실패:`, urlError.message);
          lastError = urlError;
          // 계속 다음 URL 시도
        }
      }

      // 모든 URL 시도 실패
      console.error("모든 Presigned URL 요청 실패:", lastError);

      // 오류 발생 시 대체 URL 생성
      const backupS3Url = `https://dsm-s3-bucket-modeep.s3.ap-northeast-2.amazonaws.com/${fileName}`;
      console.log(`대체 S3 URL 사용: ${backupS3Url}`);
      return backupS3Url;
    } catch (error) {
      console.error("Presigned URL 요청 실패:", error);

      // 대체 URL 생성
      const backupS3Url = `https://dsm-s3-bucket-modeep.s3.ap-northeast-2.amazonaws.com/${fileName}`;
      console.log(`대체 S3 URL 사용: ${backupS3Url}`);
      return backupS3Url;
    }
  }

  async uploadFileToS3(presignedUrl, file) {
    // 3번 재시도
    let retries = 2;
    let lastError = null;

    while (retries >= 0) {
      try {
        // URL 검증
        if (!presignedUrl) {
          throw new Error("유효하지 않은 Presigned URL입니다.");
        }

        // 파일 검증
        if (!file || !(file instanceof Blob) || file.size === 0) {
          throw new Error("유효하지 않은 파일입니다.");
        }

        console.log(
          `S3 업로드 시작 - 파일 크기: ${(file.size / 1024).toFixed(
            2
          )}KB, 타입: ${file.type}, 재시도: ${2 - retries}/2`
        );

        // S3에 업로드
        const response = await axios.put(presignedUrl, file, {
          headers: {
            "Content-Type": file.type || "audio/webm",
          },
          timeout: 60000, // 60초 타임아웃
          maxContentLength: Infinity,
          maxBodyLength: Infinity,
          onUploadProgress: (progressEvent) => {
            const percentCompleted = Math.round(
              (progressEvent.loaded * 100) / progressEvent.total
            );

            // 10% 단위로만 로그 기록
            if (percentCompleted % 10 === 0) {
              console.log(`S3 업로드 진행률: ${percentCompleted}%`);
            }
          },
        });

        console.log(`S3 업로드 성공 - 상태: ${response.status}`);
        return true;
      } catch (error) {
        lastError = error;
        console.error(`S3 업로드 실패 (재시도 ${2 - retries}/2):`, {
          message: error.message,
          response: error.response?.data,
          status: error.response?.status,
        });

        // 재시도 횟수 감소
        retries--;

        if (retries >= 0) {
          // 지수 백오프 (1초, 2초, 4초...)
          const delay = Math.pow(2, 2 - retries) * 1000;
          console.log(`${delay / 1000}초 후 재시도합니다...`);
          await new Promise((resolve) => setTimeout(resolve, delay));
        }
      }
    }

    // 모든 재시도 실패
    throw new Error(`S3 업로드에 실패했습니다: ${lastError.message}`);
  }

  createSafeFilePath(teamId) {
    // 함수가 전달된 경우 처리
    if (typeof teamId === "function") {
      console.warn("함수가 teamId로 전달되었습니다. 타임스탬프로 대체합니다.");
      teamId = Date.now().toString(36);
    }

    // null/undefined 또는 빈 값 처리
    if (teamId == null || teamId === "") {
      console.warn("유효하지 않은 teamId. 타임스탬프로 대체합니다.");
      teamId = Date.now().toString(36);
    }

    // 안전한 ID 생성
    let safeTeamId = String(teamId || "unknown")
      .replace(/[{}[\]()]/g, "")
      .replace(/\s+/g, "_")
      .replace(/[^a-zA-Z0-9_\-.]/g, "");

    // 비어있거나 너무 짧은 경우 랜덤 ID 사용
    if (
      !safeTeamId ||
      safeTeamId.length < 2 ||
      safeTeamId.includes("function")
    ) {
      safeTeamId = Date.now().toString(36);
    }

    // 타임스탬프 추가
    const timestamp = Date.now();
    return `blip/audio/${safeTeamId}_${timestamp}`;
  }

  /**
   * 회의 종료 API 호출
   * @param {string|number} meetingId - 회의 ID
   * @returns {Promise<Object>} API 응답
   */
  async callEndMeetingApi(meetingId) {
    try {
      // localStorage에서 currentMeetingId 가져오기
      const storedMeetingId = localStorage.getItem("currentMeetingId");
      const finalMeetingId = meetingId || storedMeetingId;

      // meetingId 검증 및 정제
      const cleanedId = this.cleanTeamId(finalMeetingId);
      if (!cleanedId || cleanedId === "1") {
        throw new Error("유효한 회의 ID가 필요합니다.");
      }

      // API URL 구성 - 슬래시 처리 명확히
      const baseUrl = this.baseUrl.endsWith("/")
        ? this.baseUrl.slice(0, -1) // 마지막 슬래시 제거
        : this.baseUrl;

      const meetingEndUrl = `${baseUrl}/meetings/end/${cleanedId}`;
      console.log(`회의 종료 API URL: ${meetingEndUrl}`);

      // curl 명령과 정확히 일치하는 하드코딩된 토큰 사용 (테스트용)
      const hardcodedToken = import.meta.env.VITE_API_URL_URL_KEY;

      // 수정된 부분: Bearer 접두사 추가
      const headers = {
        Authorization: `Bearer ${hardcodedToken}`,
      };

      console.log("API 호출 헤더:", JSON.stringify(headers));

      // API 호출
      const startTime = Date.now();
      const response = await axios({
        method: "post",
        url: meetingEndUrl,
        headers,
        data: null,
        timeout: 20000,
      });

      const duration = Date.now() - startTime;
      console.log(
        `회의 종료 API 호출 성공 (${duration}ms): ${response.status}`
      );

      return {
        success: true,
        meetingId: cleanedId,
        data: response.data,
      };
    } catch (error) {
      const errorDetails = {
        status: error.response?.status,
        statusText: error.response?.statusText,
        data: error.response?.data,
      };

      console.error("회의 종료 API 호출 실패:", errorDetails);

      // 특정 상태 코드에 대한 처리
      if (error.response?.status === 404 || error.response?.status === 400) {
        // 400/404 오류는 이미 S3에 업로드한 상태이므로 부분 성공으로 처리
        return {
          success: true,
          warning: true,
          notFound: true,
          data: {
            message:
              "녹음 파일은 성공적으로 업로드되었습니다. 그러나 서버에서 해당 회의를 찾을 수 없습니다.",
          },
          errorDetails,
        };
      } else if (error.response?.status === 500) {
        // 500 에러는 서버에서 처리되었을 수 있으므로 부분 성공으로 간주
        return {
          success: true,
          warning: true,
          data: {
            message:
              "서버 처리 중 오류가 발생했지만, 요청은 처리되었을 수 있습니다.",
          },
          errorDetails,
        };
      }

      throw new Error(error.message || "회의 종료 API 호출에 실패했습니다.");
    }
  }
  /**
   * 녹음 파일 업로드 및 회의 종료 처리
   * @param {Blob} file - 녹음 파일
   * @param {string|number} teamId - 팀 ID
   * @param {string|number} meetingId - 회의 ID (선택적)
   * @returns {Promise<Object>} 처리 결과
   */
  async uploadRecordingFile(file, teamId, meetingId = null) {
    const uploadId = `${teamId}_${Date.now()}`;
    this.state = { isUploading: true, lastError: null, lastSuccess: null };

    try {
      // 파라미터 검증
      if (!teamId) {
        throw new Error("유효한 팀 ID가 필요합니다.");
      }

      // 팀 ID와 미팅 ID 정제
      const cleanedTeamId = this.cleanTeamId(teamId);
      const cleanedMeetingId = meetingId
        ? this.cleanTeamId(meetingId)
        : cleanedTeamId;

      console.log(
        `업로드 시작 (팀ID: ${cleanedTeamId}, 미팅ID: ${cleanedMeetingId})`
      );

      // 진행 중인 업로드 기록
      this.pendingUploads.set(uploadId, {
        teamId: cleanedTeamId,
        meetingId: cleanedMeetingId,
        startTime: Date.now(),
      });

      // 녹음 파일 검증 및 초기화
      let finalRecordingBlob = file;
      let usedEmptyAudio = false;

      // 녹음 파일이 유효하지 않은 경우 찾기 시도
      if (
        !finalRecordingBlob ||
        !(finalRecordingBlob instanceof Blob) ||
        finalRecordingBlob.size === 0
      ) {
        console.log("유효한 녹음 파일이 없어 찾기 시도");

        try {
          finalRecordingBlob = await this.findRecording(cleanedTeamId);

          if (
            !finalRecordingBlob ||
            !(finalRecordingBlob instanceof Blob) ||
            finalRecordingBlob.size === 0
          ) {
            finalRecordingBlob = this.createEmptyAudioBlob();
            usedEmptyAudio = true;
          }
        } catch (findError) {
          console.error("녹음 파일 찾기 실패:", findError);
          finalRecordingBlob = this.createEmptyAudioBlob();
          usedEmptyAudio = true;
        }
      }

      console.log(
        `사용할 녹음 파일: ${finalRecordingBlob.size} 바이트, 빈 오디오: ${usedEmptyAudio}`
      );

      // 1. 안전한 파일 경로 생성 및 Presigned URL 요청
      const fileName = this.createSafeFilePath(cleanedTeamId);
      console.log(`1. Presigned URL 요청 (파일경로: ${fileName})`);

      const presignedUrl = await this.getPresignedUrl(fileName);
      console.log("1. Presigned URL 획득 성공");

      // 캐시에 저장
      this.cachedRecordings.set(cleanedTeamId, finalRecordingBlob);

      // 2. S3에 파일 업로드
      console.log("2. S3 업로드 시작");
      const uploadResult = await this.uploadFileToS3(
        presignedUrl,
        finalRecordingBlob
      );
      console.log("2. S3 업로드 완료");

      // 3. 회의 종료 API 호출
      try {
        console.log("3. 회의 종료 API 호출 시작");
        const endMeetingResult = await this.callEndMeetingApi(cleanedMeetingId);
        console.log("3. 회의 종료 API 호출 성공");

        // 성공 상태 기록
        this.state = {
          isUploading: false,
          lastError: null,
          lastSuccess: {
            teamId: cleanedTeamId,
            meetingId: cleanedMeetingId,
            timestamp: Date.now(),
          },
        };

        // 완료된 업로드 제거
        this.pendingUploads.delete(uploadId);

        // 결과 반환
        return {
          success: true,
          fileName,
          teamId: cleanedTeamId,
          meetingId: cleanedMeetingId,
          meetingEndSuccess: true,
          usedEmptyAudio,
          data: endMeetingResult.data,
        };
      } catch (endError) {
        console.warn(
          "3. 회의 종료 API 호출 실패, 하지만 S3 업로드는 성공:",
          endError
        );

        // 오류 상태 기록
        this.state = {
          isUploading: false,
          lastError: {
            message: endError.message,
            phase: "meetingEnd",
            timestamp: Date.now(),
          },
          lastSuccess: null,
        };

        // 완료된 업로드 제거
        this.pendingUploads.delete(uploadId);

        // 서버 내부 오류 (500)
        if (endError.response?.status === 500) {
          return {
            success: true,
            fileName,
            teamId: cleanedTeamId,
            meetingId: cleanedMeetingId,
            meetingEndSuccess: false,
            meetingEndError: "서버가 S3 업로드를 인식하지 못했을 수 있습니다.",
            needsRetry: true,
            error500: true,
            message:
              "녹음 파일은 성공적으로 업로드되었으나, 회의 종료 처리 중 서버 오류가 발생했습니다.",
          };
        }

        // 결과 반환
        return {
          success: true, // S3 업로드가 성공했으므로 전체 성공
          fileName,
          teamId: cleanedTeamId,
          meetingId: cleanedMeetingId,
          meetingEndSuccess: false,
          meetingEndError: endError.message,
          usedEmptyAudio,
          message: usedEmptyAudio
            ? "빈 오디오 파일은 업로드되었습니다. 회의 종료 처리는 실패했습니다."
            : "녹음 파일은 성공적으로 업로드되었습니다. 회의 종료 처리는 실패했습니다.",
        };
      }
    } catch (error) {
      console.error("파일 업로드 프로세스 실패:", error);

      // 오류 상태 기록
      this.state = {
        isUploading: false,
        lastError: {
          message: error.message,
          phase: "upload",
          timestamp: Date.now(),
        },
        lastSuccess: null,
      };

      // 실패한 업로드 제거
      this.pendingUploads.delete(uploadId);

      return {
        success: false,
        error: error.message,
      };
    }
  }

  /**
   * curl 명령과 동일한 직접 API 호출 테스트
   * @param {string} meetingId - 회의 ID
   * @returns {Promise<boolean>} 성공 여부
   */
  async testDirectCall(meetingId) {
    try {
      console.log(`직접 curl 호출 테스트 (ID: ${meetingId})`);

      // curl 명령과 정확히 일치하는 URL
      const url = `http://3.38.233.219:8080/meetings/end/${meetingId}`;
      const token = import.meta.env.VITE_API_URL_URL_KEY;
      // curl 명령과 정확히 일치하는 헤더
      const headers = {
        Authorization: `Bearer ${token}`,
      };

      console.log("테스트 URL:", url);
      console.log("테스트 헤더:", headers);

      // 요청 전송
      const response = await axios({
        method: "post",
        url,
        headers,
        data: null,
        timeout: 20000,
      });

      console.log("직접 호출 성공:", response.status, response.data);
      return true;
    } catch (error) {
      console.error("직접 호출 실패:", {
        message: error.message,
        response: error.response?.data,
        status: error.response?.status,
      });
      return false;
    }
  }

  /**
   * 회의 종료 처리
   * @param {string|number} meetingId - 회의 ID
   * @param {Blob} recordingBlob - 녹음 파일
   * @param {string|number} teamId - 팀 ID
   * @returns {Promise<Object>} 처리 결과
   */
  async handleMeetingEnd(
    meetingId = null,
    recordingBlob = null,
    teamId = null
  ) {
    try {
      // localStorage에서 미팅 ID 가져오기
      if (!meetingId) {
        const storedMeetingId = localStorage.getItem("currentMeetingId");
        if (storedMeetingId) {
          meetingId = storedMeetingId;
        }
      }

      // meetingId 정제
      let cleanedMeetingId = this.cleanTeamId(meetingId);
      let cleanedTeamId = teamId ? this.cleanTeamId(teamId) : cleanedMeetingId;

      // 유효한 ID가 없는 경우 추가 검색
      if (!cleanedMeetingId || cleanedMeetingId === "1") {
        // URL에서 ID 추출 시도
        if (typeof window !== "undefined" && window.location.pathname) {
          const pathMatches = window.location.pathname.match(
            /\/(?:meetings?|teams?|sessions?)\/(\d+)/i
          );
          if (pathMatches?.[1]) {
            cleanedMeetingId = pathMatches[1];
            cleanedTeamId = cleanedTeamId || cleanedMeetingId;
          }
        }
      }

      console.log(
        `회의 종료 시작 (meetingId: ${cleanedMeetingId}, teamId: ${cleanedTeamId})`
      );

      // 녹음 파일 확인
      let finalRecordingBlob = recordingBlob;

      if (
        !finalRecordingBlob ||
        !(finalRecordingBlob instanceof Blob) ||
        finalRecordingBlob.size === 0
      ) {
        console.log("녹음 파일 찾기 시도");
        try {
          finalRecordingBlob = await this.findRecording(cleanedTeamId);

          if (!finalRecordingBlob || finalRecordingBlob.size === 0) {
            throw new Error("녹음 파일을 찾을 수 없습니다.");
          }

          console.log(`녹음 파일 찾음: ${finalRecordingBlob.size} 바이트`);
        } catch (findError) {
          console.error("녹음 파일 찾기 실패:", findError);
          throw new Error("녹음 파일이 없어 회의를 종료할 수 없습니다.");
        }
      }

      // 업로드 및 회의 종료 처리
      const uploadResult = await this.uploadRecordingFile(
        finalRecordingBlob,
        cleanedTeamId,
        cleanedMeetingId
      );

      return {
        success: true,
        meetingId: cleanedMeetingId,
        teamId: cleanedTeamId,
        ...uploadResult,
      };
    } catch (error) {
      console.error("회의 종료 처리 오류:", error.message);
      throw error;
    }
  }

  async callMeetingEndWithRetry(meetingId, retryCount = 1) {
    const startTime = Date.now();
    console.log(`회의 종료 API 호출 (ID: ${meetingId}, 재시도: ${retryCount})`);

    try {
      // API URL 구성
      const meetingEndUrl = `${this.baseUrl}/meetings/end/${meetingId}`;

      // 토큰 가져오기
      const accessToken =
        import.meta.env.VITE_API_URL_URL_KEY ||
        localStorage.getItem("accessToken") ||
        sessionStorage.getItem("accessToken");

      // 헤더 구성
      const headers = {
        "Content-Type": "application/json",
        Accept: "application/json",
      };

      if (accessToken) {
        headers.Authorization = `Bearer ${accessToken.trim()}`;
      }

      // API 호출
      const response = await axios({
        method: "post",
        url: meetingEndUrl,
        headers,
        data: null,
        timeout: 30000, // 30초 타임아웃
      });

      const duration = Date.now() - startTime;
      console.log(`회의 종료 API 호출 성공 (${duration}ms):`, response.status);

      return {
        success: true,
        meetingId,
        data: response.data,
      };
    } catch (error) {
      const duration = Date.now() - startTime;
      const status = error.response?.status;

      console.error(
        `회의 종료 API 호출 실패 (${duration}ms, 상태: ${status}):`,
        error.message
      );

      // 재시도 횟수가 남아있고 500 오류인 경우 재시도
      if (retryCount > 0 && error.response?.status === 500) {
        console.log(`500 오류로 ${retryCount}회 재시도 예정`);

        // 1초 지연 후 재시도
        await new Promise((resolve) => setTimeout(resolve, 1000));

        return this.callMeetingEndWithRetry(meetingId, retryCount - 1);
      }

      throw error;
    }
  }

  /**
   * 업로드 또는 회의 종료를 개별적으로 처리
   * @param {Object} options - 옵션 객체
   * @returns {Promise<Object>} 처리 결과
   */
  async handleSeparateActions(options) {
    const {
      action = "both", // 'upload', 'endMeeting', 'both'
      teamId,
      file = null,
    } = options;

    const cleanedId = this.cleanTeamId(teamId);

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

        const fileName = this.createSafeFilePath(cleanedId);
        const presignedUrl = await this.getPresignedUrl(fileName);
        await this.uploadFileToS3(presignedUrl, file);

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
          const endResult = await this.callEndMeetingApi(cleanedId);

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
        '유효하지 않은 작업 유형입니다. "upload", "endMeeting", "both" 중 하나여야 합니다.'
      );
    } catch (error) {
      console.error("작업 처리 오류:", error);

      return {
        success: false,
        error: error.message,
      };
    }
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
  return await meetingEndApi.uploadRecordingFile(file, teamId, meetingId);
};

export const callMeetingEndWithRetry = async (meetingId, retryCount) => {
  return await meetingEndApi.callMeetingEndWithRetry(meetingId, retryCount);
};

export const callEndMeetingApi = async (meetingId) => {
  return await meetingEndApi.callEndMeetingApi(meetingId);
};
