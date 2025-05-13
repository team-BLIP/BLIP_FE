// hooks/useMicrophoneManager.js
import { useCallback, useRef, useEffect } from "react";

/**
 * 마이크 관리를 위한 커스텀 훅
 * 마이크 상태 제어, 재시작, 모니터링 기능 제공
 */
export const useMicrophoneManager = ({
  isMike,
  setIsMike,
  localStream,
  setLocalStream,
  isRecording,
  isRecordingPaused,
  setIsRecordingPaused,
  getValidTeamId,
  recordingServiceRef,
  localVideoRef,
}) => {
  const microphoneRestartAttempts = useRef(0);
  const isProcessingMikeChange = useRef(false);
  const MAX_RESTART_ATTEMPTS = 3;

  // 브라우저 감지 함수
  const detectBrowser = useCallback(() => {
    const userAgent = navigator.userAgent;
    if (userAgent.match(/chrome|chromium|crios/i)) return "chrome";
    if (userAgent.match(/firefox|fxios/i)) return "firefox";
    if (userAgent.match(/safari/i)) return "safari";
    if (userAgent.match(/edg/i)) return "edge";
    return "unknown";
  }, []);

  // 브라우저별 최적화된 오디오 설정
  const getOptimalAudioConstraints = useCallback(() => {
    const browser = detectBrowser();
    const baseConstraints = {
      echoCancellation: true,
      noiseSuppression: true,
      autoGainControl: true,
    };

    switch (browser) {
      case "safari":
        return {
          ...baseConstraints,
          sampleRate: 44100,
          channelCount: 1,
        };
      case "firefox":
        return {
          ...baseConstraints,
          mozNoiseSuppression: true,
          mozAutoGainControl: true,
        };
      default:
        return {
          ...baseConstraints,
          googEchoCancellation: true,
          googNoiseSuppression: true,
          googAutoGainControl: true,
          sampleRate: 48000,
          channelCount: 1,
          latency: 0.01,
        };
    }
  }, [detectBrowser]);

  // 마이크 재시작 함수
  const restartMicrophoneIfNeeded = useCallback(async () => {
    if (isProcessingMikeChange.current || !isMike) {
      return;
    }

    if (microphoneRestartAttempts.current >= MAX_RESTART_ATTEMPTS) {
      console.warn(
        `마이크 자동 재시작 최대 시도 횟수(${MAX_RESTART_ATTEMPTS}회) 초과`
      );
      setIsMike(false);
      microphoneRestartAttempts.current = 0;
      return;
    }

    try {
      isProcessingMikeChange.current = true;
      microphoneRestartAttempts.current++;

      console.log(
        `마이크 자동 재시작 시도 #${microphoneRestartAttempts.current}`
      );

      // 기존 오디오 트랙 정리
      if (localStream) {
        localStream.getAudioTracks().forEach((track) => {
          track.stop();
        });
      }

      // 새 오디오 스트림 획득
      const constraints = { audio: getOptimalAudioConstraints() };

      let audioStream;
      try {
        audioStream = await navigator.mediaDevices.getUserMedia(constraints);
      } catch (initialError) {
        console.warn(
          "최적 제약 조건으로 마이크 접근 실패, 기본 제약 조건으로 재시도:",
          initialError
        );
        audioStream = await navigator.mediaDevices.getUserMedia({
          audio: true,
        });
      }

      const newStream = new MediaStream();

      // 기존 비디오 트랙 유지
      if (localStream && localStream.getVideoTracks().length > 0) {
        const videoTrack = localStream.getVideoTracks()[0];
        if (videoTrack.readyState === "live") {
          newStream.addTrack(videoTrack);
        }
      }

      // 새 오디오 트랙 추가 및 이벤트 리스너 설정
      const audioTrack = audioStream.getAudioTracks()[0];

      audioTrack.addEventListener("ended", () => {
        console.log("오디오 트랙 종료됨, 재시작 검토");
        setTimeout(() => restartMicrophoneIfNeeded(), 1000);
      });

      audioTrack.addEventListener("mute", () => {
        console.log("오디오 트랙 음소거됨, 상태 확인");
        setTimeout(() => {
          if (audioTrack.muted && isMike) {
            console.log("오디오 트랙이 음소거 상태로 유지됨, 재시작 검토");
            restartMicrophoneIfNeeded();
          }
        }, 1000);
      });

      newStream.addTrack(audioTrack);
      setLocalStream(newStream);

      // 로컬 비디오 참조 업데이트
      if (localVideoRef.current && newStream.getVideoTracks().length > 0) {
        localVideoRef.current.srcObject = newStream;
      }

      // 녹음 서비스 업데이트
      const teamId = getValidTeamId();
      const service = recordingServiceRef.current;
      if (service && isRecording) {
        await service.updateAudioSource(teamId, newStream);
        console.log("녹음 서비스 오디오 소스 업데이트됨");
      }

      console.log("마이크 재시작 성공");
      microphoneRestartAttempts.current = 0;
    } catch (error) {
      console.error("마이크 재시작 실패:", error);

      if (microphoneRestartAttempts.current < MAX_RESTART_ATTEMPTS) {
        setTimeout(() => {
          isProcessingMikeChange.current = false;
          restartMicrophoneIfNeeded();
        }, 2000);
      } else {
        setIsMike(false);
        microphoneRestartAttempts.current = 0;
        alert("마이크 연결을 유지할 수 없습니다. 다시 시도해주세요.");
      }
    } finally {
      isProcessingMikeChange.current = false;
    }
  }, [
    isMike,
    setIsMike,
    localStream,
    setLocalStream,
    isRecording,
    getValidTeamId,
    getOptimalAudioConstraints,
    localVideoRef,
    recordingServiceRef,
  ]);

  // 마이크 토글 핸들러
  const handleMikeToggle = useCallback(async () => {
    if (isProcessingMikeChange.current) {
      console.log("마이크 상태 변경 중입니다. 기다려주세요.");
      return;
    }

    const nextState = !isMike;
    isProcessingMikeChange.current = true;

    try {
      console.log(`마이크 상태 변경: ${isMike ? "켜짐→꺼짐" : "꺼짐→켜짐"}`);

      if (nextState) {
        // 마이크 켜기
        const constraints = { audio: getOptimalAudioConstraints() };

        console.log("마이크 접근 요청 중...", constraints);
        const audioStream = await navigator.mediaDevices
          .getUserMedia(constraints)
          .catch((error) => {
            console.error("마이크 접근 오류:", error);
            throw error;
          });

        // 새 스트림 생성
        const newStream = new MediaStream();

        // 기존 비디오 트랙 유지
        if (localStream) {
          const videoTracks = localStream.getVideoTracks();
          if (videoTracks.length > 0 && videoTracks[0].readyState === "live") {
            newStream.addTrack(videoTracks[0]);
            console.log("기존 비디오 트랙 유지됨");
          }

          // 기존 오디오 트랙 정리
          localStream.getAudioTracks().forEach((track) => {
            track.stop();
          });
        }

        // 새 오디오 트랙 추가
        const audioTrack = audioStream.getAudioTracks()[0];

        // 오디오 트랙에 이벤트 리스너 추가
        if (!audioTrack._hasListeners) {
          audioTrack.addEventListener("ended", () => {
            console.log("오디오 트랙 종료 이벤트 발생");
            setTimeout(() => restartMicrophoneIfNeeded(), 500);
          });

          audioTrack.addEventListener("mute", () => {
            console.log("오디오 트랙 음소거 이벤트 발생");
            setTimeout(() => {
              if (audioTrack.muted && isMike) {
                console.log("오디오 트랙이 음소거 상태로 유지됨, 재시작 검토");
                restartMicrophoneIfNeeded();
              }
            }, 1000);
          });

          audioTrack._hasListeners = true;
        }

        newStream.addTrack(audioTrack);
        setLocalStream(newStream);
        console.log("새 스트림 생성됨 (오디오 포함)");

        // 녹음 서비스 업데이트
        const teamId = getValidTeamId();
        const service = recordingServiceRef.current;

        if (service) {
          if (isRecording && isRecordingPaused) {
            // 일시정지된 녹음 재개
            console.log("일시정지된 녹음 재개");
            await service.setupRecording(teamId, newStream);
            await service.startRecording(teamId);
            setIsRecordingPaused(false);
          } else if (!isRecording) {
            // 새 녹음 시작
            console.log("새 녹음 시작");
            await service.setupRecording(teamId, newStream);
            await service.startRecording(teamId);
            setIsRecordingPaused(false);
          } else {
            // 기존 녹음 소스 업데이트
            console.log("녹음 오디오 소스 업데이트");
            await service.updateAudioSource(teamId, newStream);
          }
        }
      } else {
        // 마이크 끄기
        if (localStream) {
          // 녹음 중이라면 일시정지
          const service = recordingServiceRef.current;
          if (service && isRecording && !isRecordingPaused) {
            const teamId = getValidTeamId();
            console.log("녹음 일시정지");
            await service.pauseRecording(teamId);
            setIsRecordingPaused(true);
          }

          // 오디오 트랙 중지 및 제거
          localStream.getAudioTracks().forEach((track) => {
            track.stop();
            localStream.removeTrack(track);
          });

          // 비디오 트랙만 유지한 새 스트림 생성
          const newStream = new MediaStream();
          const videoTracks = localStream.getVideoTracks();
          if (videoTracks.length > 0) {
            newStream.addTrack(videoTracks[0]);
            console.log("비디오 트랙만 유지한 새 스트림 생성");
          }

          setLocalStream(newStream);
        }
      }

      // 상태 업데이트
      setIsMike(nextState);
      console.log(`마이크 상태 변경 완료: ${nextState ? "켜짐" : "꺼짐"}`);

      // 재시작 시도 횟수 초기화
      microphoneRestartAttempts.current = 0;
    } catch (error) {
      console.error("마이크 상태 변경 실패:", error);

      // 사용자 친화적인 오류 메시지
      if (error.name === "NotAllowedError") {
        alert(
          "마이크 사용 권한이 필요합니다. 브라우저 설정에서 권한을 허용해주세요."
        );
      } else if (error.name === "NotFoundError") {
        alert(
          "연결된 마이크가 없거나 인식되지 않습니다. 마이크 연결을 확인해주세요."
        );
      } else if (error.name === "NotReadableError") {
        alert(
          "마이크가 다른 앱에서 사용 중이거나 하드웨어 오류가 발생했습니다."
        );
      } else if (error.name === "OverconstrainedError") {
        alert("지정한 오디오 제약 조건을 만족하는 마이크를 찾을 수 없습니다.");
        // 제약 조건 완화 후 재시도
        try {
          const stream = await navigator.mediaDevices.getUserMedia({
            audio: true,
          });
          const newStream = new MediaStream();
          newStream.addTrack(stream.getAudioTracks()[0]);
          setLocalStream(newStream);
          setIsMike(true);
          console.log("단순 제약 조건으로 마이크 연결 성공");
          return;
        } catch (retryError) {
          console.error("단순 제약 조건으로도 마이크 연결 실패:", retryError);
        }
      } else {
        alert("마이크 접근에 실패했습니다. 마이크 권한과 연결을 확인해주세요.");
      }

      setIsMike(false);
    } finally {
      isProcessingMikeChange.current = false;
    }
  }, [
    isMike,
    setIsMike,
    localStream,
    setLocalStream,
    isRecording,
    isRecordingPaused,
    setIsRecordingPaused,
    getValidTeamId,
    getOptimalAudioConstraints,
    restartMicrophoneIfNeeded,
    recordingServiceRef,
  ]);

  // 마이크 상태 모니터링
  useEffect(() => {
    if (!localStream || !isMike) return;

    console.log("마이크 상태 모니터링 시작");

    const checkMikeStatus = () => {
      if (!localStream) return;

      const audioTracks = localStream.getAudioTracks();

      // 활성 트랙 확인
      const activeTrackCount = audioTracks.filter(
        (track) => track.readyState === "live" && !track.muted
      ).length;

      // 디버깅 정보
      if (process.env.NODE_ENV === "development") {
        console.log("오디오 트랙 상태 확인:", {
          총트랙수: audioTracks.length,
          활성트랙수: activeTrackCount,
          음소거상태: audioTracks.some((t) => t.muted),
          준비상태: audioTracks.map((t) => t.readyState),
        });
      }

      // 활성 트랙이 없지만 마이크가 켜진 상태
      if (activeTrackCount === 0 && isMike) {
        console.warn("활성 오디오 트랙이 없습니다. 마이크 재연결 검토");
        restartMicrophoneIfNeeded();
      }

      // 각 트랙 상태 확인
      audioTracks.forEach((track) => {
        // 트랙 종료 이벤트 리스너 추가
        if (!track._hasEndedListener) {
          track.addEventListener("ended", () => {
            console.log("오디오 트랙 종료 이벤트 감지");
            restartMicrophoneIfNeeded();
          });
          track._hasEndedListener = true;
        }

        // 트랙 상태 확인
        if (track.readyState !== "live" && isMike) {
          console.warn(`오디오 트랙 상태 비정상: ${track.readyState}`);
          setTimeout(() => restartMicrophoneIfNeeded(), 500);
        }
      });
    };

    // 초기 확인
    checkMikeStatus();

    // 주기적 확인 - 2초 간격
    const intervalId = setInterval(checkMikeStatus, 2000);

    // 컴포넌트 언마운트 시 정리
    return () => {
      clearInterval(intervalId);
      console.log("마이크 상태 모니터링 종료");
    };
  }, [localStream, isMike, restartMicrophoneIfNeeded]);

  // 네트워크 연결 모니터링
  useEffect(() => {
    const handleNetworkChange = () => {
      const online = navigator.onLine;
      console.log(`네트워크 상태 변경: ${online ? "온라인" : "오프라인"}`);

      if (online && isMike) {
        // 네트워크 재연결 후 마이크 상태 확인
        setTimeout(() => {
          // 오디오 트랙 상태 확인
          const audioTracks = localStream?.getAudioTracks() || [];
          const hasLiveAudioTrack = audioTracks.some(
            (t) => t.readyState === "live" && !t.muted
          );

          if (!hasLiveAudioTrack) {
            console.log("네트워크 재연결 후 마이크 재시작 필요");
            restartMicrophoneIfNeeded();
          }
        }, 1000);
      }
    };

    // 네트워크 이벤트 리스너 추가
    window.addEventListener("online", handleNetworkChange);
    window.addEventListener("offline", handleNetworkChange);

    // 컴포넌트 언마운트 시 정리
    return () => {
      window.removeEventListener("online", handleNetworkChange);
      window.removeEventListener("offline", handleNetworkChange);
    };
  }, [isMike, localStream, restartMicrophoneIfNeeded]);

  return {
    handleMikeToggle,
    restartMicrophoneIfNeeded,
    isProcessingMikeChange,
  };
};

export default useMicrophoneManager;
