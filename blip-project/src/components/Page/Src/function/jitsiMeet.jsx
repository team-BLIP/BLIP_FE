// const JitsiMeet = () => {
//   useEffect(() => {
//     const script = document.createElement("script");
//     script.src = "https://meet.jit.si/external_api.js";
//     script.async = true;

//     script.onload = () => {
//       const domain = "meet.jit.si";
//       const options = {
//         roomName: "TestRoom",
//         width: "100%",
//         height: "100%",
//         parentNode: document.querySelector("#jitsi-iframe-container"),
//         configOverwrite: {
//           startWithAudioMuted: false,
//           startWithVideoMuted: false,
//           enableWelcomePage: false,
//         },
//         interfaceConfigOverwrite: {
//           filmStripOnly: false,
//         },
//       };

//       const api = new window.JitsiMeetExternalAPI(domain, options);

//       api.addEventListener("videoConferenceJoined", () => {
//         console.log("화상 회의에 참가했습니다!");

//         // 음성 녹음 시작
//         const stream = api
//           .getLocalTracks()
//           .find((track) => track.getType() === "audio").jitsiTrack._track;
//         const mediaRecorder = new MediaRecorder(stream);

//         mediaRecorder.ondataavailable = (event) => {
//           const audioBlob = event.data;
//           const audioUrl = URL.createObjectURL(audioBlob);
//           console.log("녹음된 오디오 URL:", audioUrl);
//           // 오디오 저장이나 처리 로직을 추가할 수 있습니다.
//         };

//         mediaRecorder.start();

//         // 회의 종료 시 녹음 중지
//         api.addEventListener("videoConferenceLeft", () => {
//           mediaRecorder.stop();
//         });
//       });
//     };

//     script.onerror = (error) => {
//       console.error("Jitsi API 로딩 실패:", error);
//       alert("Jitsi API 로딩 실패: " + (error.message || "알 수 없는 오류"));
//     };

//     document.head.appendChild(script);

//     return () => {
//       const scriptElement = document.querySelector(
//         'script[src="https://meet.jit.si/external_api.js"]'
//       );
//       if (scriptElement) {
//         document.head.removeChild(scriptElement);
//       }
//     };
//   }, []);

//   return (
//     <div
//       id="jitsi-iframe-container"
//       style={{
//         height: "600px",
//         width: "100%",
//         backgroundColor: "blue",
//       }}
//     />
//   );
// };

// export default JitsiMeet;

import React, { useState, useEffect, useContext } from "react";
import "../../../CSS/Grid.css";
import { typography } from "../../../../fonts/fonts";
import { color } from "../../../../style/color";
import { TeamDel } from "../../Main/Main";
import { UseStateContext } from "../../../../Router";
import { DiscordContext } from "../../../../Router";
import { Call } from "../../../../Router";
import NoMike from "../../../../svg/NoMike.svg";
import NoCamera from "../../../../svg/noCamera.svg";
import Mike from "../../../../svg/Mike.svg";
import Camera from "../../../../svg/DisCamera.svg";

const SpeechRecognition =
  window.SpeechRecognition || window.webkitSpeechRecognition;

