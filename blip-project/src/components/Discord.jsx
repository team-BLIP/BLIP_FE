import "./CSS/Discord.css";
import { typography } from "../fonts/fonts";
import { color } from "../style/color";
import DisAlarm from "../svg/DisAlarm.svg";
import NoMike from "../svg/NoMike.svg";
import NoCamera from "../svg/noCamera.svg";
import Mike from "../svg/Mike.svg";
import Camera from "../svg/DisCamera.svg";
import Fullscreen from "../svg/FullScreen.svg";
import X from "../svg/X.svg";
import { useContext, useEffect } from "react";
import { UseStateContext } from "../Router";
import { DiscordContext } from "../Router";

const SpeechRecognition =
  window.SpeechRecognition || window.webkitSpeechRecognition;

const Discord = () => {
  const {
    isMike,
    setIsMike,
    isCamera,
    setIsCamera,
    FullScreen,
    setFullScreen,
    setDiscord,
    meetingEnd,
    setMeetingEnd,
  } = useContext(UseStateContext);

  const {
    isListening,
    setIsListening,
    setTranscript,
    videoRef,
    stream,
    setStream,
  } = useContext(DiscordContext);

  const recognition = new SpeechRecognition();
  recognition.lang = "ko-KR"; // 한국어
  recognition.continuous = true; // 음성 인식
  recognition.interimResults = true; // 실시간 결과

  useEffect(() => {
    const getMediaStream = async () => {
      // 카메라와 마이크 설정을 통해 비디오 스트림을 가져옴
      if (!videoRef.current) return;

      try {
        const useStream = await navigator.mediaDevices.getUserMedia({
          video: {
            width: { ideal: 1280 }, //해상도
            height: { ideal: 720 },
            frameRate: { ideal: 30 }, //프레임 속도도
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

  useEffect(() => {
    if (isListening) {
      recognition.start();
    } else {
      recognition.stop();
    }
    recognition.onresult = (e) => {
      const newTracript = e.results[0][0].transcript;
      setTranscript(newTracript);
    };
    recognition.onerror = (error) => {
      console.log("음성인식 오류", error.error);
    };
    return () => {
      recognition.stop();
    };
  }, [isListening]);

  const onClickMike = () => {
    setIsMike((preState) => !preState);
    setIsListening((preState) => !preState);
  };

  const onClickCamera = () => {
    setIsCamera((preState) => !preState);
  };

  const onClickFull = () => {
    if (!FullScreen) {
      setFullScreen((preState) => !preState);
    }
  };

  const onClickEnd = () => {
    setMeetingEnd((preState) => !preState);
    setDiscord((preState) => !preState);
  };

  return (
    <>
      {meetingEnd ? (
        <div className="discord">
          <div
            className="discord-end"
            style={{ backgroundColor: color.GrayScale[8] }}
          >
            <div className="discord-end-x">
              <img src={X} onClick={onClickEnd} style={{ width: "3%" }} />
            </div>
            <div className="discord-end-fnot" style={{ color: color.White }}>
              <div style={typography.Title1}>회의가 종료되었어요.</div>
              <p style={typography.Title3}>
                BLIP이 회의를 요약해서 알려드릴게요!
              </p>
            </div>
          </div>
        </div>
      ) : (
        <div className="discord">
          <div
            className="discord-body"
            style={{ backgroundColor: color.GrayScale[8] }}
          >
            <div className="discord-main">
              {isCamera ? (
                <>
                  <video ref={videoRef} playsInline autoPlay muted={!isMike} />
                </>
              ) : (
                <>
                  <div className="discord-main-circle">
                    <div className="discord-main-circle-src"></div>
                  </div>
                  <div className="discord-main-foot">
                    <p style={typography.Title3}>정명우</p>
                  </div>
                </>
              )}
              <div className={`discord-main-nofoot${isCamera ? "-video" : ""}`}>
                <img src={isMike ? Mike : NoMike} onClick={onClickMike} />
                <img
                  src={isCamera ? Camera : NoCamera}
                  onClick={onClickCamera}
                />
              </div>
            </div>
          </div>
          <div
            className="discord-foot"
            style={{ backgroundColor: color.GrayScale[0] }}
          >
            <img src={DisAlarm} style={{ width: "4%" }} />
            <div className="discord-foot-Src">
              <div className="discord-foot-NoSrc">
                <img
                  src={isMike ? Mike : NoMike}
                  onClick={onClickMike}
                  style={{ width: "30%" }}
                />
                <img
                  src={isCamera ? Camera : NoCamera}
                  onClick={onClickCamera}
                  style={{ width: "30%" }}
                />
              </div>
              <img
                src={Fullscreen}
                onClick={onClickFull}
                style={{ width: "15%" }}
              />
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default Discord;
