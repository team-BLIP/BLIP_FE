// RecordingService.js - dispose 메소드 추가 버전
/**
 * 녹음 서비스 클래스
 * 회의 녹음 관련 기능을 제공하는 싱글톤 서비스
 */
export class RecordingService {
  constructor() {
    // 싱글톤 패턴
    if (RecordingService._instance) {
      return RecordingService._instance;
    }
    RecordingService._instance = this;

    this.recordingStateByTeam = {};
    this.initialized = false;
    this.mediaRecorderOptions = {
      mimeType: "audio/webm;codecs=opus",
      audioBitsPerSecond: 128000,
    };
  }

  /**
   * 서비스 초기화
   */
  initialize() {
    if (this.initialized) return;
    console.log("RecordingService 초기화");
    this.initialized = true;
  }

  /**
   * 녹음 설정
   * @param {string|number} teamId 팀 ID
   * @param {MediaStream} stream 오디오 스트림
   */
  async setupRecording(teamId, stream) {
    if (!this.initialized) {
      this.initialize();
    }

    if (!stream) {
      console.error(`팀 ${teamId}의 녹음 설정 실패: 스트림이 제공되지 않음`);
      return false;
    }

    try {
      // 오디오 트랙 확인
      const audioTracks = stream.getAudioTracks();
      if (audioTracks.length === 0) {
        console.warn(`팀 ${teamId}의 녹음 설정 실패: 오디오 트랙 없음`);
        return false;
      }

      // 기존 상태 정리
      this._cleanupTeamRecording(teamId);

      // 오디오 전용 스트림 생성
      const audioStream = new MediaStream();
      audioStream.addTrack(audioTracks[0]);

      // 녹음기 생성
      let mediaRecorder;
      try {
        mediaRecorder = new MediaRecorder(
          audioStream,
          this.mediaRecorderOptions
        );
      } catch (error) {
        console.warn(
          `선호하는 코덱으로 MediaRecorder 생성 실패, 기본 설정 시도:`,
          error
        );
        mediaRecorder = new MediaRecorder(audioStream);
      }

      // 데이터 수집 설정
      const chunks = [];

      mediaRecorder.ondataavailable = (event) => {
        if (event.data && event.data.size > 0) {
          chunks.push(event.data);
          console.log(`녹음 데이터 청크 추가: ${event.data.size} 바이트`);

          const state = this.recordingStateByTeam[teamId];
          if (state) {
            state.dataSize += event.data.size;
          }
        }
      };

      // 녹음 상태 객체 생성
      this.recordingStateByTeam[teamId] = {
        mediaRecorder,
        chunks,
        stream: audioStream,
        active: false,
        paused: false,
        startTime: null,
        pausedTime: 0,
        dataSize: 0,
        listeners: new Set(),
      };

      console.log(`팀 ${teamId}의 녹음 설정 완료`);
      return true;
    } catch (error) {
      console.error(`팀 ${teamId}의 녹음 설정 중 오류:`, error);
      return false;
    }
  }

  /**
   * 최신 녹음 데이터 가져오기
   * @param {string|number} teamId 팀 ID
   * @returns {Blob|null} 녹음 데이터 Blob 또는 null
   */
  getLatestRecording(teamId) {
    // 1. window.latestRecordings에서 먼저 확인
    if (window.latestRecordings && window.latestRecordings[teamId]) {
      return window.latestRecordings[teamId].blob;
    }

    // 2. window.recordedBlobs에서 확인
    const infoKeys = Object.keys(localStorage).filter(
      (key) => key.startsWith(`recording_${teamId}_`) && key.endsWith("_info")
    );

    if (infoKeys.length > 0) {
      // 타임스탬프 기준으로 정렬 (최신 데이터 먼저)
      infoKeys.sort((a, b) => {
        const timestampA = parseInt(a.split("_")[2]);
        const timestampB = parseInt(b.split("_")[2]);
        return timestampB - timestampA; // 내림차순
      });

      const latestInfoKey = infoKeys[0];
      const recordingKey = latestInfoKey.replace("_info", "");

      if (window.recordedBlobs && window.recordedBlobs[recordingKey]) {
        return window.recordedBlobs[recordingKey];
      }
    }

    // 3. 현재 진행 중인 녹음 상태 확인
    const state = this.recordingStateByTeam[teamId];
    if (state && state.chunks && state.chunks.length > 0) {
      return new Blob(state.chunks, {
        type: state.mediaRecorder?.mimeType || "audio/webm;codecs=opus",
      });
    }

    return null;
  }

