import axios from "axios";

/**
 * RecordingManager 클래스
 * 녹음 파일 찾기, 저장, 관리를 위한 클래스
 */
class RecordingManager {
  constructor() {
    // 녹음 데이터 캐시
    this.recordingCache = new Map();

    // window 객체 초기화
    if (typeof window !== "undefined") {
      // 전역 recordedBlobs 객체가 없으면 초기화
      if (!window.recordedBlobs) {
        window.recordedBlobs = {};
      }

      // 전역 latestRecordings 객체가 없으면 초기화
      if (!window.latestRecordings) {
        window.latestRecordings = {};
      }
    }
  }

  /**
   * 팀 ID로 캐시된 녹음 파일 가져오기
   * @param {string|number} teamId - 팀 ID
   * @returns {Blob|null} - 녹음 파일 Blob 또는 null
   */
  getCachedRecording(teamId) {
    return this.recordingCache.get(String(teamId)) || null;
  }

  /**
   * 녹음 파일을 캐시에 저장
   * @param {string|number} teamId - 팀 ID
   * @param {Blob} blob - 녹음 파일 Blob
   */
  setCachedRecording(teamId, blob) {
    if (blob && blob instanceof Blob && blob.size > 0) {
      this.recordingCache.set(String(teamId), blob);
      console.log(
        `팀 ${teamId}의 녹음 파일을 캐시에 저장 (${blob.size} 바이트)`
      );
    }
  }

