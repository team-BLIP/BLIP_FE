import { useState, useEffect, useContext } from "react";
import { UseStateContext, Call } from "../../../../Router";

const UseMike = (stream) => {
  const { isMike, setIsMike } = useContext(UseStateContext);

  const { recorder, setRecorder } = useContext(Call);

  const [recordedChunks, setRecordedChunks] = useState([]);

  useEffect(() => {
    if (isMike && !recorder) {
      startRecording();
    } else if (!isMike && recorder) {
      stopRecording();
    }
  }, [isMike]);

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

      if (!isMike) {
        mediaRecorder.start();
        console.log("녹음 시작");
        setIsMike((preState) => !preState);
      }
    }
  };

  const stopRecording = () => {
    if (isMike && recorder) {
      recorder.stop();
      console.log("녹음 중지");
      setIsMike((preState) => !preState);
    }
  };

  const toggleMike = () => {
    setIsMike((preV) => !preV);
  };

  return { isMike, toggleMike, recordedChunks };
};

export default UseMike;
