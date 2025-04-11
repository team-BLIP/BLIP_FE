import React, { useState, useEffect, useContext } from "react";
import "../../../CSS/Grid.css";
import { TeamDel, FindId } from "../../Main/Main";
import { UseStateContext, DiscordContext, Call } from "../../../../Router";
import JitsiMeetAPI from "../api/JitsiMettApi";
import ParticipantsGrid from "./ParticipantsGrid";
import ControlBar from "./ControlBar";

const JitsiMeetMain = ({ setIsMettingStop }) => {
  const { itemId, isTopic, inputName } = useContext(TeamDel);
  const { isMike, setIsMike, isCamera, setIsCamera, meetingEnd } =
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
      name: inputName, // inputName이 없을 경우 기본값 설정
      isLocal: true,
      isAudioMuted: !isMike,
      isVideoMuted: !isCamera,
    },
  ]);
  const [localParticipantId, setLocalParticipantId] = useState(null);
  const [localStream, setLocalStream] = useState(null);
  const [teamId, setTeamId] = useState(null);

  // 사용자 이름 업데이트 감지
  useEffect(() => {
    if (inputName) {
      setParticipants((prevParticipants) =>
        prevParticipants.map((participant) =>
          participant.isLocal
            ? { ...participant, name: inputName }
            : participant
        )
      );
    }
  }, [inputName]);

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
      userName: inputName,
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

  // 카메라 토글 핸들러
  const handleCameraToggle = () => {
    console.log("카메라 토글 요청", { 현재상태: isCamera, 변경후: !isCamera });

    // 로컬 비디오 트랙 확인 및 활성화/비활성화
    if (localStream) {
      const videoTracks = localStream.getVideoTracks();
      console.log(
        "비디오 트랙 상태 변경 전:",
        videoTracks.map((t) => `${t.label}: ${t.enabled}`)
      );

      // isCamera가 false면 true로 변경될 예정이므로 트랙을 활성화
      const nextState = !isCamera;
      videoTracks.forEach((track) => {
        track.enabled = nextState;
        console.log(
          `비디오 트랙 ${track.label} ${nextState ? "활성화" : "비활성화"}`
        );
      });

      // 스트림이 있는데 트랙이 없거나 모두 종료된 경우 새 스트림 요청
      if (nextState && (videoTracks.length === 0 || !videoTracks[0].enabled)) {
        console.log("비디오 트랙 재설정 시도...");
        navigator.mediaDevices
          .getUserMedia({ video: true, audio: isMike })
          .then((newStream) => {
            if (videoRef.current) {
              // 기존 스트림 정리
              if (videoRef.current.srcObject) {
                videoRef.current.srcObject.getTracks().forEach((track) => {
                  if (track.kind === "video") track.stop();
                });
              }

              // 오디오 트랙은 유지하고 비디오 트랙만 교체
              const audioTracks = localStream.getAudioTracks();
              const newVideoTracks = newStream.getVideoTracks();

              // 새 스트림 생성
              const combinedStream = new MediaStream();
              audioTracks.forEach((track) => combinedStream.addTrack(track));
              newVideoTracks.forEach((track) => {
                track.enabled = true;
                combinedStream.addTrack(track);
              });

              // 새 스트림 설정
              videoRef.current.srcObject = combinedStream;
              setLocalStream(combinedStream);
              setStream(combinedStream);

              console.log(
                "비디오 스트림 재설정 성공",
                combinedStream
                  .getTracks()
                  .map((t) => `${t.kind}:${t.label}:${t.enabled}`)
              );
            }
          })
          .catch((error) => {
            console.error("비디오 스트림 재설정 실패:", error);
          });
      }
    } else {
      console.warn(
        "로컬 스트림이 없습니다. 카메라 활성화를 위해 스트림을 초기화합니다."
      );

      // 스트림이 없는 경우 새로 설정
      navigator.mediaDevices
        .getUserMedia({ video: true, audio: isMike })
        .then((newStream) => {
          if (videoRef.current) {
            videoRef.current.srcObject = newStream;36
            setLocalStream(newStream);
            setStream(newStream);
            console.log("새 비디오 스트림 설정 성공");
          }
        })
        .catch((error) => {
          console.error("비디오 스트림 설정 실패:", error);
        });
    }

    // 상태 업데이트
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
        setTeamId={setTeamId}
        meetingEnd={meetingEnd}
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