  /**
   * 팀에 대한 녹음 이력 유무 확인
   * @param {string|number} teamId 팀 ID
   * @returns {boolean} 녹음 이력 존재 여부
   */
  hasRecordingHistory(teamId) {
    // 1. 현재 진행 중인 녹음 확인
    const state = this.recordingStateByTeam[teamId];
    if (state && state.active) {
      return true;
    }

    // 2. window.latestRecordings 확인
    if (window.latestRecordings && window.latestRecordings[teamId]) {
      return true;
    }

    // 3. 로컬 스토리지에서 녹음 정보 확인
    const infoKeys = Object.keys(localStorage).filter(
      (key) => key.startsWith(`recording_${teamId}_`) && key.endsWith("_info")
    );

    return infoKeys.length > 0;
  }

  /**
   * 녹음 일시정지
   * @param {string|number} teamId 팀 ID
   */
  pauseRecording(teamId) {
    const state = this.recordingStateByTeam[teamId];

    if (!state || !state.mediaRecorder || !state.active) {
      console.error(`팀 ${teamId}의 녹음 일시정지 실패: 활성화된 녹음 없음`);
      return false;
    }

    try {
      const { mediaRecorder, paused } = state;

      if (paused) {
        console.log(`팀 ${teamId}의 녹음이 이미 일시정지됨`);
        return true;
      }

      mediaRecorder.pause();
      state.paused = true;
      state.pausedTime = Date.now();

      console.log(`팀 ${teamId} 녹음 일시정지됨`);
      return true;
    } catch (error) {
      console.error(`팀 ${teamId}의 녹음 일시정지 중 오류:`, error);
      return false;
    }
  }

  /**
   * 녹음 시작
   * @param {string|number} teamId 팀 ID
   */
  async startRecording(teamId) {
    const state = this.recordingStateByTeam[teamId];

    if (!state || !state.mediaRecorder) {
      console.error(`팀 ${teamId}의 녹음 시작 실패: 녹음기가 설정되지 않음`);
      return false;
    }

    try {
      const { mediaRecorder, active, paused } = state;

      // 이미 활성화된 경우
      if (active && !paused) {
        console.log(`팀 ${teamId}의 녹음이 이미 진행 중`);
        return true;
      }

      // 일시정지 상태인 경우 - 기존 녹음을 이어서 재개
      if (active && paused) {
        mediaRecorder.resume();
        state.paused = false;
        console.log(`팀 ${teamId} 녹음 재개됨`);
        return true;
      }

      // 새 녹음 시작
      mediaRecorder.start(1000); // 1초마다 데이터 이벤트 발생
      state.active = true;
      state.paused = false;
      state.startTime = Date.now();

      console.log(`팀 ${teamId} 녹음 시작/재개됨`);
      return true;
    } catch (error) {
      console.error(`팀 ${teamId}의 녹음 시작 중 오류:`, error);
      return false;
    }
  }

  /**
   * 녹음 중지 및 데이터 반환
   * @param {string|number} teamId 팀 ID
   * @returns {Promise<Blob|null>} 녹음된 오디오 Blob
   */
  /**
   * 녹음 중지 및 데이터 반환
   * @param {string|number} teamId 팀 ID
   * @returns {Promise<Blob|null>} 녹음된 오디오 Blob
   */
  async stopRecording(teamId) {
    const state = this.recordingStateByTeam[teamId];

    // 상태 확인 및 디버깅 로그
    if (!state) {
      console.warn(`녹음 상태 없음: 팀 ${teamId}`);
      return null;
    }

    if (!state.mediaRecorder) {
      console.warn(`녹음기 없음: 팀 ${teamId}`);
      return null;
    }

    if (!state.active) {
      console.warn(`이미 녹음 중지 상태: 팀 ${teamId}`);

      // 이미 중지된 상태이지만 청크가 있으면 Blob 반환
      if (state.chunks && state.chunks.length > 0) {
        const blob = new Blob(state.chunks, {
          type: state.mediaRecorder?.mimeType || "audio/webm;codecs=opus",
        });
        console.log(`중지 상태 청크에서 Blob 생성: ${blob.size} 바이트`);
        return blob;
      }

      return null;
    }

    // 상태 동기화 및 녹음 중지
    return new Promise((resolve) => {
      const { mediaRecorder, chunks } = state;

      mediaRecorder.onstop = () => {
        try {
          if (chunks.length === 0) {
            console.warn(`녹음 데이터가 없음: 팀 ${teamId}`);
            resolve(null);
            return;
          }

          const blob = new Blob(chunks, {
            type: mediaRecorder.mimeType || "audio/webm;codecs=opus",
          });

          console.log(`녹음 완료: 팀 ${teamId}, 크기: ${blob.size} 바이트`);
          this.notifyListeners(teamId, blob);

          // 상태 초기화 (chunks는 유지)
          state.active = false;
          state.paused = false;

          resolve(blob);
        } catch (error) {
          console.error(`녹음 중지 처리 오류: 팀 ${teamId}`, error);

          // 오류 발생해도 청크가 있으면 Blob 반환 시도
          if (chunks && chunks.length > 0) {
            try {
              const blob = new Blob(chunks, {
                type: "audio/webm;codecs=opus",
              });
              console.log(
                `오류 발생 후 청크에서 Blob 생성: ${blob.size} 바이트`
              );
              resolve(blob);
            } catch (blobError) {
              console.error(`Blob 생성 오류:`, blobError);
              resolve(null);
            }
          } else {
            resolve(null);
          }
        }
      };

      // 녹음 중지 시도
      try {
        mediaRecorder.stop();
      } catch (error) {
        console.error(`녹음 중지 실패: 팀 ${teamId}`, error);

        // 오류 발생해도 청크가 있으면 Blob 반환 시도
        if (chunks && chunks.length > 0) {
          try {
            const blob = new Blob(chunks, {
              type: "audio/webm;codecs=opus",
            });
            console.log(`중지 실패 후 청크에서 Blob 생성: ${blob.size} 바이트`);

            // 상태 업데이트
            state.active = false;
            state.paused = false;

            resolve(blob);
          } catch (blobError) {
            console.error(`Blob 생성 오류:`, blobError);
            resolve(null);
          }
        } else {
          resolve(null);
        }
      }
    });
  }

