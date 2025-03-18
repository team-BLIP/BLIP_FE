import { useNavigate } from "react-router-dom";
import { useState, useEffect, useRef } from "react";
import * as S from "../Signup/signupVoiceStyle";
import Logo from "../../svg/logo.svg";
import { typography } from "../../fonts/fonts";
import { color } from "../../style/color";
import Microphone from "../../svg/microphone.svg";
import NotSpeaking from "../../svg/notSpeaking.svg";
import MicrophoneBlur from "../../svg/microphoneBlur.svg";
import Speaking from "../../svg/speaking.svg";

const SignupVoice = () => {
  const navigate = useNavigate();

  const [isRecording, setIsRecording] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [voiceText, setVoiceText] = useState(
    "버튼을 눌러 다음과 같이 말해보세요!"
  );
  const mediaRecorderRef = useRef(null);
  const audioChunksRef = useRef([]);
  const recognitionRef = useRef(null);
  const silenceTimeoutRef = useRef(null);

  useEffect(() => {
    if (!("webkitSpeechRecognition" in window)) {
      console.warn("SpeechRecognition API를 지원하지 않는 브라우저ㅠ");
      return;
    }

    const recognition = new window.webkitSpeechRecognition();
    recognition.continuous = true;
    recognition.interimResults = true;

    recognition.onstart = () => {
      console.log("음성 인식 시작");
    };

    recognition.onresult = (event) => {
      setIsSpeaking(true);
      clearTimeout(silenceTimeoutRef.current);
      silenceTimeoutRef.current = setTimeout(() => {
        setIsSpeaking(false);
      }, 1000);

      if (event.results && event.results.length > 0) {
        const result = event.results[event.results.length - 1];
        if (result.isFinal) {
          setVoiceText("음성 인식 완료!");
        } else {
          setVoiceText("다시 한번 말해주세요!");
        }
      }
    };

    recognition.onerror = (event) => {
      console.error("음성 인식 오류:", event.error);
    };

    recognitionRef.current = recognition;
  }, []);

  const startRecording = async () => {
    const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
    mediaRecorderRef.current = new MediaRecorder(stream);

    mediaRecorderRef.current.ondataavailable = (event) => {
      if (event.data.size > 0) {
        audioChunksRef.current.push(event.data);
      }
    };

    mediaRecorderRef.current.onstop = () => {
      const audioBlob = new Blob(audioChunksRef.current, { type: "audio/wav" });
      const audioUrl = URL.createObjectURL(audioBlob);
      console.log("녹음된 파일:", audioUrl);
      audioChunksRef.current = [];
    };

    mediaRecorderRef.current.start();
    recognitionRef.current.start();
    setIsRecording(true);
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current) {
      mediaRecorderRef.current.stop();
    }
    if (recognitionRef.current) {
      recognitionRef.current.stop();
    }

    clearTimeout(silenceTimeoutRef.current);
    setIsRecording(false);
    setIsSpeaking(false);
  };

  return (
    <S.Container>
      <S.LogoContainer>
        <img src={Logo} alt="Logo" />
        <span style={{ ...typography.Label1, color: color.Black }}>BLIP</span>
      </S.LogoContainer>

      <S.Description style={{ ...typography.Body2, color: color.GrayScale[6] }}>
        이 설정을 통해 사용자의 목소리를 구분하여 인식하도록 돕습니다.
      </S.Description>

      <S.Phrase style={{ ...typography.Header1, color: color.Black }}>
        “문구가 들어갈 예정"
      </S.Phrase>

      <S.IsSpeaking src={isSpeaking ? Speaking : NotSpeaking} />

      <S.VoiceButtonWrapper>
        <S.VoiceButton
          src={isRecording ? MicrophoneBlur : Microphone}
          onClick={isRecording ? stopRecording : startRecording}
        />
        <S.VoiceText style={{ ...typography.Body2, color: color.Black }}>
          버튼을 눌러 다음과 같이 말해보세요!
        </S.VoiceText>
      </S.VoiceButtonWrapper>
    </S.Container>
  );
};

export default SignupVoice;
