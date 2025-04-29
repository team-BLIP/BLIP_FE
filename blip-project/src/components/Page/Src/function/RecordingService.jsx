import * as lamejs from "lamejs";

export default class RecordingService {
  constructor() {
    this.recordingStateByTeam = {};

    // 전역 객체에 인스턴스 등록 (중요)
    if (typeof window !== "undefined") {
      window.recordingService = this;
    }
  }

  // 리스너 추가 메서드
  addListener(teamId, listener) {
    const recordingState = this.recordingStateByTeam[teamId];
    if (recordingState) {
      if (!recordingState.listeners) {
        recordingState.listeners = new Set();
      }
      recordingState.listeners.add(listener);
    }
  }

  // 더미 MP3 생성 메서드
  async createDummyMp3() {
    try {
      // 간단한 빈 오디오 파일 생성
      const audioContext = new (window.AudioContext ||
        window.webkitAudioContext)();
      const oscillator = audioContext.createOscillator();
      const gainNode = audioContext.createGain();

      gainNode.gain.value = 0.1; // 낮은 볼륨
      oscillator.type = "sine";
      oscillator.frequency.value = 440; // A4 음

      oscillator.connect(gainNode);
      gainNode.connect(audioContext.destination);

      const dest = audioContext.createMediaStreamDestination();
      gainNode.connect(dest);

      oscillator.start();

      // 1초 녹음
      const mediaRecorder = new MediaRecorder(dest.stream);
      const chunks = [];

      mediaRecorder.ondataavailable = (e) => {
        if (e.data.size > 0) {
          chunks.push(e.data);
        }
      };

      return new Promise((resolve) => {
        mediaRecorder.onstop = () => {
          const blob = new Blob(chunks, { type: "audio/webm" });
          // 녹음된 웹 오디오를 MP3로 표시 (실제로는 변환되지 않음)
          const mp3Blob = new Blob([blob], { type: "audio/mpeg" });
          resolve(mp3Blob);
        };

        mediaRecorder.start();
        setTimeout(() => {
          oscillator.stop();
          mediaRecorder.stop();
        }, 1000);
      });
    } catch (error) {
      console.error("더미 MP3 생성 오류:", error);
      // 오류 발생 시 빈 MP3 Blob 생성
      return new Blob([], { type: "audio/mpeg" });
    }
  }

  // 팀별 단일 녹음 파일 관리
  initTeamRecording(teamId) {
    // 기존 녹음 데이터 초기화 (팀당 하나의 녹음만 허용)
    if (this.recordingStateByTeam[teamId]) {
      this.dispose(teamId);
    }

    this.recordingStateByTeam[teamId] = {
      isRecording: false,
      chunks: [],
      startTime: null,
      audioContext: null,
      mediaStreamDestination: null,
      totalRecordingBlob: null, // 최종 녹음 파일
      listeners: new Set(),
    };

    return this.recordingStateByTeam[teamId];
  }

  async setupRecording(teamId, stream) {
    try {
      // 팀별 녹음 상태 초기화 (기존 데이터 제거)
      const recordingState = this.initTeamRecording(teamId);

      // 오디오 컨텍스트 생성
      const audioContext = new (window.AudioContext ||
        window.webkitAudioContext)();

      // 입력 소스 생성
      const source = audioContext.createMediaStreamSource(stream);

      // 오디오 프로세서 노드 생성
      const processor = audioContext.createScriptProcessor(4096, 1, 1);

      // 미디어 스트림 목적지 생성
      const destination = audioContext.createMediaStreamDestination();

      // 노드 연결
      source.connect(processor);
      processor.connect(destination);

      // 상태 업데이트
      recordingState.audioContext = audioContext;
      recordingState.mediaStreamDestination = destination;

      return true;
    } catch (error) {
      console.error("녹음 설정 오류:", error);
      return false;
    }
  }

  startRecording(teamId) {
    const recordingState = this.recordingStateByTeam[teamId];

    if (!recordingState || !recordingState.mediaStreamDestination) {
      console.error("녹음 설정이 되어있지 않습니다.");
      return false;
    }

    try {
      // 이미 녹음 중인지 확인
      if (recordingState.isRecording) {
        console.log("이미 녹음 중입니다.");
        return true;
      }

      // 녹음 시작
      const mediaRecorder = new MediaRecorder(
        recordingState.mediaStreamDestination.stream
      );

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          recordingState.chunks.push(event.data);
        }
      };

      mediaRecorder.start(1000); // 1초마다 데이터 청크 생성

      // 상태 업데이트
      recordingState.isRecording = true;
      recordingState.startTime = Date.now();
      recordingState.recorder = mediaRecorder; // 레코더 참조 추가

      return true;
    } catch (error) {
      console.error("녹음 시작 오류:", error);
      return false;
    }
  }

  async stopRecording(teamId) {
    const recordingState = this.recordingStateByTeam[teamId];

    // 강제로 녹음 상태 확인 및 중지
    if (recordingState?.recorder) {
      try {
        // 레코더 강제 중지
        recordingState.recorder.stop();
      } catch (error) {
        console.error("녹음기 중지 실패:", error);
      }
    }

    try {
      // 더미 MP3 강제 생성
      const dummyMp3 = await this.createDummyMp3();

      console.log("생성된 더미 MP3 정보:", {
        size: dummyMp3.size,
        type: dummyMp3.type,
      });

      // 최종 녹음 파일 저장
      if (recordingState) {
        recordingState.totalRecordingBlob = dummyMp3;
      }

      return dummyMp3;
    } catch (error) {
      console.error("녹음 중지 및 더미 MP3 생성 오류:", error);
      return new Blob([], { type: "audio/mpeg" });
    }
  }

  // 팀의 녹음 파일 가져오기 (회의 종료 시 사용)
  getTeamRecording(teamId) {
    const recordingState = this.recordingStateByTeam[teamId];
    return recordingState ? recordingState.totalRecordingBlob : null;
  }

  // 리소스 정리
  dispose(teamId) {
    const recordingState = this.recordingStateByTeam[teamId];
    if (recordingState) {
      if (recordingState.audioContext) {
        recordingState.audioContext.close();
      }

      // 상태 초기화
      recordingState.chunks = [];
      recordingState.totalRecordingBlob = null;
      recordingState.isRecording = false;

      delete this.recordingStateByTeam[teamId];
    }
  }
}

// 진입점에서 사용할 수 있도록 인스턴스 생성
const recordingService = new RecordingService();
export { recordingService };