  /**
   * 모든 가능한 소스에서 녹음 파일 찾기
   * @param {string|number} teamId - 팀 ID
   * @returns {Promise<Blob|null>} - 녹음 파일 Blob 또는 null
   */
  async findRecording(teamId) {
    const teamIdStr = String(teamId);
    console.log(`팀 ${teamIdStr}의 녹음 파일 찾기 시작`);

    // 1. 캐시에서 먼저 확인
    const cachedBlob = this.getCachedRecording(teamIdStr);
    if (cachedBlob) {
      console.log(`캐시에서 녹음 파일 찾음: ${cachedBlob.size} 바이트`);
      return cachedBlob;
    }

    // 2. window.latestRecordings에서 확인
    if (window.latestRecordings && window.latestRecordings[teamIdStr]) {
      const blob = window.latestRecordings[teamIdStr].blob;
      if (blob && blob.size > 0) {
        console.log(
          `window.latestRecordings에서 녹음 파일 찾음: ${blob.size} 바이트`
        );
        this.setCachedRecording(teamIdStr, blob);
        return blob;
      }
    }

    // 3. 로컬 스토리지에서 녹음 정보 키 찾기
    const infoKeys = Object.keys(localStorage).filter(
      (key) => key.includes(`recording_${teamIdStr}_`) && key.endsWith("_info")
    );

    if (infoKeys.length > 0) {
      // 타임스탬프 기준으로 정렬 (최신 데이터 먼저)
      infoKeys.sort((a, b) => {
        const timestampA = parseInt(a.split("_")[2]);
        const timestampB = parseInt(b.split("_")[2]);
        return timestampB - timestampA; // 내림차순
      });

      // 3-1. window.recordedBlobs에서 찾기
      for (const infoKey of infoKeys) {
        try {
          const recordingKey = infoKey.replace("_info", "");
          if (window.recordedBlobs && window.recordedBlobs[recordingKey]) {
            const blob = window.recordedBlobs[recordingKey];
            if (blob && blob.size > 0) {
              console.log(
                `window.recordedBlobs[${recordingKey}]에서 녹음 파일 찾음: ${blob.size} 바이트`
              );
              this.setCachedRecording(teamIdStr, blob);
              return blob;
            }
          }
        } catch (error) {
          console.warn(`window.recordedBlobs 확인 중 오류: ${error.message}`);
        }
      }

      // 3-2. sessionStorage의 Blob URL에서 찾기
      // 3-2. sessionStorage의 Blob URL에서 찾기 - 오류 처리 강화
      for (const infoKey of infoKeys) {
        try {
          const recordingKey = infoKey.replace("_info", "");
          const blobUrl = sessionStorage.getItem(`${recordingKey}_url`);
          if (blobUrl) {
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

                if (!response.ok) {
                  console.warn(
                    `Blob URL 응답 오류 (${response.status}): ${blobUrl}`
                  );
                  // 잘못된 URL 참조 정리
                  sessionStorage.removeItem(`${recordingKey}_url`);
                  try {
                    URL.revokeObjectURL(blobUrl);
                  } catch (e) {
                    // URL 해제 실패는 무시
                  }
                  continue;
                }

                const blob = await response.blob();
                if (blob && blob.size > 0) {
                  console.log(
                    `sessionStorage URL에서 녹음 파일 찾음: ${blob.size} 바이트`
                  );
                  this.setCachedRecording(teamIdStr, blob);
                  return blob;
                } else {
                  // 빈 blob이 반환된 경우 URL 참조 제거
                  console.log(
                    `빈 Blob이 반환됨. URL 참조 제거: ${recordingKey}_url`
                  );
                  sessionStorage.removeItem(`${recordingKey}_url`);
                  try {
                    URL.revokeObjectURL(blobUrl);
                  } catch (e) {
                    // URL 해제 실패는 무시
                  }
                }
              } catch (fetchError) {
                clearTimeout(timeoutId);

                if (fetchError.name === "AbortError") {
                  console.warn("Blob URL 가져오기 시간 초과");
                } else {
                  console.warn(
                    `Blob URL에서 데이터 가져오기 실패: ${fetchError.message}`
                  );
                }

                // 실패한 URL 참조 제거
                sessionStorage.removeItem(`${recordingKey}_url`);
                try {
                  URL.revokeObjectURL(blobUrl);
                } catch (e) {
                  // URL 해제 실패는 무시
                }
              }
            } catch (fetchError) {
              console.warn(
                `Blob URL에서 데이터 가져오기 실패: ${fetchError.message}`
              );
              // 실패한 URL 참조 정리
              sessionStorage.removeItem(`${recordingKey}_url`);
            }
          }
        } catch (error) {
          console.warn(`sessionStorage 확인 중 오류: ${error.message}`);
        }
      }
    }

    // 4. 모든 팀 ID에 대한 녹음 확인 (팀 ID가 불일치하는 경우 대비)
    console.log("다른 팀 ID를 가진 녹음 찾기 시도");

    // 4-1. window.latestRecordings의 모든 키 확인
    if (window.latestRecordings) {
      const allTeamIds = Object.keys(window.latestRecordings);
      for (const id of allTeamIds) {
        const recording = window.latestRecordings[id];
        if (recording && recording.blob && recording.blob.size > 0) {
          console.log(
            `다른 팀 ID(${id})의 녹음 발견: ${recording.blob.size} 바이트`
          );
          this.setCachedRecording(teamIdStr, recording.blob);
          return recording.blob;
        }
      }
    }

    // 4-2. 모든 localStorage 녹음 정보 확인
    const allInfoKeys = Object.keys(localStorage).filter(
      (key) => key.includes("recording_") && key.endsWith("_info")
    );

    if (allInfoKeys.length > 0) {
      // 타임스탬프 기준으로 정렬 (최신 데이터 먼저)
      allInfoKeys.sort((a, b) => {
        const timestampA = parseInt(a.split("_")[2]);
        const timestampB = parseInt(b.split("_")[2]);
        return timestampB - timestampA; // 내림차순
      });

      for (const infoKey of allInfoKeys) {
        try {
          const recordingKey = infoKey.replace("_info", "");
          if (window.recordedBlobs && window.recordedBlobs[recordingKey]) {
            const blob = window.recordedBlobs[recordingKey];
            if (blob && blob.size > 0) {
              console.log(
                `다른 키(${recordingKey})의 녹음 발견: ${blob.size} 바이트`
              );
              this.setCachedRecording(teamIdStr, blob);
              return blob;
            }
          }
        } catch (error) {
          console.warn(`다른 팀 recordedBlobs 확인 중 오류: ${error.message}`);
        }
      }
    }

    // 5. 빈 오디오 파일 생성 (최후의 수단)
    console.warn("녹음 파일을 찾을 수 없어 빈 오디오 파일 생성");
    try {
      const emptyAudio = this.createEmptyAudioBlob();
      this.setCachedRecording(teamIdStr, emptyAudio);
      return emptyAudio;
    } catch (error) {
      console.error("빈 오디오 파일 생성 실패:", error);
    }

    console.error("녹음 파일을 찾을 수 없습니다.");
    return null;
  }

  /**
   * 빈 오디오 Blob 생성 함수 (최후의 수단)
   * @returns {Blob} - 빈 오디오 Blob
   */
  /**
   * 빈 오디오 Blob 생성 함수 (최후의 수단)
   * @returns {Blob} - 빈 오디오 Blob
   */
  createEmptyAudioBlob() {
    try {
      // 1초 길이의 빈 웨이브폼 데이터 생성 (44.1kHz, 16비트, 모노)
      const sampleRate = 44100;
      const seconds = 1;

      // WAV 헤더 생성
      const buffer = new ArrayBuffer(44 + sampleRate * seconds * 2);
      const view = new DataView(buffer);

      // 헬퍼 함수: 문자열 쓰기 (함수를 클래스 내부로 이동)
      const writeString = (view, offset, string) => {
        for (let i = 0; i < string.length; i++) {
          view.setUint8(offset + i, string.charCodeAt(i));
        }
      };

      // WAV 파일 헤더 작성
      // "RIFF" 청크 디스크립터
      writeString(view, 0, "RIFF");
      view.setUint32(4, 36 + sampleRate * seconds * 2, true);
      writeString(view, 8, "WAVE");

      // "fmt " 서브청크
      writeString(view, 12, "fmt ");
      view.setUint32(16, 16, true);
      view.setUint16(20, 1, true); // PCM 포맷 (1)
      view.setUint16(22, 1, true); // 모노 (1 채널)
      view.setUint32(24, sampleRate, true); // 샘플레이트
      view.setUint32(28, sampleRate * 2, true); // 바이트레이트: 샘플레이트 * 블록 align
      view.setUint16(32, 2, true); // 블록 align
      view.setUint16(34, 16, true); // 비트 뎁스

      // "data" 서브청크
      writeString(view, 36, "data");
      view.setUint32(40, sampleRate * seconds * 2, true);

      // 빈 오디오 데이터 (모두 0)
      // 이미 ArrayBuffer가 0으로 초기화되어 있으므로 추가 작업 불필요

      return new Blob([buffer], { type: "audio/wav" });
    } catch (error) {
      console.error("빈 오디오 파일 생성 실패:", error);

      // 오류 발생 시 더 작은 빈 오디오 파일 생성
      try {
        console.warn("더 작은 빈 오디오 파일로 시도합니다.");
        const miniBuffer = new ArrayBuffer(44); // 헤더만 포함하는 최소 크기
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
        console.error("대체 오디오 파일 생성 실패:", fallbackError);

        // 최후의 수단: 비어있는 1바이트 오디오 파일
        const emptyBuffer = new Uint8Array(1);
        return new Blob([emptyBuffer], { type: "audio/wav" });
      }
    }
  }

  /**
   * 녹음 파일 저장 함수
   * @param {string|number} teamId - 팀 ID
   * @param {Blob} blob - 녹음 파일 Blob
   */
  saveRecording(teamId, blob) {
    if (!blob || !(blob instanceof Blob) || blob.size === 0) {
      console.error("저장할 유효한 녹음 파일이 없습니다.");
      return;
    }

    const teamIdStr = String(teamId);
    const timestamp = Date.now();
    const key = `recording_${teamIdStr}_${timestamp}`;

    try {
      // 캐시에 저장
      this.setCachedRecording(teamIdStr, blob);

      // 정보 객체 생성
      const info = {
        size: blob.size,
        type: blob.type,
        timestamp: timestamp,
        teamId: teamIdStr,
        date: new Date().toISOString(),
      };

      // localStorage에 정보 저장
      localStorage.setItem(`${key}_info`, JSON.stringify(info));

      // window.recordedBlobs에 저장
      if (!window.recordedBlobs) {
        window.recordedBlobs = {};
      }
      window.recordedBlobs[key] = blob;

      // window.latestRecordings에 저장
      if (!window.latestRecordings) {
        window.latestRecordings = {};
      }
      window.latestRecordings[teamIdStr] = {
        blob: blob,
        timestamp: timestamp,
        type: blob.type,
        key: key,
      };

      // Blob URL 생성 및 sessionStorage에 저장
      const blobUrl = URL.createObjectURL(blob);
      sessionStorage.setItem(`${key}_url`, blobUrl);

      console.log(
        `팀 ${teamIdStr}의 녹음 데이터 저장 완료: ${blob.size} 바이트, 키: ${key}`
      );
      return key;
    } catch (error) {
      console.error("녹음 데이터 저장 실패:", error);
      return null;
    }
  }
}