const JitsiMeetWithGrid = ({ setIsMettingStop }) => {
  const { itemId } = useContext(TeamDel);
  const { isMike, setIsMike, isCamera, setIsCamera } =
    useContext(UseStateContext);
  const { videoRef, stream, setStream } = useContext(DiscordContext);
  const { recorder, setRecorder, setRecordedChunks } = useContext(Call);

  const recognition = new SpeechRecognition();
  recognition.lang = "ko-KR";
  recognition.continuous = true;
  recognition.interimResults = true;

  useEffect(() => {
    const script = document.createElement("script");
    script.src = "ws://192.168.1.42:8080/signaling";
    script.async = true;

    script.onload = () => {
      const domain = "192.168.1.42";
      const options = {
        roomName: "TestRoom",
        width: "100%",
        height: "100%",
        parentNode: document.querySelector("#jitsi-iframe-container"),
        configOverwrite: {
          startWithAudioMuted: false,
          startWithVideoMuted: false,
          enableWelcomePage: false,
        },
        interfaceConfigOverwrite: {
          filmStripOnly: false,
        },
      };

      const api = new window.JitsiMeetExternalAPI(domain, options);

      // 음성 녹음 기능
      api.addEventListener("videoConferenceJoined", () => {
        const stream = api
          .getLocalTracks()
          .find((track) => track.getType() === "audio").jitsiTrack._track;
        const mediaRecorder = new MediaRecorder(stream);

        mediaRecorder.ondataavailable = (event) => {
          const audioBlob = event.data;
          const audioUrl = URL.createObjectURL(audioBlob);
          console.log("녹음된 오디오 URL:", audioUrl);
          // 오디오 저장이나 처리 로직을 추가
        };

        // 회의 시작 시 녹음 시작
        mediaRecorder.start();
        setRecorder(mediaRecorder);
        console.log("녹음 시작");

        // 회의 종료 시 녹음 중지
        api.addEventListener("videoConferenceLeft", () => {
          mediaRecorder.stop();
        });
      });
    };

    script.onerror = (error) => {
      console.error("Jitsi API 로딩 실패:", error);
      alert("Jitsi API 로딩 실패: " + (error.message || "알 수 없는 오류"));
    };

    document.head.appendChild(script);

    return () => {
      const scriptElement = document.querySelector(
        'script[src="ws://192.168.1.42:8080/signaling"]'
      );
      if (scriptElement) {
        document.head.removeChild(scriptElement);
      }
    };
  }, []);

  useEffect(() => {
    if (setIsMettingStop) {
      // 회의 중지 시 녹음 중지
      if (recorder && recorder.state !== "inactive") {
        recorder.stop();
        console.log("회의 종료: 녹음 중지");
      }
    } else {
      // 회의 시작 시 녹음 시작
      if (recorder && recorder.state === "inactive") {
        startRecording();
      }
    }
  }, [setIsMettingStop, recorder]);

  const onClickMike = () => {
    if (isMike) {
      recorder.stop();
      setIsMike(false);
    } else {
      startRecording();
      setIsMike(true);
    }
  };

  const onClickCamera = () => {
    setIsCamera((preState) => !preState);
  };

  const startRecording = () => {
    if (!stream) return;

    const mediaRecorder = new MediaRecorder(stream);
    setRecorder(mediaRecorder);

    mediaRecorder.ondataavailable = (e) => {
      if (e.data.size > 0) {
        setRecordedChunks((preV) => [...preV, e.data]);
      }
    };

    mediaRecorder.start();
    console.log("녹음 시작");
  };

  const users = [
    { id: 1, name: "유저1", isCameraOn: true },
    { id: 2, name: "유저2", isCameraOn: false },
  ];

  return (
    <div className="FullGrid-grid">
      {users.length > 1 && users.length % 2 === 1 ? (
        <>
          {users.slice(0, users.length - 1).map((user, index) => (
            <div key={index} className="screen">
              {isCamera ? (
                <video ref={videoRef} playsInline autoPlay muted={!isMike} />
              ) : (
                <div className="FullGrid-main-circle">
                  <div className="FullGrid-main-circle-src"></div>
                </div>
              )}
              <div className="FullGrid-main-foot">
                <p style={typography.Title3}>{user.name}</p>
              </div>
              <div
                className={`FullGrid-main-nofoot${isCamera ? "-video" : ""}`}
              >
                <img
                  src={isMike ? Mike : NoMike}
                  onClick={onClickMike}
                  style={{ width: "5%" }}
                />
                <img
                  src={isCamera ? Camera : NoCamera}
                  onClick={onClickCamera}
                  style={{ width: "5%" }}
                />
              </div>
            </div>
          ))}
          <div className="FullGrid-main-last">
            <div className="FullGrid-main-last-Div">
              {users[users.length - 1].isCameraOn && isCamera ? (
                <video ref={videoRef} playsInline autoPlay muted={!isMike} />
              ) : (
                <div className="FullGrid-main-circle">
                  <div className="FullGrid-main-circle-src-last"></div>
                </div>
              )}
              <div className="FullGrid-main-foot-last">
                <p style={{ ...typography.Title3, color: color.White }}>
                  {users[users.length - 1].name}
                </p>
              </div>
              <div
                className={`FullGrid-main-nofoot${isCamera ? "-video" : ""}`}
              >
                <img
                  src={isMike ? Mike : NoMike}
                  onClick={onClickMike}
                  style={{ width: "5%" }}
                />
                <img
                  src={isCamera ? Camera : NoCamera}
                  onClick={onClickCamera}
                  style={{ width: "5%" }}
                />
              </div>
            </div>
          </div>
        </>
      ) : (
        <>
          {users.map((user) => (
            <div key={user.id} className="screen">
              {isCamera ? (
                <video ref={videoRef} playsInline autoPlay muted={!isMike} />
              ) : (
                <div className="FullGrid-main-circle">
                  <div className="FullGrid-main-circle-src"></div>
                </div>
              )}
              <div className="FullGrid-main-foot">
                <p style={typography.Title3}>{user.name}</p>
              </div>
              <div
                className={`FullGrid-main-nofoot${isCamera ? "-video" : ""}`}
              >
                <img
                  src={isMike ? Mike : NoMike}
                  onClick={onClickMike}
                  style={{ width: "5%" }}
                />
                <img
                  src={isCamera ? Camera : NoCamera}
                  onClick={onClickCamera}
                  style={{ width: "5%" }}
                />
              </div>
            </div>
          ))}
        </>
      )}
      {/* Jitsi iframe container */}
      <div id="jitsi-iframe-container" style={{ display: "none" }} />
    </div>
  );
};

export default JitsiMeetWithGrid;
