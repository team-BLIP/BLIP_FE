import "./CSS/FullScreen.css";
import { typography } from "../fonts/fonts";
import { color } from "../style/color";
import { useContext, useState, useEffect } from "react";
import { UseStateContext } from "../Router";
import { DiscordContext } from "../Router";
import Exit from "../svg/Exit.svg";
import XFullScreen from "../svg/XFullScreen.svg";
import DisAlarm from "../svg/DisAlarm.svg";
import NoMike from "../svg/NoMike.svg";
import NoCamera from "../svg/noCamera.svg";
import Mike from "../svg/Mike.svg";
import Camera from "../svg/DisCamera.svg";

const SpeechRecognition =
  window.SpeechRecognition || window.webkitSpeechRecognition;

const FullScreenPage = () => {
  const {
    isMike,
    setIsMike,
    isCamera,
    setIsCamera,
    FullScreen,
    setFullScreen,
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

  const [peopleCount, setPeopleCount] = useState(0);

  const gridStyle = {
    display: "grid",
    placeItems: "center",
    gridTemplateColumns: `repeat(${peopleCount}, 1fr)`,
    gap: "10px",
    width: "100%",
    height: "90%",
  };

  const addPerson = () => {
    setPeopleCount((prev) => prev + 1);
    console.log(peopleCount);
  };
  const removePerson = () => setPeopleCount((prev) => Math.max(prev - 1, 1));

  const onClickFull = () => {
    if (FullScreen) setFullScreen((preState) => !preState);
  };

  const onClickMike = () => {
    setIsMike((preState) => !preState);
    setIsListening((preState) => !preState);
  };

  const onClickCamera = () => {
    setIsCamera((preState) => !preState);
  };

  const onClickMeetingEnd = () => {
    if (!meetingEnd) {
      setMeetingEnd((preState) => !preState);
      setFullScreen((preState) => !preState);
    }
  };

  return (
    <div className="FullScreen">
      <div
        className="FullScreen-main"
        style={{ backgroundColor: color.GrayScale[8], ...gridStyle }}
      >
        {Array.from({ length: peopleCount }).map((_, index) => (
          <>
            <div key={index} className="screen">
              {isCamera ? (
                <>
                  <video ref={videoRef} playsInline autoPlay muted={!isMike} />
                </>
              ) : (
                <>
                  <div className="screen-circle">
                    <div></div>
                  </div>
                  <div
                    className="screen-name"
                    style={{ ...typography.Title3, color: color.White }}
                  >
                    정명우
                  </div>
                  <div className="screen-src">
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
              )}
            </div>
          </>
        ))}
      </div>
      <div
        className="FullScreen-foot"
        style={{ backgroundColor: color.GrayScale[0] }}
      >
        <div className="FullScreen-foot-src">
          <img src={isMike ? Mike : NoMike} onClick={onClickMike} />
          <img src={isCamera ? Camera : NoCamera} onClick={onClickCamera} />
          <img src={XFullScreen} onClick={onClickFull} />
          <button onClick={addPerson}>+</button>
          <button onClick={removePerson}>-</button>
        </div>
        <div className="FullScreen-foot-exit">
          <img src={Exit} onClick={onClickMeetingEnd} />
        </div>
      </div>
    </div>
  );
};

export default FullScreenPage;
