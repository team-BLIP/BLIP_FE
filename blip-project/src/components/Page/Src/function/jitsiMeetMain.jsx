// JitsiMeetMain.jsx - 컨테이너 컴포넌트
import React, { useState, useEffect, useContext } from "react";
import { TeamDel } from "../../Main/Main";
import { UseStateContext, DiscordContext, Call } from "../../../../Router";
import JitsiMeetAPI from "../api/JitsiMettApi";
import ParticipantsGrid from "./ParticipantsGrid";
import ControlBar from "./ControlBar";

const JitsiMeetMain = ({ setIsMettingStop }) => {
  const { itemId, isTopic } = useContext(TeamDel);
  const { isMike, setIsMike, isCamera, setIsCamera } =
    useContext(UseStateContext);
  const { videoRef, stream, setStream, isListening, setIsListening } =
    useContext(DiscordContext);
  const { recorder, setRecorder, setRecordedChunks } = useContext(Call);

  // 상태 관리
  const [apiInitialized, setApiInitialized] = useState(false);
  const [participants, setParticipants] = useState([
    {
      id: "local",
      name: "나",
      isLocal: true,
      isAudioMuted: !isMike,
      isVideoMuted: !isCamera,
    },
  ]);
  const [localParticipantId, setLocalParticipantId] = useState(null);
  const [localStream, setLocalStream] = useState(null);

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
    </div>
  );
};

export default JitsiMeetMain;
