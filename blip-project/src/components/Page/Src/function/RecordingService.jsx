// RecordingService.js - 녹음 관련 기능 분리
class RecordingService {
  constructor() {
    this.recordingState = {
      isRecording: false,
      isPaused: false,
      chunks: [],
      startTime: null,
      pausedDuration: 0,
      recorder: null,
      stream: null,
    };
  }

  async setupRecording(stream) {
    if (!stream) return false;

    try {
      const mediaRecorder = new MediaRecorder(stream);

      mediaRecorder.ondataavailable = (e) => {
        if (e.data.size > 0) {
          this.recordingState.chunks.push(e.data);
        }
      };

      this.recordingState.recorder = mediaRecorder;
      this.recordingState.stream = stream;

      return true;
    } catch (error) {
      console.error("녹음 설정 오류:", error);
      return false;
    }
  }

  startRecording() {
    if (!this.recordingState.recorder) return false;

    try {
      this.recordingState.recorder.start();
      this.recordingState.isRecording = true;
      this.recordingState.startTime = Date.now();
      this.recordingState.pausedDuration = 0;

      return true;
    } catch (error) {
      console.error("녹음 시작 오류:", error);
      return false;
    }
  }

  stopRecording() {
    if (!this.recordingState.recorder || !this.recordingState.isRecording)
      return false;

    try {
      this.recordingState.recorder.stop();
      this.recordingState.isRecording = false;

      // 녹음 데이터 저장 로직
      const blob = new Blob(this.recordingState.chunks, { type: "audio/webm" });
      this.recordingState.chunks = [];

      return blob;
    } catch (error) {
      console.error("녹음 중지 오류:", error);
      return null;
    }
  }

  pauseRecording() {
    if (
      !this.recordingState.recorder ||
      !this.recordingState.isRecording ||
      this.recordingState.isPaused
    )
      return false;

    try {
      this.recordingState.recorder.pause();
      this.recordingState.isPaused = true;
      this.recordingState.pauseTime = Date.now();

      return true;
    } catch (error) {
      console.error("녹음 일시중지 오류:", error);
      return false;
    }
  }

  resumeRecording() {
    if (
      !this.recordingState.recorder ||
      !this.recordingState.isRecording ||
      !this.recordingState.isPaused
    )
      return false;

    try {
      this.recordingState.recorder.resume();
      this.recordingState.isPaused = false;
      this.recordingState.pausedDuration +=
        Date.now() - this.recordingState.pauseTime;

      return true;
    } catch (error) {
      console.error("녹음 재개 오류:", error);
      return false;
    }
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
    };
  }
}