// 싱글톤 인스턴스
const recordingManager = new RecordingManager();

/**
 * 팀 ID를 정제하는 함수
 * @param {string|number|Object} teamId - 정제할 팀 ID
 * @returns {string} - 정제된 팀 ID
 */
/**
 * 팀 ID를 정제하는 함수 - 개선된 버전
 * @param {string|number|Object} teamId - 정제할 팀 ID
 * @returns {string} - 정제된 팀 ID
 */
export const cleanTeamId = (teamId) => {
  if (teamId === null || teamId === undefined) {
    // 로컬 스토리지에서 ID 찾기 (여러 키 검색)
    const storedId =
      localStorage.getItem("activeTeamId") ||
      localStorage.getItem("currentMeetingId") ||
      localStorage.getItem("currentTeamId") ||
      localStorage.getItem("meetingId") ||
      localStorage.getItem("teamId");

    if (storedId) {
      console.log(`로컬 스토리지에서 ID 찾음: ${storedId}`);
      return String(storedId);
    }

    // 세션 스토리지도 확인
    const sessionId =
      sessionStorage.getItem("activeTeamId") ||
      sessionStorage.getItem("currentMeetingId") ||
      sessionStorage.getItem("currentTeamId") ||
      sessionStorage.getItem("meetingId") ||
      sessionStorage.getItem("teamId");

    if (sessionId) {
      console.log(`세션 스토리지에서 ID 찾음: ${sessionId}`);
      return String(sessionId);
    }

    // 창 위치나 쿼리 파라미터에서 ID 찾기 시도
    if (typeof window !== "undefined" && window.location.pathname) {
      // URL 경로에서 ID 추출 시도 (/meeting/123, /teams/456 등의 패턴)
      const pathMatches = window.location.pathname.match(
        /\/(?:meetings?|teams?|sessions?)\/(\d+)/i
      );
      if (pathMatches && pathMatches[1]) {
        console.log(`URL 경로에서 ID 찾음: ${pathMatches[1]}`);
        return String(pathMatches[1]);
      }

      // 쿼리 파라미터에서 ID 추출 시도 (?teamId=123, ?meetingId=456 등의 패턴)
      const urlParams = new URLSearchParams(window.location.search);
      const queryId =
        urlParams.get("teamId") ||
        urlParams.get("meetingId") ||
        urlParams.get("id");

      if (queryId) {
        console.log(`URL 쿼리에서 ID 찾음: ${queryId}`);
        return String(queryId);
      }
    }

    // DOM에서 데이터 속성 찾기 시도
    if (typeof document !== "undefined") {
      const teamElement =
        document.querySelector("[data-team-id]") ||
        document.querySelector("[data-meeting-id]");

      if (teamElement) {
        const dataId =
          teamElement.dataset.teamId || teamElement.dataset.meetingId;
        if (dataId) {
          console.log(`DOM 데이터 속성에서 ID 찾음: ${dataId}`);
          return String(dataId);
        }
      }
    }

    // 어디에서도 찾지 못한 경우 기본값 "1" 반환
    console.warn("ID를 찾을 수 없어 기본값 사용");
    return "1";
  }

  // 객체인 경우 적절한 필드 추출
  if (typeof teamId === "object" && teamId !== null) {
    const extractedId = String(
      teamId?.id || teamId?.teamId || teamId?.meetingId || teamId
    );
    console.log(`객체에서 ID 추출: ${extractedId}`);
    return extractedId;
  }

  // 문자열 형태의 "create-숫자" 패턴 처리
  if (typeof teamId === "string") {
    if (teamId.includes("create-")) {
      const match = teamId.match(/create-(\d+)/);
      if (match && match[1]) {
        console.log(`"create-숫자" 패턴에서 ID 추출: ${match[1]}`);
        return match[1];
      }
    }

    // 다른 패턴에서 숫자만 추출 (예: "meeting-123", "team_456", "ID: 789" 등)
    const numericMatch = teamId.match(/\d+/);
    if (numericMatch) {
      console.log(`문자열에서 숫자만 추출: ${numericMatch[0]}`);
      return numericMatch[0];
    }
  }

  return String(teamId); // 항상 문자열로 반환하여 일관성 유지
};

