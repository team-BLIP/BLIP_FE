import React, { useState, useEffect, useContext, useCallback } from "react";
import "../../../CSS/Grid.css";
import { TeamDel, FindId } from "../../Main/Main";
import { UseStateContext, DiscordContext, Call } from "../../../../Router";
import JitsiMeetAPI from "../api/JitsiMettApi";
import ParticipantsGrid from "./ParticipantsGrid";
import ControlBar from "./ControlBar";

const JitsiMeetMain = ({ setIsMettingStop }) => {
  const { isTopic, inputName, meetingId, setMeetingId } = useContext(TeamDel);
  const {
    isMike,
    setIsMike,
    isCamera,
    setIsCamera,
    meetingEnd,
    setMeetingEnd,
  } = useContext(UseStateContext);
  const { videoRef, setStream } = useContext(DiscordContext);
  const { recorder, setRecorder, setRecordedChunks } = useContext(Call);
  const { createTeamId, itemBackendId } = useContext(FindId);

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
  const [localStream, setLocalStream] = useState(null);

  const meetingConfig = {
    meetingId,
    setMeetingId,
    meetingEnd,
    setMeetingEnd,
    createTeamId,
    itemBackendId,
  };

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

  // 컴포넌트 마운트 시 기본 상태 설정
  useEffect(() => {
    // 기본적으로 마이크와 카메라 비활성화
    setIsMike(false);
    setIsCamera(false);

    // 브라우저에서 미디어 장치 권한 요청 시 기본적으로 꺼진 상태로 시작
    const initializeMedia = async () => {
      try {
        // 권한만 요청하고 바로 트랙을 비활성화
        const stream = await navigator.mediaDevices.getUserMedia({
          audio: true,
          video: true,
        });

        // 모든 트랙 비활성화
        stream.getTracks().forEach((track) => {
          track.enabled = false;
        });

        // 로컬 스트림 저장
        setLocalStream(stream);

        // 비디오 요소에 스트림 설정
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
        }

        // 다른 컴포넌트에서 사용할 수 있도록 설정
        setStream(stream);

        console.log("미디어 장치 초기화 완료 - 기본 상태: 비활성화");
      } catch (error) {
        console.error("미디어 장치 접근 실패:", error);
      }
    };

    initializeMedia();
  }, []);

  // 컴포넌트 언마운트 시 미디어 장치 정리
  useEffect(() => {
    return () => {
      // 마이크 및 카메라 스트림 정리
      if (localStream) {
        localStream.getTracks().forEach((track) => {
          track.stop();
        });
      }

      // 녹음기 정리
      if (recorder && recorder.state !== "inactive") {
        recorder.stop();
      }

      console.log("컴포넌트 언마운트: 모든 미디어 장치 정리 완료");
    };
  }, [localStream, recorder]);

  // 마이크 상태 변경 감지
  useEffect(() => {
    if (localStream) {
      const audioTracks = localStream.getAudioTracks();
      audioTracks.forEach((track) => {
        track.enabled = isMike;
      });
      console.log(`마이크 상태 변경: ${isMike ? "활성화" : "비활성화"}`);
    }
  }, [isMike, localStream]);

  // 카메라 상태 변경 감지
  useEffect(() => {
    if (localStream) {
      const videoTracks = localStream.getVideoTracks();
      videoTracks.forEach((track) => {
        track.enabled = isCamera;
      });
      console.log(`카메라 상태 변경: ${isCamera ? "활성화" : "비활성화"}`);
    }
  }, [isCamera, localStream]);

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
            videoRef.current.srcObject = newStream;
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

  // 회의 종료 시 호출될 함수
  const handleMeetingEnd = useCallback(() => {
    console.log("회의 종료: 미디어 장치 종료 중...");

    // 카메라가 켜져있으면 끄기
    if (isCamera) {
      // 카메라 끄기 로직
      if (localStream) {
        const videoTracks = localStream.getVideoTracks();
        videoTracks.forEach((track) => {
          track.enabled = false;
          track.stop(); // 트랙 완전히 종료
        });
      }
      setIsCamera(false);
    }

    // 마이크가 켜져있으면 끄기
    if (isMike) {
      // 마이크 끄기 로직
      if (localStream) {
        const audioTracks = localStream.getAudioTracks();
        audioTracks.forEach((track) => {
          track.enabled = false;
          track.stop(); // 트랙 완전히 종료
        });
      }
      setIsMike(false);
    }

    // 녹음 중이면 중지
    if (isRecording) {
      handleToggleRecording();
    }

    // 모든 미디어 스트림 해제
    if (localStream) {
      localStream.getTracks().forEach((track) => track.stop());
      setLocalStream(null);
    }

    // 비디오 요소 초기화
    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }

    console.log("미디어 장치 종료 완료");

    // 회의 종료 상태 업데이트
    setMeetingEnd(true);

    // 상위 컴포넌트에 회의 종료 알림
    if (setIsMettingStop) {
      setIsMettingStop(true);
    }
  }, [
    isCamera,
    isMike,
    isRecording,
    localStream,
    videoRef,
    setMeetingEnd,
    setIsMettingStop,
    handleToggleRecording,
  ]);

  // 회의 종료 상태 감시
  useEffect(() => {
    if (meetingEnd) {
      handleMeetingEnd();
    }
  }, [meetingEnd, handleMeetingEnd]);

  return (
    <div className="FullGrid-grid">
      <JitsiMeetAPI meetingConfig={meetingConfig} />
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