  /**
   * 녹음 리스너 추가
   * @param {string|number} teamId 팀 ID
   * @param {Function} listener 콜백 함수
   */
  addListener(teamId, listener) {
    if (!this.recordingStateByTeam[teamId]) {
      this.recordingStateByTeam[teamId] = {
        listeners: new Set(),
      };
    }

    this.recordingStateByTeam[teamId].listeners.add(listener);
  }

  /**
   * 녹음 리스너 제거
   * @param {string|number} teamId 팀 ID
   * @param {Function} listener 콜백 함수
   */
  removeListener(teamId, listener) {
    const state = this.recordingStateByTeam[teamId];
    if (state && state.listeners) {
      state.listeners.delete(listener);
    }
  }

  /**
   * 오디오 소스 업데이트
   * @param {string|number} teamId 팀 ID
   * @param {MediaStream} newStream 새 오디오 스트림
   */
  async updateAudioSource(teamId, newStream) {
    const state = this.recordingStateByTeam[teamId];

    if (!state || !state.mediaRecorder) {
      console.error(
        `팀 ${teamId}의 오디오 소스 업데이트 실패: 녹음기가 설정되지 않음`
      );
      return false;
    }

    try {
      const wasActive = state.active;
      const wasPaused = state.paused;

      // 기존 녹음 중지 (데이터 유지)
      if (wasActive) {
        await this.stopRecording(teamId);
      }

      // 새 오디오 소스로 설정
      const success = await this.setupRecording(teamId, newStream);

      // 이전 상태가 활성 상태였다면 새 녹음 시작
      if (success && wasActive) {
        await this.startRecording(teamId);

        // 일시정지 상태였다면 일시정지
        if (wasPaused) {
          await this.pauseRecording(teamId);
        }
      }

      return success;
    } catch (error) {
      console.error(`팀 ${teamId}의 오디오 소스 업데이트 중 오류:`, error);
      return false;
    }
  }

  /**
   * 리스너에게 녹음 완료 알림
   * @param {string|number} teamId 팀 ID
   * @param {Blob} blob 녹음된 오디오 Blob
   */
  notifyListeners(teamId, blob) {
    // 데이터 검사
    if (!blob || blob.size === 0) {
      console.error(`팀 ${teamId}의 녹음 데이터가 비어있습니다.`);
      return;
    }

    // Blob 데이터 저장 및 관리 개선
    try {
      // 정보 객체 생성
      const timestamp = Date.now();
      const key = `recording_${teamId}_${timestamp}`;
      const info = {
        size: blob.size,
        type: blob.type,
        timestamp: timestamp,
        teamId: teamId,
      };

      // 정보를 로컬 스토리지에 저장
      localStorage.setItem(`${key}_info`, JSON.stringify(info));

      // Blob 객체를 직접 메모리에 저장 (window 객체 활용)
      if (!window.recordedBlobs) {
        window.recordedBlobs = {};
      }
      window.recordedBlobs[key] = blob;

      // Blob URL 생성 및 세션 스토리지에 저장 (활용도 높임)
      const blobUrl = URL.createObjectURL(blob);
      sessionStorage.setItem(`${key}_url`, blobUrl);

      console.log(
        `녹음 데이터 저장 완료: ${key}, 크기: ${blob.size} 바이트, 유형: ${blob.type}`
      );

      // 전역 이벤트 발생 - 컴포넌트에 알림
      window.dispatchEvent(
        new CustomEvent("recordingComplete", {
          detail: {
            teamId,
            size: blob.size,
            timestamp: timestamp,
            key: key,
            type: blob.type,
          },
        })
      );

      // 등록된 리스너에게 알림
      const state = this.recordingStateByTeam[teamId];
      const listeners = state?.listeners;

      if (listeners && listeners.size > 0) {
        console.log(
          `리스너 ${listeners.size}개에 녹음 완료 알림: ${blob.size} 바이트`
        );

        for (const listener of listeners) {
          try {
            listener(blob);
          } catch (err) {
            console.error(`리스너 호출 중 오류:`, err);
          }
        }
      } else {
        console.log(
          `등록된 리스너 없음. window 이벤트로만 알림: ${blob.size} 바이트`
        );
      }
    } catch (error) {
      console.error(`녹음 데이터 저장 중 오류:`, error);
    }
  }

