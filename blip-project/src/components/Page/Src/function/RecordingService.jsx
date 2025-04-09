// RecordingService.js - 녹음 관련 기능 분리
class RecordingService {
  constructor() {
    this.recordingState = {
      isRecording: false,
      isPaused: false,
      chunks: [],
      startTime: null,
      pauseTime: null,
      pausedDuration: 0,
      recorder: null,
      stream: null,
      mimeType: "audio/webm",
      listeners: new Set(),
    };
  }
  
  async setupRecording(stream, options = {}) {
    if (!stream) {
      console.error("유효한 스트림이 필요합니다");
      return false;
    }

    try {
      // 가능한 오디오 MIME 타입 확인
      const mimeTypes = [
        "audio/webm;codecs=opus",
        "audio/webm",
        "audio/ogg;codecs=opus",
        "audio/mp4",
      ];

      const supportedType = mimeTypes.find((type) =>
        MediaRecorder.isTypeSupported(type)
      );
      this.recordingState.mimeType = supportedType || "audio/webm";

      // 녹음기 설정
      const mediaRecorder = new MediaRecorder(stream, {
        mimeType: this.recordingState.mimeType,
        ...options,
      });

      mediaRecorder.ondataavailable = (e) => {
        if (e.data && e.data.size > 0) {
          this.recordingState.chunks.push(e.data);
          this._notifyListeners("dataavailable", e.data);
        }
      };

      mediaRecorder.onstart = () => {
        this._notifyListeners("start");
      };

      mediaRecorder.onpause = () => {
        this._notifyListeners("pause");
      };

      mediaRecorder.onresume = () => {
        this._notifyListeners("resume");
      };

      mediaRecorder.onstop = () => {
        this._notifyListeners("stop");
      };

      mediaRecorder.onerror = (error) => {
        console.error("녹음기 오류:", error);
        this._notifyListeners("error", error);
      };

      this.recordingState.recorder = mediaRecorder;
      this.recordingState.stream = stream;

      return true;
    } catch (error) {
      console.error("녹음 설정 오류:", error);
      this._notifyListeners("error", error);
      return false;
    }
  }

  startRecording(timeslice = 1000) {
    if (!this.recordingState.recorder) {
      console.error("녹음기가 설정되지 않았습니다");
      return false;
    }

    try {
      this.resetRecording();
      this.recordingState.recorder.start(timeslice);
      this.recordingState.isRecording = true;
      this.recordingState.startTime = Date.now();
      return true;
    } catch (error) {
      console.error("녹음 시작 오류:", error);
      this._notifyListeners("error", error);
      return false;
    }
  }

  stopRecording() {
    if (!this.recordingState.recorder || !this.recordingState.isRecording) {
      console.error("녹음 중이 아닙니다");
      return null;
    }

    try {
      this.recordingState.recorder.stop();
      this.recordingState.isRecording = false;
      this.recordingState.isPaused = false;

      // 녹음 데이터 생성
      const blob = new Blob(this.recordingState.chunks, {
        type: this.recordingState.mimeType,
      });

      return blob;
    } catch (error) {
      console.error("녹음 중지 오류:", error);
      this._notifyListeners("error", error);
      return null;
    }
  }

  pauseRecording() {
    if (
      !this.recordingState.recorder ||
      !this.recordingState.isRecording ||
      this.recordingState.isPaused
    ) {
      return false;
    }

    try {
      this.recordingState.recorder.pause();
      this.recordingState.isPaused = true;
      this.recordingState.pauseTime = Date.now();
      return true;
    } catch (error) {
      console.error("녹음 일시중지 오류:", error);
      this._notifyListeners("error", error);
      return false;
    }
  }

  resumeRecording() {
    if (
      !this.recordingState.recorder ||
      !this.recordingState.isRecording ||
      !this.recordingState.isPaused
    ) {
      return false;
    }

    try {
      this.recordingState.recorder.resume();
      this.recordingState.isPaused = false;
      this.recordingState.pausedDuration +=
        Date.now() - this.recordingState.pauseTime;
      return true;
    } catch (error) {
      console.error("녹음 재개 오류:", error);
      this._notifyListeners("error", error);
      return false;
    }
  }

  resetRecording() {
    this.recordingState.chunks = [];
    this.recordingState.startTime = null;
    this.recordingState.pauseTime = null;
    this.recordingState.pausedDuration = 0;
    this.recordingState.isRecording = false;
    this.recordingState.isPaused = false;
  }

  getRecordingDuration() {
    if (!this.recordingState.startTime) return 0;

    const now = this.recordingState.isPaused
      ? this.recordingState.pauseTime
      : Date.now();
    return (
      now - this.recordingState.startTime - this.recordingState.pausedDuration
    );
  }

  getRecordingState() {
    return {
      isRecording: this.recordingState.isRecording,
      isPaused: this.recordingState.isPaused,
      duration: this.getRecordingDuration(),
      mimeType: this.recordingState.mimeType,
      hasData: this.recordingState.chunks.length > 0,
    };
  }

  getRecordingUrl() {
    if (this.recordingState.chunks.length === 0) return null;

    const blob = new Blob(this.recordingState.chunks, {
      type: this.recordingState.mimeType,
    });
    return URL.createObjectURL(blob);
  }

  /**
   * 녹음 이벤트 리스너 등록
   * @param {Function} listener - 이벤트 리스너 함수
   */
  addListener(listener) {
    if (typeof listener === "function") {
      this.recordingState.listeners.add(listener);
    }
  }

  /**
   * 녹음 이벤트 리스너 제거
   * @param {Function} listener - 이벤트 리스너 함수
   */
  removeListener(listener) {
    this.recordingState.listeners.delete(listener);
  }

  /**
   * 모든 리스너에게 이벤트 알림
   * @private
   */
  _notifyListeners(event, data) {
    this.recordingState.listeners.forEach((listener) => {
      try {
        listener(event, data, this.getRecordingState());
      } catch (error) {
        console.error("리스너 호출 오류:", error);
      }
    });
  }

  /**
   * 리소스 정리
   */
  dispose() {
    try {
      if (this.recordingState.recorder && this.recordingState.isRecording) {
        this.recordingState.recorder.stop();
      }

      if (this.recordingState.stream) {
        this.recordingState.stream.getTracks().forEach((track) => track.stop());
      }

      this.resetRecording();
      this.recordingState.listeners.clear();
    } catch (error) {
      console.error("리소스 정리 오류:", error);
    }
  }
}

export default RecordingService;