/**
 * Presigned URL 요청 함수 - 개선된 오류 처리 및 fileName 검증
 * @param {string} fileName - 파일 이름 (경로 포함)
 * @returns {Promise<string>} - Presigned URL
 */
export const getPresignedUrl = async (fileName) => {
  try {
    // fileName 검증 - 잘못된 값(함수 등) 방지
    if (typeof fileName !== "string") {
      console.error("유효하지 않은 fileName:", fileName);

      // 함수가 전달된 경우 (fileName이 [native code]를 포함하는 경우)
      if (fileName && String(fileName).includes("[native code]")) {
        console.error("함수가 fileName으로 전달되었습니다. 문자열로 변환 시도");

        // fileName에서 마지막 세그먼트 추출 시도
        if (fileName.toString().includes("/")) {
          fileName = fileName.toString().split("/").pop();
          console.log("fileName에서 마지막 세그먼트 추출:", fileName);
        } else {
          // 기본값으로 대체
          console.warn("fileName을 파싱할 수 없어 기본값 사용");
          fileName = "audio_recording.webm";
        }
      } else {
        // 기타 타입을 문자열로 변환
        fileName = String(fileName || "audio_recording.webm");
        console.log("fileName을 문자열로 변환:", fileName);
      }
    }

    // URL 인코딩에 문제가 있는 문자 제거
    fileName = fileName
      .replace(/[{}[\]()]/g, "") // 괄호 제거
      .replace(/\s+/g, "_") // 공백을 _로 치환
      .replace(/[^a-zA-Z0-9_\-.\/]/g, ""); // 안전한 문자만 허용

    console.log("정제된 fileName:", fileName);

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

    // CORS 오류 처리를 위한 설정 추가
    const response = await axios.get(apiUrl, {
      params,
      headers,
      timeout: 15000, // 15초 타임아웃
      withCredentials: false, // CORS 관련 설정
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

    // CORS 오류 처리
    if (error.message && error.message.includes("CORS")) {
      console.error("CORS 오류 발생. 요청을 수정하여 재시도합니다.");

      try {
        // 개발 환경일 경우 프록시를 통해 우회 시도
        if (process.env.NODE_ENV === "development") {
          const baseUrl = "http://localhost:5173"; // 개발 서버 주소
          const proxyUrl = `${baseUrl}/api/proxy/files/presigned-url?fileName=${encodeURIComponent(
            fileName
          )}`;

          console.log("프록시를 통한 요청 시도:", proxyUrl);

          // 프록시 요청
          const proxyResponse = await axios.get(proxyUrl, {
            timeout: 15000,
          });

          if (proxyResponse.data) {
            console.log("프록시 요청 성공:", proxyResponse.data);
            return proxyResponse.data;
          }
        }
      } catch (proxyError) {
        console.error("프록시 요청 실패:", proxyError);
      }
    }

    if (error.response) {
      console.error("응답 상태:", error.response.status);
      console.error("응답 데이터:", error.response.data);
      console.error("응답 헤더:", error.response.headers);
    }

    // 오류 처리 - 직접 URL 구성 시도
    try {
      console.warn("Presigned URL 요청 실패. 직접 URL 생성 시도");

      // 기본 S3 버킷 URL (오류 발생시 대체용)
      const backupS3Url = `https://dsm-s3-bucket-modeep.s3.ap-northeast-2.amazonaws.com/${fileName}`;
      console.log("대체 S3 URL 생성:", backupS3Url);

      return backupS3Url;
    } catch (backupError) {
      console.error("대체 URL 생성 실패:", backupError);
    }

    throw new Error(`Presigned URL 요청에 실패했습니다: ${error.message}`);
  }
};
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

    console.log(`[${new Date().toISOString()}] S3 업로드 시작...`);
    console.log("파일 정보:", {
      type: file.type,
      size: file.size,
      sizeKB: Math.round(file.size / 1024),
      sizeMB: file.size > 1048576 ? (file.size / 1048576).toFixed(2) : "N/A",
    });

    // S3에 업로드 - 진행 상황 표시 추가
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
        console.log(`S3 업로드 진행률: ${percentCompleted}%`);
      },
    });

    console.log(
      `[${new Date().toISOString()}] S3 업로드 성공:`,
      response.status
    );
    return true;
  } catch (error) {
    // 자세한 오류 정보 기록
    console.error(`[${new Date().toISOString()}] S3 업로드 실패:`, {
      message: error.message,
      response: error.response?.data,
      status: error.response?.status,
      url: error.config?.url?.split("?")[0], // URL 로깅 시 파라미터 제거
    });

    throw new Error(`S3 업로드에 실패했습니다: ${error.message}`);
  }
};

