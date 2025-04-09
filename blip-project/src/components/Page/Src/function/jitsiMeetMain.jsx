// JitsiMeetMain.jsx - 컨테이너 컴포넌트
import React, { useState, useEffect, useContext } from "react";
import "../../../CSS/Grid.css";
import { TeamDel, FindId } from "../../Main/Main";
import { UseStateContext, DiscordContext, Call } from "../../../../Router";
import JitsiMeetAPI from "../api/JitsiMettApi";
import ParticipantsGrid from "./ParticipantsGrid";
import ControlBar from "./ControlBar";

const JitsiMeetMain = ({ setIsMettingStop }) => {
  const { itemId, isTopic, inputName } = useContext(TeamDel);
  const { isMike, setIsMike, isCamera, setIsCamera } =
    useContext(UseStateContext);
  const { videoRef, stream, setStream, isListening, setIsListening } =
    useContext(DiscordContext);
  const { recorder, setRecorder, setRecordedChunks } = useContext(Call);
  const { createTeamId } = useContext(FindId);

  // 상태 관리
  const [apiInitialized, setApiInitialized] = useState(false);
  const [participants, setParticipants] = useState([
    {
      id: createTeamId,
      name: inputName,
      isLocal: true,
      isAudioMuted: !isMike,
      isVideoMuted: !isCamera,
    },
  ]);
  const [localParticipantId, setLocalParticipantId] = useState(null);
  const [localStream, setLocalStream] = useState(null);

  // 녹음 관련 상태
  const [isRecording, setIsRecording] = useState(false);
  const [isPaused, setIsPaused] = useState(false);

  // 회의 초기화 상태 로깅
  useEffect(() => {
    console.log("JitsiMeetMain 마운트됨:", {
      isTopic,
      isMike,
      isCamera,
      participantsCount: participants.length,
    });
  }, []);

  // API 초기화 상태 모니터링
  useEffect(() => {
    console.log("API 초기화 상태 변경:", apiInitialized);
  }, [apiInitialized]);

  // 녹음 토글 핸들러
  const handleToggleRecording = () => {
    if (isRecording) {
      // 녹음 중지
      if (recorder && recorder.state !== "inactive") {
        recorder.stop();
      }
      setIsRecording(false);
      setIsPaused(false);
    } else {
      // 녹음 시작
      if (recorder && recorder.state === "inactive") {
        recorder.start();
        setIsRecording(true);
      }
    }
  };

  // 녹음 일시정지 핸들러
  const handlePauseRecording = () => {
    if (recorder && recorder.state === "recording") {
      recorder.pause();
      setIsPaused(true);
    }
  };

  // 녹음 재개 핸들러
  const handleResumeRecording = () => {
    if (recorder && recorder.state === "paused") {
      recorder.resume();
      setIsPaused(false);
    }
  };

  // 이벤트 핸들러
  const handleMikeToggle = () => {
    setIsMike((prev) => !prev);
  };

  const handleCameraToggle = () => {
    setIsCamera((prev) => !prev);
  };

  return (
    <div className="FullGrid-grid">
      <JitsiMeetAPI
        isTopic={isTopic}
        isMike={isMike}
        isCamera={isCamera}
        setApiInitialized={setApiInitialized}
        setLocalParticipantId={setLocalParticipantId}
        setParticipants={setParticipants}
        videoRef={videoRef}
        setIsMettingStop={setIsMettingStop}
        recorder={recorder}
        setRecorder={setRecorder}
        setRecordedChunks={setRecordedChunks}
        setStream={setStream}
        setLocalStream={setLocalStream}
      />
      <ParticipantsGrid
        participants={participants}
        isCamera={isCamera}
        isMike={isMike}
        videoRef={videoRef}
        handleMikeToggle={handleMikeToggle}
        handleCameraToggle={handleCameraToggle}
      />
      <ControlBar
        isRecording={isRecording}
        isPaused={isPaused}
        onToggleRecording={handleToggleRecording}
        onPauseRecording={handlePauseRecording}
        onResumeRecording={handleResumeRecording}
      />
    </div>
  );
};

export default JitsiMeetMain;
