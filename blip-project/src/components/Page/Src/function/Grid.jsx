import "../../../CSS/Grid.css";
import { typography } from "../../../../fonts/fonts";
import { color } from "../../../../style/color";
import { useContext, useEffect, useState } from "react";
import { TeamDel } from "../../Main/Main";
import { UseStateContext } from "../../../../Router";
import { DiscordContext } from "../../../../Router";
import { Call } from "../../../../Router";
import NoMike from "../../../../svg/NoMike.svg";
import NoCamera from "../../../../svg/NoCamera.svg";
import Mike from "../../../../svg/Mike.svg";
import Camera from "../../../../svg/DisCamera.svg";
import { data } from "react-router-dom";

// const SpeechRecognition =
//   window.SpeechRecognition || window.webkitSpeechRecognition;

const FullGrid = () => {
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
    const getMediaStream = async () => {
      if (!videoRef.current) return;

      try {
        const useStream = await navigator.mediaDevices.getUserMedia({
          video: {
            width: { ideal: 1280 },
            height: { ideal: 720 },
            frameRate: { ideal: 30 },
          },
          audio: true,
        });
        if (stream) {
          const tracks = stream.getTracks();
          tracks.forEach((track) => track.stop());
        }
        if (videoRef.current) {
          videoRef.current.srcObject = useStream;
        }
        setStream(useStream);
      } catch (error) {
        console.error("MediaStream 에러:", error);
      }
    };
    if (isCamera && !stream) {
      getMediaStream();
    } else if (!isCamera && stream) {
      const tracks = stream.getTracks();
      tracks.forEach((track) => track.stop());
      setStream(null);
      if (videoRef.current) {
        videoRef.current.srcObject = null;
      }
    }

    return () => {
      if (stream) {
        const tracks = stream.getTracks();
        tracks.forEach((track) => track.stop());
      }
    };
  }, [isCamera, stream]);

  const startRecording = () => {
    if (!stream) return;

    const mediaRecorder = new MediaRecorder(stream);
    setRecorder(mediaRecorder);

    if (!isMike) {
      mediaRecorder.ondataavailable = (e) => {
        if (e.data.size > 0) {
          setRecordedChunks((preV) => [...preV, e.data]);
        }
      };

      mediaRecorder.start();
      console.log("녹음 시작");
      setIsMike((preState) => !preState);
    }
  };

  const stopRecording = () => {
    if (recorder) {
      recorder.stop();
      console.log("녹음 중지");
      setIsMike((preState) => !preState);
    }
  };

  const onClickCamera = () => {
    setIsCamera((preState) => !preState);
  };

  // const { isMike, toggleMike, recordedChunks } = UseMike(stream);

  // const [api, setApi] = useState(null);
  // const [users, setUsers] = useState([]);

  // useEffect(() => {
  //   const loadJitsiScript = () => {
  //     return new Promise((resolve, reject) => {
  //       const script = document.createElement("script");
  //       script.src = "https://meet.jit.si/external_api.js";
  //       script.onload = () => initializeJitsi();
  //       script.onerror = reject;
  //       document.body.appendChild(script);
  //     });
  //   };

  //   loadJitsiScript().then(() => {
  //     if (window.JitsiMeetExternalAPI) {
  //       const domain = "meet.jit.si";
  //       const options = {
  //         roomName: "my-meeting-room",
  //         width: "100%",
  //         height: "100%",
  //         parentNode: document.getElementById("jitsi-container"),
  //         configOverwrite: {
  //           startWithAudioMuted: !isMike,
  //           startWithVideoMuted: !isCamera,
  //         },
  //       };
  //       const jitsiApi = new window.JitsiMeetExternalAPI(domain, options);
  //       setApi(jitsiApi);

  //       // 회의에 참가 이벤트
  //       jitsiApi.addEventListener("videoConferenceJoined", (e) => {
  //         console.log("jitsi 회의에 참가");
  //       });

  //       //참가자 리스트 및 이벤트 처리
  //       jitsiApi.addEventListener("participantJoined", (e) => {
  //         console.log(e, "새로운 참가자");
  //         const newUser = {
  //           id: e.id,
  //           name: e.displayName || `참가자 ${e.id}`,
  //           isCameraOn: true,
  //         };
  //         setUsers((preUsers) => preUsers.filter((users) => users.id !== e.id));
  //       });

  //       jitsiApi.addEventListener("participantLeft", (e) => {
  //         console.log(e, "참가자가 나감");
  //       });

  //       return () => {
  //         jitsiApi.dispose();
  //       };
  //     } else {
  //       console.log("로드 안됨");
  //     }
  //   });
  // }, [isCamera, isMike]);

  const users = [
    { id: 1, name: "유저1", isCameraOn: true },
    { id: 2, name: "유저2", isCameraOn: false },
    { id: 3, name: "유저3", isCameraOn: true },
    // { id: 4, name: "유저4", isCameraOn: true },
    // { id: 4, name: "유저4", isCameraOn: true },
  ];

  return (
    <div className="FullGrid-grid">
      {users.length > 1 && users.length % 2 === 1 ? (
        <>
          {users.slice(0, users.length - 1).map((users, index) => (
            <div key={index} className="screen">
              {isCamera ? (
                <>
                  <video
                    key={itemId}
                    ref={videoRef}
                    playsInline
                    autoPlay
                    muted={!isMike}
                  />
                </>
              ) : (
                <>
                  <div className="FullGrid-main-circle">
                    <div className="FullGrid-main-circle-src"></div>
                  </div>
                  <div className="FullGrid-main-foot">
                    <p style={typography.Title3}>{itemId}</p>
                  </div>
                </>
              )}
              <div
                className={`FullGrid-main-nofoot${isCamera ? "-video" : ""}`}
              >
                <img
                  src={isMike ? Mike : NoMike}
                  onClick={isMike ? stopRecording : startRecording}
                />
                <img
                  src={isCamera ? Camera : NoCamera}
                  onClick={onClickCamera}
                />
              </div>
            </div>
          ))}
          <div className="FullGrid-main-last">
            <div className="FullGrid-main-last-Div">
              {users[users.length - 1].isCameraOn && isCamera ? (
                //1개 이상이고 홀수 일때 마지막 요소
                <>
                  <video
                    key={itemId}
                    ref={videoRef}
                    playsInline
                    autoPlay
                    muted={!isMike}
                  />
                  <div
                    className={`FullGrid-main-nofoot${
                      isCamera ? "-video" : ""
                    }`}
                  >
                    {isCamera ? (
                      ""
                    ) : (
                      <>
                        <img
                          src={isMike ? Mike : NoMike}
                          onClick={isMike ? stopRecording : startRecording}
                        />
                        <img
                          src={isCamera ? Camera : NoCamera}
                          onClick={onClickCamera}
                        />
                      </>
                    )}
                  </div>
                </>
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
                  onClick={isMike ? stopRecording : startRecording}
                />
                <img
                  src={isCamera ? Camera : NoCamera}
                  onClick={onClickCamera}
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
                <>
                  <video ref={videoRef} playsInline autoPlay muted={!isMike} />
                  <div
                    className={`FullGrid-main-nofoot${
                      isCamera ? "-video" : ""
                    }`}
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
                </>
              ) : (
                <>
                  <div className="FullGrid-main-circle">
                    <div className="FullGrid-main-circle-src"></div>
                  </div>
                  <div className="FullGrid-main-foot">
                    <p style={typography.Title3}>{user.name}</p>
                  </div>
                  <div
                    className={`FullGrid-main-nofoot${
                      isCamera ? "-video" : ""
                    }`}
                  >
                    <img src={isMike ? Mike : NoMike} onClick={onClickMike} />
                    <img
                      src={isCamera ? Camera : NoCamera}
                      onClick={onClickCamera}
                    />
                  </div>
                </>
              )}
            </div>
          ))}
        </>
      )}
    </div>
  );
};

export default FullGrid;