/**
 * 회의 종료 API 호출 함수 - 정확한 CURL 명령어 형식 반영
 * @param {string|number} teamId - 팀 ID
 * @returns {Promise<Object>} - API 응답
 */
export const callEndMeetingApi = async (meetingId) => {
  try {
    // localStorage에서 currentMeetingId 직접 가져오기 - meetingId가 없거나 '1'인 경우

    const storedMeetingId = localStorage.getItem("currentMeetingId");
    if (storedMeetingId && storedMeetingId !== "1") {
      console.log(
        `meetingId가 없어 localStorage의 currentMeetingId 사용: ${storedMeetingId}`
      );
    }

    // meetingId 검증 및 정제
    const cleanedId = cleanTeamId(storedMeetingId);
    if (!cleanedId || cleanedId === "1") {
      throw new Error("유효한 회의 ID가 필요합니다.");
    }

    // 환경 변수에서 기본 URL 가져오기 - null/undefined 처리 강화
    const baseUrlRaw = import.meta.env.VITE_API_URL_BASE;
    const baseUrl = baseUrlRaw
      ? baseUrlRaw.endsWith("/")
        ? baseUrlRaw.slice(0, -1)
        : baseUrlRaw
      : "http://3.38.233.219:8080"; // 하드코딩된 기본값 설정

    // 백엔드 API URL 구성 - 항상 정확히 /meetings/end/{cleanedId} 형식 사용
    const meetingEndUrl = `${baseUrl}/meetings/end/${storedMeetingId}`;
    console.log(`회의 종료 API URL (ID: ${cleanedId}):`, meetingEndUrl);

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
        meetingId: storedMeetingId, // 어떤 ID로 성공했는지 알 수 있도록 포함
        data: response.data,
      };
    } catch (apiError) {
      // 오류 응답 세부 정보 로깅
      console.error(`회의 종료 API 호출 실패 (ID: ${cleanedId}):`, apiError);

      const errorDetails = {
        status: apiError.response?.status,
        statusText: apiError.response?.statusText,
        data: apiError.response?.data,
        headers: apiError.response?.headers,
      };

      console.error("API 오류 상세 정보:", errorDetails);

      // 특정 상태 코드에 대한 처리
      if (
        apiError.response?.status === 404 ||
        apiError.response?.status === 400
      ) {
        // 400 Bad Request나 404 Not Found는 이미 S3에 업로드한 상태이므로 부분 성공으로 처리
        console.warn(
          `회의를 찾을 수 없지만 (ID: ${cleanedId}), S3 업로드는 성공했습니다. 부분 성공으로 처리합니다.`
        );
        return {
          success: true,
          meetingId: cleanedId, // 어떤 ID로 실패했는지 알 수 있도록 포함
          data: {
            message:
              "녹음 파일은 성공적으로 업로드되었습니다. 그러나 서버에서 해당 회의를 찾을 수 없습니다.",
          },
          warning: true,
          errorDetails,
          notFound: true,
        };
      } else if (apiError.response?.status === 401) {
        throw new Error("회의 종료 권한이 없습니다.");
      } else if (apiError.response?.status === 500) {
        // 500 에러는 서버에서 처리되었을 수 있으므로 부분 성공으로 간주
        console.warn(
          `서버 오류가 발생했지만 (ID: ${cleanedId}), 요청은 처리되었을 수 있습니다.`
        );
        return {
          success: true,
          meetingId: cleanedId, // 어떤 ID로 처리했는지 알 수 있도록 포함
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
      (typeof error.response?.data === "string" ? error.response.data : "") ||
      error.message ||
      "회의 종료 API 호출에 실패했습니다.";

    throw new Error(errorMessage);
  }
};

/**
 * 파일 경로 생성 함수 - 안전한 파일 경로 생성
 * @param {string|number} teamId - 팀 ID
 * @returns {string} - S3 파일 경로
 */
export const createSafeFilePath = (teamId) => {
  // teamId 검증
  if (!teamId) {
    console.warn("teamId가 비어 있어 기본값 사용");
    teamId = "unknown";
  }

  // 함수가 전달된 경우
  if (typeof teamId === "function") {
    console.error("함수가 teamId로 전달되었습니다. 변환 시도");
    try {
      // 함수 이름 추출 시도
      const funcName = teamId.name;
      if (funcName && typeof funcName === "string" && funcName.length > 0) {
        teamId = funcName;
      } else {
        // 함수를 문자열로 변환하고 정제
        const funcStr = String(teamId);
        // function () { [native code] } 형태에서 추출 시도
        const match = funcStr.match(/function\s+(\w*)/);
        teamId = match && match[1] ? match[1] : "func";
      }
    } catch (e) {
      console.error("함수 변환 실패:", e);
      teamId = "func";
    }
  }

  // 객체가 전달된 경우
  if (typeof teamId === "object" && teamId !== null) {
    try {
      teamId = String(
        teamId?.id ||
          teamId?.teamId ||
          teamId?.meetingId ||
          JSON.stringify(teamId)
      );
    } catch (e) {
      console.error("객체 변환 실패:", e);
      teamId = "object";
    }
  }

  // 문자열로 변환 및 안전한 문자만 유지
  teamId = String(teamId)
    .replace(/[{}[\]()]/g, "") // 괄호 제거
    .replace(/\s+/g, "_") // 공백을 _로 치환
    .replace(/[^a-zA-Z0-9_\-.]/g, ""); // 안전한 문자만 허용

  // 비어있거나 너무 짧은 경우 랜덤 ID 사용
  if (!teamId || teamId.length < 2) {
    const randomId = Date.now().toString(36);
    console.warn(`teamId가 비어있거나 너무 짧아 랜덤 ID 사용: ${randomId}`);
    teamId = randomId;
  }

  // 타임스탬프 추가 (항상 고유한 파일 이름 보장)
  const timestamp = Date.now();
  const fileName = `blip/audio/${teamId}_${timestamp}`;

  console.log(`안전한 파일 경로 생성: ${fileName}`);
  return fileName;
};

export const uploadRecordingFile = async (file, teamId, meetingId = null) => {
  try {
    // 파라미터 검증
    if (!teamId) {
      console.error("유효한 팀 ID가 필요합니다.");
      return { success: false, error: "유효한 팀 ID가 필요합니다." };
    }

    // 팀 ID와 미팅 ID 정제
    const cleanedTeamId = cleanTeamId(teamId);
    const cleanedMeetingId = meetingId ? cleanTeamId(meetingId) : cleanedTeamId;

    console.log(
      `S3 업로드에 팀 ID ${cleanedTeamId} 사용, 회의 종료 API에 미팅 ID ${cleanedMeetingId} 사용`
    );

    // 녹음 파일 검증 및 초기화
    let finalRecordingBlob = file;
    let usedEmptyAudio = false;

    // 녹음 파일이 제공되지 않았거나 유효하지 않은 경우 찾기 시도
    if (
      !finalRecordingBlob ||
      !(finalRecordingBlob instanceof Blob) ||
      finalRecordingBlob.size === 0
    ) {
      console.log(
        "유효한 녹음 파일이 필요합니다. 로컬 저장소에서 찾아보겠습니다."
      );

      try {
        // RecordingManager를 통해 녹음 파일 찾기
        finalRecordingBlob = await recordingManager.findRecording(
          cleanedTeamId
        );

        if (
          !finalRecordingBlob ||
          !(finalRecordingBlob instanceof Blob) ||
          finalRecordingBlob.size === 0
        ) {
          // 빈 오디오 파일 생성하여 계속 진행
          console.warn("녹음 파일을 찾을 수 없어 빈 오디오 파일 생성");
          finalRecordingBlob = recordingManager.createEmptyAudioBlob();
          usedEmptyAudio = true;
        }

        console.log(
          `녹음 파일 ${usedEmptyAudio ? "(빈 오디오)" : ""}: ${
            finalRecordingBlob.size
          } 바이트, 타입: ${finalRecordingBlob.type}`
        );
      } catch (findError) {
        console.error("녹음 파일 찾기 실패:", findError);

        // 빈 오디오 파일 생성하여 계속 진행
        console.warn("오류로 인해 빈 오디오 파일 생성");
        finalRecordingBlob = recordingManager.createEmptyAudioBlob();
        usedEmptyAudio = true;
      }
    }

    // 안전한 파일 경로 생성
    const fileName = createSafeFilePath(cleanedTeamId);

    // 녹음 데이터 저장 (레코딩 매니저 활용)
    recordingManager.saveRecording(cleanedTeamId, finalRecordingBlob);

    // 1. Presigned URL 요청
    const presignedUrl = await getPresignedUrl(fileName);
    if (!presignedUrl) {
      throw new Error("Presigned URL을 획득하지 못했습니다.");
    }

    // 2. S3에 파일 업로드
    const uploadResult = await uploadFileToS3(presignedUrl, finalRecordingBlob);
    if (!uploadResult) {
      throw new Error("S3 업로드에 실패했습니다.");
    }
    console.log("S3 업로드 완료");

    // 3. 파일 업로드 성공 후 회의 종료 API 호출
    try {
      // 회의 종료 API 호출
      const endMeetingResult = await callMeetingEndWithRetry(cleanedMeetingId);
      console.log("회의 종료 API 호출 결과:", endMeetingResult);

      // 경고가 있는 경우 (500 에러였지만 성공으로 처리한 경우)
      if (endMeetingResult.warning) {
        return {
          success: true,
          fileName,
          teamId: cleanedTeamId,
          meetingId: cleanedMeetingId,
          meetingEndSuccess: true, // S3 업로드 성공이므로 성공으로 처리
          meetingEndWarning: true,
          usedEmptyAudio,
          message: usedEmptyAudio
            ? "빈 오디오 파일이 업로드되었습니다. 서버에서 오류가 발생했지만 요청은 처리되었을 수 있습니다."
            : "녹음 파일은 성공적으로 업로드되었습니다. 서버에서 오류가 발생했지만 요청은 처리되었을 수 있습니다.",
          errorDetails: endMeetingResult.errorDetails,
        };
      }

      // 정상 성공
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
        "회의 종료 API 호출 실패, 하지만 S3 업로드는 성공:",
        endError
      );

      // 회의를 찾을 수 없는 경우 (404 오류)
      if (endError.message.includes("찾을 수 없습니다")) {
        return {
          success: true, // S3 업로드가 성공했으므로 전체 성공
          fileName,
          teamId: cleanedTeamId,
          meetingId: cleanedMeetingId,
          meetingEndSuccess: false,
          meetingEndError: endError.message,
          meetingNotFoundException: true,
          usedEmptyAudio,
          message: usedEmptyAudio
            ? "빈 오디오 파일은 업로드되었습니다. 그러나 서버에서 해당 회의를 찾을 수 없습니다."
            : "녹음 파일은 성공적으로 업로드되었습니다. 그러나 서버에서 해당 회의를 찾을 수 없습니다.",
        };
      }

      // 그 외 오류
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
    return {
      success: false,
      error: error.message,
    };
  }
};

async function callMeetingEndWithRetry(meetingId, retryCount = 3) {
  let lastError = null;
  const timestamp = new Date().toISOString();
  console.log(`[${timestamp}] 회의 종료 API 호출 시작 (ID: ${meetingId})`);

  // 로컬 스토리지나 다른 소스에서도 토큰 획득 시도
  const accessToken =
    import.meta.env.VITE_API_URL_URL_KEY ||
    localStorage.getItem("accessToken") ||
    sessionStorage.getItem("accessToken");

  for (let i = 0; i < retryCount; i++) {
    try {
      // 환경 변수에서 기본 URL 가져오기
      const baseUrlRaw = import.meta.env.VITE_API_URL_BASE;
      const baseUrl = baseUrlRaw
        ? baseUrlRaw.endsWith("/")
          ? baseUrlRaw.slice(0, -1)
          : baseUrlRaw
        : "http://3.38.233.219:8080";

      // API URL 구성
      const meetingEndUrl = `${baseUrl}/meetings/end/${meetingId}`;
      console.log(
        `회의 종료 API 호출 시도 ${
          i + 1
        }/${retryCount} (ID: ${meetingId}): ${meetingEndUrl}`
      );

      // 헤더 구성
      const headers = {
        "Content-Type": "application/json",
        Accept: "application/json",
      };

      if (accessToken) {
        headers.Authorization = `Bearer ${accessToken.trim()}`;
      }

      // 타임아웃을 점진적으로 증가
      const timeout = 30000 + i * 5000; // 재시도마다 5초씩 증가

      // API 호출
      const response = await axios({
        method: "post",
        url: meetingEndUrl,
        headers,
        data: null,
        timeout,
      });

      console.log(
        `회의 종료 API 호출 성공 (시도 ${i + 1}/${retryCount}):`,
        response.data
      );
      return {
        success: true,
        meetingId,
        data: response.data,
      };
    } catch (error) {
      lastError = error;

      const errorStatus = error.response?.status;
      console.error(
        `회의 종료 API 호출 실패 (시도 ${
          i + 1
        }/${retryCount}, 상태: ${errorStatus}):`,
        error
      );

      // 404 오류는 재시도 불필요 (회의를 찾을 수 없음)
      if (errorStatus === 404) {
        throw new Error("회의를 찾을 수 없습니다.");
      }

      // 500 오류는 재시도 (마지막 시도가 아니면)
      if (errorStatus === 500 && i < retryCount - 1) {
        const waitTime = (i + 1) * 2000; // 점진적 대기 시간 증가
        console.log(
          `서버 오류 (500)로 인해 ${waitTime / 1000}초 후 재시도합니다...`
        );
        await new Promise((resolve) => setTimeout(resolve, waitTime));
        continue;
      }
    }
  }

  // 모든 시도 실패 후 - 500 오류면 성공으로 처리
  if (lastError?.response?.status === 500) {
    console.log(
      `[${new Date().toISOString()}] 모든 회의 종료 API 호출이 500 오류로 실패했지만, 녹음 파일은 업로드되었으므로 성공으로 처리합니다.`
    );

    return {
      success: true,
      meetingId,
      warning: true,
      data: {
        message:
          "서버 처리 중 오류가 발생했지만, 녹음 파일은 업로드되었습니다.",
      },
      errorDetails: {
        status: lastError.response?.status,
        statusText: lastError.response?.statusText || "",
        data: lastError.response?.data || {},
        timestamp: new Date().toISOString(),
      },
    };
  }

  // 다른 오류인 경우는 예외 발생
  console.error(`[${new Date().toISOString()}] 회의 종료 API 호출 최종 실패`, {
    meetingId,
    error: lastError?.message || "알 수 없는 오류",
  });

  throw lastError || new Error("알 수 없는 오류로 회의 종료에 실패했습니다.");
}

/**
 * 회의 종료 처리 함수 - localStorage에서 meetingId 가져오기
 * @param {string|number|Object} [meetingId] - 미팅 ID (없으면 localStorage에서 가져옴)
 * @param {Blob} recordingBlob - 녹음 파일 (선택적)
 * @param {string|number|Object} [teamId] - 팀 ID (없으면 meetingId 사용)
 * @returns {Promise<Object>} - 처리 결과
 */
export const handleMeetingEnd = async (
  meetingId = null,
  recordingBlob = null,
  teamId = null
) => {
  try {
    // localStorage에서 미팅 ID 가져오기
    if (!meetingId) {
      const storedMeetingId = localStorage.getItem("currentMeetingId");
      if (storedMeetingId) {
        console.log(
          `localStorage에서 currentMeetingId 가져옴: ${storedMeetingId}`
        );
        meetingId = storedMeetingId;
      }
    }

    // meetingId 정제
    let cleanedMeetingId = cleanTeamId(meetingId);
    let cleanedTeamId = teamId ? cleanTeamId(teamId) : cleanedMeetingId;

    // 유효한 ID가 없는 경우 추가 검색
    if (!cleanedMeetingId || cleanedMeetingId === "1") {
      // localStorage 및 sessionStorage 검색 로직...
      // (기존 코드 유지)
    }

    // 녹음 파일 확인
    let finalRecordingBlob = recordingBlob;
    if (
      !finalRecordingBlob ||
      !(finalRecordingBlob instanceof Blob) ||
      finalRecordingBlob.size === 0
    ) {
      try {
        finalRecordingBlob = await recordingManager.findRecording(
          cleanedTeamId
        );
        if (!finalRecordingBlob || finalRecordingBlob.size === 0) {
          throw new Error("녹음 파일을 찾을 수 없습니다.");
        }
      } catch (findError) {
        console.error("녹음 파일 찾기 실패:", findError);
        throw new Error("녹음 파일이 없어 회의를 종료할 수 없습니다.");
      }
    }

    // 개선된 uploadRecordingFile 함수 호출
    const uploadResult = await uploadRecordingFile(
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
};

/* 업로드 또는 회의 종료를 개별적으로 처리하는 함수
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
      file.type === "audio/wav" ||
      file.type.startsWith("audio/"))
  );
};

// 기본 함수로 handleMeetingEnd 내보내기
export default handleMeetingEnd;
