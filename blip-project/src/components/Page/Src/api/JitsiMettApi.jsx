// JitsiMeetAPI.jsx - Jitsi API 관련 로직 분리
import React, { useEffect, useRef } from "react";

const JitsiMeetAPI = ({
  isTopic,
  isMike,
  isCamera,
  setApiInitialized,
  setLocalParticipantId,
  setParticipants,
  videoRef,
  setIsMettingStop,
  recorder,
  setRecorder,
  setRecordedChunks,
  setStream,
  setLocalStream,
}) => {
  const apiRef = useRef(null);
  const jitsiContainerRef = useRef(null);

  // 카메라 설정 함수
  const setupCamera = async () => {
    try {
      const constraints = {
        audio: true,
        video: true,
      };

      const mediaStream = await navigator.mediaDevices.getUserMedia(
        constraints
      );

      if (videoRef.current) {
        videoRef.current.srcObject = mediaStream;
      }

      setLocalStream(mediaStream);
      setStream(mediaStream);

      // 녹음기 설정
      if (mediaStream) {
        const mediaRecorder = new MediaRecorder(mediaStream);

        mediaRecorder.ondataavailable = (e) => {
          if (e.data.size > 0) {
            setRecordedChunks((preV) => [...preV, e.data]);
          }
        };

        setRecorder(mediaRecorder);

        // 회의 시작 시 녹음 시작
        if (isMike) {
          mediaRecorder.start();
          console.log("녹음 시작");
        }
      }

      return true;
    } catch (error) {
      console.error("카메라 설정 오류:", error);
      return false;
    }
  };

  // Jitsi Meet 초기화 함수
  const initJitsi = async () => {
    // 카메라 설정
    const cameraReady = await setupCamera();

    // Jitsi Meet API가 로드되었는지 확인
    if (!window.JitsiMeetExternalAPI) {
      console.error("Jitsi Meet API가 로드되지 않았습니다.");
      return;
    }

    // 기존 인스턴스 정리
    if (apiRef.current) {
      apiRef.current.dispose();
      apiRef.current = null;
    }

    // Jitsi Meet 설정
    const domain = "meet.jit.si";
    const options = {
      roomName: isTopic,
      width: "100%",
      height: "100%",
      parentNode: document.querySelector("#jitsi-iframe-container"),
      configOverwrite: {
        prejoinPageEnabled: false,
        disableDeepLinking: true,
        startWithAudioMuted: !isMike,
        startWithVideoMuted: !isCamera,
        enableWelcomePage: false,
        enableClosePage: false,
        disableThirdPartyRequests: true,
        logging: {
          defaultLogLevel: "debug",
        },
      },
      interfaceConfigOverwrite: {
        SHOW_JITSI_WATERMARK: false,
        SHOW_WATERMARK_FOR_GUESTS: false,
        DEFAULT_BACKGROUND: "#252525",
        DEFAULT_LOCAL_DISPLAY_NAME: "나",
        TOOLBAR_BUTTONS: [
          "microphone",
          "camera",
          "desktop",
          "chat",
          "raisehand",
        ],
        TOOLBAR_ALWAYS_VISIBLE: false,
        DISABLE_JOIN_LEAVE_NOTIFICATIONS: true,
        HIDE_INVITE_MORE_HEADER: true,
      },
    };

    try {
      const jitsiApi = new window.JitsiMeetExternalAPI(domain, options);
      apiRef.current = jitsiApi;

      // API 초기화 완료 상태 설정
      jitsiApi.addEventListener("videoConferenceJoined", (event) => {
        setApiInitialized(true);
        setLocalParticipantId(event.id);

        // 초기 참가자 목록에 자신 추가
        setParticipants([
          {
            id: event.id,
            name: "나",
            isLocal: true,
            isAudioMuted: !isMike,
            isVideoMuted: !isCamera,
          },
        ]);

        // 초기 마이크/카메라 상태 설정
        if (!isMike) {
          jitsiApi.executeCommand("toggleAudio");
        }

        if (!isCamera) {
          jitsiApi.executeCommand("toggleVideo");
        }
      });

      // 이벤트 리스너 등록
      jitsiApi.addEventListeners({
        participantJoined: (participant) => {
          console.log(`참가자 참가: ${participant.displayName}`);
          setParticipants((prev) => {
            if (prev.some((p) => p.id === participant.id)) {
              return prev;
            }
            return [
              ...prev,
              {
                id: participant.id,
                name: participant.displayName || "참가자",
                isLocal: false,
                isAudioMuted: true,
                isVideoMuted: true,
              },
            ];
          });
        },
        participantLeft: (participant) => {
          console.log(`참가자 퇴장: ${participant.id}`);
          setParticipants((prev) =>
            prev.filter((p) => p.id !== participant.id)
          );
        },
        readyToClose: () => {
          console.log("회의가 종료되었습니다.");
          if (apiRef.current) {
            apiRef.current.dispose();
            apiRef.current = null;
          }
          // 녹음기 정리
          if (recorder && recorder.state !== "inactive") {
            recorder.stop();
          }
        },
        audioMuteStatusChanged: (event) => {
          if (event.id) {
            setParticipants((prev) =>
              prev.map((p) =>
                p.id === event.id ? { ...p, isAudioMuted: event.muted } : p
              )
            );
          }
        },
        videoMuteStatusChanged: (event) => {
          if (event.id) {
            setParticipants((prev) =>
              prev.map((p) =>
                p.id === event.id ? { ...p, isVideoMuted: event.muted } : p
              )
            );
          }
        },
      });

      // 회의 시작됨을 표시
      setIsMettingStop(false);
    } catch (error) {
      console.error("Jitsi Meet 초기화 오류:", error);
      alert("화상 회의 초기화 중 오류가 발생했습니다: " + error.message);
    }
  };

  // 컴포넌트 마운트 시 Jitsi Meet API 스크립트 로드
  useEffect(() => {
    if (!window.JitsiMeetExternalAPI) {
      const script = document.createElement("script");
      script.src = "https://meet.jit.si/external_api.js";
      script.async = true;
      script.onload = () => {
        initJitsi();
      };

      script.onerror = (error) => {
        console.error("Jitsi API 로딩 실패:", error);
        alert("Jitsi API 로딩 실패: " + (error.message || "알 수 없는 오류"));
      };

      document.body.appendChild(script);

      return () => {
        if (script.parentNode) {
          document.body.removeChild(script);
        }
      };
    } else {
      initJitsi();
    }

    // 컴포넌트 언마운트 시 리소스 정리
    return () => {
      if (apiRef.current) {
        apiRef.current.dispose();
        apiRef.current = null;
      }

      // 녹음기 정리
      if (recorder && recorder.state !== "inactive") {
        recorder.stop();
      }
    };
  }, []);

  // 마이크 상태 변경 감지
  useEffect(() => {
    if (apiRef.current && setApiInitialized) {
      try {
        apiRef.current.executeCommand("toggleAudio");

        // 녹음 상태 조정
        if (recorder) {
          if (isMike && recorder.state !== "recording") {
            recorder.start();
            console.log("녹음 시작");
          } else if (!isMike && recorder.state === "recording") {
            recorder.stop();
            console.log("녹음 중지");
          }
        }
      } catch (error) {
        console.error("마이크 상태 변경 오류:", error);
      }
    }
  }, [isMike]);

  // 카메라 상태 변경 감지
  useEffect(() => {
    if (apiRef.current && setApiInitialized) {
      try {
        apiRef.current.executeCommand("toggleVideo");
      } catch (error) {
        console.error("카메라 상태 변경 오류:", error);
      }
    }
  }, [isCamera]);

  return (
    <div
      id="jitsi-iframe-container"
      style={{
        position: "absolute",
        height: "1px",
        width: "1px",
        opacity: 0.01,
      }}
    />
  );
};

export default JitsiMeetAPI;