  /**
   * 팀 녹음 상태 초기화
   * @param {string|number} teamId 팀 ID
   * @private
   */
  _cleanupTeamRecording(teamId) {
    const state = this.recordingStateByTeam[teamId];

    if (state) {
      try {
        // 기존 미디어 리코더 중지
        if (state.mediaRecorder && state.active) {
          state.mediaRecorder.stop();
        }

        // 기존 스트림 정리
        if (state.stream) {
          state.stream.getTracks().forEach((track) => track.stop());
        }

        // 기존 청크 정리 (리스너는 유지)
        const listeners = state.listeners;

        this.recordingStateByTeam[teamId] = {
          listeners,
          chunks: [],
          active: false,
          paused: false,
        };
      } catch (error) {
        console.error(`팀 ${teamId}의 녹음 상태 정리 중 오류:`, error);
      }
    }
  }

  /**
   * 리소스 정리 메소드 - service.dispose 오류 해결을 위해 추가
   * @param {string|number} teamId 팀 ID
   * @returns {boolean} 정리 성공 여부
   */
  dispose(teamId) {
    try {
      if (teamId !== undefined && teamId !== null) {
        // 특정 팀 정리
        const state = this.recordingStateByTeam[teamId];

        if (state) {
          console.log(`팀 ${teamId}의 녹음 리소스 정리 시작`);

          // 미디어 리코더 중지
          if (state.mediaRecorder && state.active) {
            try {
              state.mediaRecorder.stop();
              console.log(`팀 ${teamId}의 미디어 리코더 중지 완료`);
            } catch (err) {
              console.warn(`팀 ${teamId}의 미디어 리코더 중지 중 오류:`, err);
            }
          }

          // 스트림 트랙 중지
          if (state.stream) {
            state.stream.getTracks().forEach((track) => {
              try {
                track.stop();
                console.log(`팀 ${teamId}의 ${track.kind} 트랙 중지 완료`);
              } catch (err) {
                console.warn(`팀 ${teamId}의 트랙 중지 중 오류:`, err);
              }
            });
          }

          // 상태 업데이트 (리스너는 유지)
          const listeners = state.listeners || new Set();
          this.recordingStateByTeam[teamId] = {
            listeners,
            chunks: [],
            active: false,
            paused: false,
          };

          console.log(`팀 ${teamId}의 녹음 리소스 정리 완료`);
        } else {
          console.log(`팀 ${teamId}의 상태가 없음, 정리 불필요`);
        }
      } else {
        // 모든 팀 정리
        console.log("모든 팀의 녹음 리소스 정리 시작");

        // 모든 팀 순회
        Object.keys(this.recordingStateByTeam).forEach((id) => {
          const state = this.recordingStateByTeam[id];

          // 미디어 리코더 중지
          if (state.mediaRecorder && state.active) {
            try {
              state.mediaRecorder.stop();
              console.log(`팀 ${id}의 미디어 리코더 중지 완료`);
            } catch (err) {
              console.warn(`팀 ${id}의 미디어 리코더 중지 중 오류:`, err);
            }
          }

          // 스트림 트랙 중지
          if (state.stream) {
            state.stream.getTracks().forEach((track) => {
              try {
                track.stop();
                console.log(`팀 ${id}의 ${track.kind} 트랙 중지 완료`);
              } catch (err) {
                console.warn(`팀 ${id}의 트랙 중지 중 오류:`, err);
              }
            });
          }

          // 상태 업데이트 (리스너는 유지)
          const listeners = state.listeners || new Set();
          this.recordingStateByTeam[id] = {
            listeners,
            chunks: [],
            active: false,
            paused: false,
          };
        });

        console.log("모든 팀의 녹음 리소스 정리 완료");
      }

      return true;
    } catch (error) {
      console.error("녹음 리소스 정리 중 오류:", error);
      return false;
    }
  }
}

// 싱글톤 인스턴스 생성 및 내보내기
export const recordingService = new RecordingService();
export default recordingService;
