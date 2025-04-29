import { useEffect, useRef, useState, useCallback } from "react";
import { handleMeetingEnd } from "../api/MeetingEndApi";

const JitsiMeetAPI = ({ meetingConfig }) => {
  const {
    meetingId,
    setMeetingId,
    meetingEnd,
    setMeetingEnd,
    createTeamId,
    itemBackendId,
  } = meetingConfig || {};

  const [isScriptLoading, setIsScriptLoading] = useState(false);
  const apiRef = useRef(null);

  const loadJitsiScript = useCallback(
    (retryCount = 5, delay = 3000) => {
      return new Promise((resolve, reject) => {
        // 이미 로드되었는지 확인
        if (
          window.JitsiMeetExternalAPI ||
          sessionStorage.getItem("jitsiScriptLoaded")
        ) {
          resolve();
          return;
        }

        // 현재 로딩 중인지 확인
        if (isScriptLoading) {
          const checkInterval = setInterval(() => {
            if (
              window.JitsiMeetExternalAPI ||
              sessionStorage.getItem("jitsiScriptLoaded")
            ) {
              clearInterval(checkInterval);
              resolve();
            }
          }, 100);
          return;
        }

        setIsScriptLoading(true);
        let attempts = 0;

        const tryLoadScript = () => {
          const script = document.createElement("script");
          // public 폴더의 파일 사용
          script.src = "/external_api.js"; // public 폴더에 있는 파일 경로
          script.async = true;

          script.onload = () => {
            sessionStorage.setItem("jitsiScriptLoaded", "true");
            setIsScriptLoading(false);
            resolve();
          };

          script.onerror = () => {
            attempts++;
            console.error(
              `로컬 스크립트 로드 실패. 재시도 중... (${attempts}/${retryCount})`
            );

            if (attempts < retryCount) {
              setTimeout(tryLoadScript, delay);
            } else if (attempts === retryCount) {
              // 로컬 파일 로드 실패 시 CDN으로 시도
              console.log("로컬 파일 로드 실패, CDN으로 시도합니다.");
              script.src = "https://meet.jit.si/external_api.js";
              document.body.appendChild(script);
            } else {
              setIsScriptLoading(false);
              reject(new Error("Jitsi API 로드 실패"));
            }
          };

          document.body.appendChild(script);
        };

        tryLoadScript();
      });
    },
    [isScriptLoading]
  );

  const initializeJitsi = useCallback(async () => {
    try {
      await loadJitsiScript();

      // JitsiMeetExternalAPI가 로드되었는지 확인
      if (!window.JitsiMeetExternalAPI) {
        throw new Error("JitsiMeetExternalAPI가 정의되지 않았습니다");
      }

      const domain = "meet.jit.si";
      const options = {
        roomName: `testRoom_${meetingId || "default"}`,
        parentNode: document.getElementById("jitsi-container"),
        userInfo: {
          displayName: "Test User",
        },
        // 필요한 추가 옵션
        configOverwrite: {
          prejoinPageEnabled: false,
          disableDeepLinking: true,
        },
        interfaceConfigOverwrite: {
          SHOW_JITSI_WATERMARK: false,
        },
      };

      console.log("Jitsi API 초기화 중, 방 이름:", options.roomName);

      // 이전 인스턴스 정리
      if (apiRef.current) {
        apiRef.current.dispose();
      }

      apiRef.current = new window.JitsiMeetExternalAPI(domain, options);

      // 회의 종료 이벤트 리스너 추가
      apiRef.current.addListener("videoConferenceLeft", () => {
        console.log("Jitsi 회의에서 나감");
        if (setMeetingEnd) {
          setMeetingEnd(false);
        }
      });
    } catch (error) {
      console.error("Jitsi API 초기화 오류:", error);
    }
  }, [loadJitsiScript, meetingId, setMeetingEnd]);

  // meetingEnd 상태 변경 감지
  useEffect(() => {
    if (apiRef.current && meetingEnd === false) {
      console.log("회의 종료 감지, Jitsi API hangup 호출");
      apiRef.current.executeCommand("hangup");

      // meetingId가 있으면 서버에 종료 API 호출
      if (meetingId) {
        console.log("meetingId 있음, MeetingEndApi 호출:", meetingId);

        // 회의 종료 전에 녹음 데이터 확인
        const recordingBlob =
          window.recordedChunks?.length > 0
            ? new Blob(window.recordedChunks, { type: "audio/mpeg" })
            : null;

        if (!recordingBlob) {
          console.warn(
            "녹음 데이터가 없습니다. 회의 종료 API 호출을 건너뜁니다."
          );
          alert(
            "녹음 데이터가 없어 회의 종료를 진행할 수 없습니다. 마이크 권한을 확인해주세요."
          );
          return;
        }

        // 녹음 데이터가 있을 때만 API 호출
        handleMeetingEnd(
          meetingId,
          null, // teamId
          setMeetingId,
          createTeamId,
          itemBackendId,
          recordingBlob // 녹음 데이터 전달
        )
          .then((result) => {
            console.log("회의 종료 API 호출 성공:", result);
            if (result.success) {
              alert("회의가 성공적으로 종료되었습니다.");
            } else {
              console.error("회의 종료 처리 중 오류:", result.error);
              alert(`회의 종료 중 문제가 발생했습니다: ${result.error}`);
            }
          })
          .catch((err) => {
            console.error("회의 종료 API 호출 실패:", err);
            alert("회의 종료 중 오류가 발생했습니다. 다시 시도해 주세요.");
          });
      }
    }
  }, [meetingEnd, meetingId, setMeetingId, createTeamId, itemBackendId]);

  return (
    <div
      id="jitsi-container"
      style={{
        height: "500px",
        width: "100%",
        borderRadius: "8px",
        overflow: "hidden",
        boxShadow: "0 4px 6px rgba(0, 0, 0, 0.1)",
      }}
    />
  );
};

export default JitsiMeetAPI;
