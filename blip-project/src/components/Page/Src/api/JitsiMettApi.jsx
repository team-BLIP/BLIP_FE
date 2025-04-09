// JitsiMeetAPI.jsx - Jitsi API 관련 로직 분리
import React, { useEffect, useRef, useState } from "react";

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
  const [loadingError, setLoadingError] = useState(false);
  const [retryCount, setRetryCount] = useState(0);
  const maxRetries = 3;

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
      roomName: isTopic || "BLIP_Meeting_" + Date.now(), // 룸 이름이 없을 경우 대체
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
      console.log("Jitsi API 초기화 시작:", {
        domain,
        roomName: options.roomName,
      });
      const jitsiApi = new window.JitsiMeetExternalAPI(domain, options);
      apiRef.current = jitsiApi;

      // API 초기화 완료 상태 설정
      jitsiApi.addEventListener("videoConferenceJoined", (event) => {
        console.log("화상 회의 참가 성공:", event);
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
        connectionEstablished: () => {
          console.log("Jitsi 서버와 연결 성공");
        },
        connectionFailed: () => {
          console.error("Jitsi 서버와 연결 실패");
        },
        error: (error) => {
          console.error("Jitsi API 오류:", error);
        },
      });

      // 회의 시작됨을 표시
      setIsMettingStop(false);
    } catch (error) {
      console.error("Jitsi Meet 초기화 오류:", error);
      alert("화상 회의 초기화 중 오류가 발생했습니다: " + error.message);
    }
  };

  // Jitsi API 스크립트 로드 함수 (재시도 및 폴백 로직 포함)
  const loadJitsiScript = () => {
    // 이미 로드되었으면 초기화만 진행
    if (window.JitsiMeetExternalAPI) {
      console.log("Jitsi API가 이미 로드되어 있습니다.");
      initJitsi();
      return;
    }

    console.log(`Jitsi API 로딩 시도 (${retryCount + 1}/${maxRetries})`);

    // 기존 스크립트 제거 (재시도 시)
    const existingScript = document.querySelector('script[src*="jitsi"]');
    if (existingScript) {
      existingScript.remove();
    }

    // URL 목록 - 순서대로 시도
    const scriptUrls = [
      "https://meet.jit.si/external_api.js", // 기본 URL
      "https://cdn.jsdelivr.net/npm/lib-jitsi-meet@latest/dist/jitsi-meet.min.js", // 대체 CDN 1
      "https://unpkg.com/lib-jitsi-meet", // 대체 CDN 2
    ];

    const currentUrl = scriptUrls[retryCount % scriptUrls.length];
    console.log(`현재 시도 URL: ${currentUrl}`);

    const script = document.createElement("script");
    script.src = currentUrl;
    script.async = true;
    script.onload = () => {
      console.log("Jitsi API 로딩 성공:", currentUrl);
      setLoadingError(false);
      initJitsi();
    };

    script.onerror = (error) => {
      console.error(`Jitsi API 로딩 실패 (${currentUrl}):`, error);

      if (retryCount < maxRetries - 1) {
        // 다음 URL로 재시도
        setRetryCount((prev) => prev + 1);
        const nextRetryDelay = 2000;
        console.log(`${nextRetryDelay}ms 후 다른 URL로 재시도...`);
        setTimeout(loadJitsiScript, nextRetryDelay);
      } else {
        // 최대 재시도 횟수 초과
        console.error("최대 재시도 횟수 초과");
        setLoadingError(true);
      }
    };

    document.body.appendChild(script);
  };

  // 컴포넌트 마운트 시 Jitsi Meet API 스크립트 로드
  useEffect(() => {
    loadJitsiScript();

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

  // 로딩 에러 발생 시 대체 UI 표시
  if (loadingError) {
    return (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          alignItems: "center",
          backgroundColor: "#f5f5f5",
          padding: "20px",
          textAlign: "center",
        }}
      >
        <h3>화상 회의 연결에 실패했습니다</h3>
        <p>네트워크 연결을 확인한 후 다시 시도해주세요.</p>
        <div style={{ marginTop: "20px", textAlign: "left" }}>
          <p>
            <strong>문제 해결 방법:</strong>
          </p>
          <ul>
            <li>인터넷 연결 상태를 확인하세요.</li>
            <li>방화벽이나 프록시 설정을 확인하세요.</li>
            <li>Jitsi Meet 서버(meet.jit.si)에 접근 가능한지 확인하세요.</li>
            <li>브라우저를 새로고침하거나 다시 시작해보세요.</li>
            <li>다른 네트워크 환경(예: 모바일 데이터)으로 시도해보세요.</li>
          </ul>
        </div>
        <button
          onClick={() => {
            setRetryCount(0);
            setLoadingError(false);
            loadJitsiScript();
          }}
          style={{
            padding: "10px 20px",
            backgroundColor: "#4285f4",
            color: "white",
            border: "none",
            borderRadius: "4px",
            cursor: "pointer",
            marginTop: "20px",
          }}
        >
          다시 시도
        </button>
      </div>
    );
  }

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
