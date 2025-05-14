import "../../../CSS/Discord.css";
import { typography } from "../../../../fonts/fonts";
import { color } from "../../../../style/color";
import DisAlarm from "../../../../svg/DisAlarm.svg";
import AlarmLight from "../../../../svg/alarmlight.svg";
import NoMike from "../../../../svg/NoMike.svg";
import NoCamera from "../../../../svg/NoCamera.svg";
import Mike from "../../../../svg/Mike.svg";
import Camera from "../../../../svg/DisCamera.svg";
import Fullscreen from "../../../../svg/FullScreen.svg";
import X from "../../../../svg/X.svg";
import MettingStop from "../../../../svg/MettingStop.svg";
import MettingStart from "../../../../svg/MettingStart.svg";
import ModalStop from "../../Modal/ModalStop";
import ModalStart from "../../Modal/ModalStart";
import JitsiMeetMain from "../function/jitsiMeetMain";
import {
  useContext,
  useEffect,
  useState,
  useRef,
  useCallback,
  useMemo,
} from "react";
import { TeamDel } from "../../Main/Main";
import { FindId } from "../../Main/Main";
import { RecordingService } from "../../../../services/RecordingService";
import { useFrameAnalyzer } from "../function/frameAnalyzer";
import { useAppState, useCall } from "../../../../contexts/AppContext";
import {
  uploadRecordingFile,
  isValidRecordingFile,
} from "../../../../services/RecordingUtils";

// 개발 모드인지 확인하는 상수
const isDevelopment = process.env.NODE_ENV === "development";

// 환경 변수
const accessToken =
  localStorage.getItem("accessToken") || import.meta.env.VITE_API_URL_URL_KEY;

const Discord = () => {
  // 컨텍스트에서 필요한 값들 추출 (useContext는 렌더링마다 호출됨)
  const { itemId } = useContext(TeamDel) || { itemId: null };
  const { targetId, createTeamId, itemBackendId, TeamJoinId } = useContext(
    FindId
  ) || {
    targetId: null,
    createTeamId: null,
    itemBackendId: null,
  };

  // AppState 컨텍스트에서 값 추출
  const {
    isMike,
    setIsMike,
    isCamera,
    setIsCamera,
    setFullScreen,
    setDiscord,
    meetingEnd,
    setMeetingEnd,
  } = useAppState();

  // 로컬 상태 관리
  const [isMettingStop, setIsMettingStop] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isModalStart, setIsModalStart] = useState(false);
  const [currentUserName, setCurrentUserName] = useState("사용자");
  const [randomBgColor, setRandomBgColor] = useState("#8C6EFF");
  const [randomCircleColor, setRandomCircleColor] = useState("#EF5DA8");
  const [localStream, setLocalStream] = useState(null);
  const isProcessingMikeChange = useRef(false);

  // 새 팀인지 확인
  const isNewTeam = () => {
    return (
      (typeof createTeamId === "string" && createTeamId.includes("create-")) ||
      (typeof TeamJoinId === "string" && TeamJoinId.includes("Join-"))
    );
  };

  // 디버깅을 위한 추가 상태
  const [debugInfo, setDebugInfo] = useState({
    lastAnalysisResult: null,
    analyzerError: null,
    isAnalyzing: false,
  });
  const [showDebug, setShowDebug] = useState(isDevelopment); // 개발 모드에서만 기본 활성화

  // Refs
  const recordingServiceRef = useRef(null);
  const localVideoRef = useRef(null);
  const manualAlarmTimeoutRef = useRef(null); // 수동 알람 테스트용 타임아웃
  const [isRecordingPaused, setIsRecordingPaused] = useState(false);
  const recordingListenerRef = useRef(null);

  // 녹음 관련 컨텍스트
  const callContext = useCall();
  const setRecordedChunks = callContext?.setRecordedChunks;

  // 팀 ID 가져오는 유틸 함수
  // getValidTeamId 함수 내부에 추가
  const getValidTeamId = useCallback(() => {
    const id = itemBackendId || createTeamId || itemId || 1;
    let finalId;

    if (typeof id === "string" && id.includes("create-")) {
      const match = id.match(/create-(\d+)/);
      finalId = match && match[1] ? match[1] : id;
    } else {
      finalId = id;
    }

    // 활성 팀 ID 저장 (추가된 부분)
    localStorage.setItem("activeTeamId", finalId);

    return finalId;
  }, [itemBackendId, createTeamId, itemId]);

  // 마이크 상태 모니터링
  useEffect(() => {
    if (!localStream) return;

    const audioTracks = localStream.getAudioTracks();
    if (audioTracks.length === 0 && isMike) {
      console.warn(
        "오디오 트랙이 없는데 마이크 상태가 켜져있습니다. 상태를 수정합니다."
      );
      setIsMike(false);
    }

    const checkMikeStatus = () => {
      const activeTracks = localStream
        .getAudioTracks()
        .filter((track) => track.readyState === "live");
      if (activeTracks.length === 0 && isMike) {
        console.warn("활성 오디오 트랙이 없습니다. 마이크 상태를 수정합니다.");
        setIsMike(false);
      }
    };

    const intervalId = setInterval(checkMikeStatus, 2000);

    return () => {
      clearInterval(intervalId);
    };
  }, [localStream, isMike]);

  // saveToLocalStorage 함수 정의
  const saveToLocalStorage = useCallback((teamId, blob) => {
    try {
      if (!blob || blob.size === 0) {
        console.error("저장할 녹음 데이터가 없습니다.");
        return;
      }

      const timestamp = Date.now();
      const key = `recording_${teamId}_${timestamp}`;

      // 정보 객체 생성
      const info = {
        size: blob.size,
        type: blob.type,
        timestamp: timestamp,
        teamId: teamId,
        date: new Date().toISOString(),
      };

      // 로컬 스토리지에 정보 저장 (Blob은 저장 불가, 정보만 저장)
      localStorage.setItem(`${key}_info`, JSON.stringify(info));

      // Blob 객체를 window 객체에 저장 (다른 컴포넌트에서 접근할 수 있도록)
      if (!window.recordedBlobs) {
        window.recordedBlobs = {};
      }
      window.recordedBlobs[key] = blob;

      // 최신 녹음 데이터 저장
      if (!window.latestRecordings) {
        window.latestRecordings = {};
      }
      window.latestRecordings[teamId] = {
        blob: blob,
        timestamp: timestamp,
        type: blob.type,
        key: key,
      };

      // Blob URL 생성 및 세션 스토리지에 저장
      const blobUrl = URL.createObjectURL(blob);
      sessionStorage.setItem(`${key}_url`, blobUrl);

      // 최신 녹음 정보 저장
      localStorage.setItem(`latestRecording_${teamId}`, key);

      // 이벤트 발생
      window.dispatchEvent(
        new CustomEvent("recordingComplete", {
          detail: {
            teamId,
            size: blob.size,
            timestamp,
            key,
            blob, // Blob 객체 직접 전달
          },
        })
      );

      console.log(`녹음 데이터 정보가 로컬 스토리지에 저장됨 (키: ${key})`);
    } catch (error) {
      console.error("로컬 스토리지 저장 실패:", error);
    }
  }, []);

  // 회의 종료 처리 함수를 먼저 정의
  // handleMeetingEnd 함수 (Discord 컴포넌트 내에서)
  const handleMeetingEnd = useCallback(async () => {
    try {
      const teamId = getValidTeamId();
      console.log("회의 종료 처리 시작");

      let recordingBlob = null;

      // 녹음 중지 및 데이터 획득
      if (recordingServiceRef.current && (isRecording || isRecordingPaused)) {
        try {
          recordingBlob = await recordingServiceRef.current.stopRecording(
            teamId
          );
          console.log(`녹음 중지 완료: ${recordingBlob?.size || 0} 바이트`);
        } catch (error) {
          console.error("녹음 중지 오류:", error);
        }
      }

      // 녹음 데이터가 없으면 찾기 시도
      if (!recordingBlob || recordingBlob.size === 0) {
        console.log("유효한 녹음 파일 찾기 시도");

        // RecordingService에서 찾기
        if (recordingServiceRef.current) {
          recordingBlob =
            recordingServiceRef.current.getLatestRecording(teamId);
          console.log(`기존 녹음 찾음: ${recordingBlob?.size || 0} 바이트`);
        }

        // window.latestRecordings에서 찾기
        if (!recordingBlob || recordingBlob.size === 0) {
          if (window.latestRecordings?.[teamId]?.blob) {
            recordingBlob = window.latestRecordings[teamId].blob;
            console.log(
              `window.latestRecordings에서 녹음 찾음: ${
                recordingBlob?.size || 0
              } 바이트`
            );
          }
        }

        // 여전히 녹음 데이터가 없으면 오류
        if (!recordingBlob || recordingBlob.size === 0) {
          console.error("녹음 파일을 찾을 수 없어 회의를 종료할 수 없습니다.");
          alert(
            "녹음 파일이 없어 회의를 종료할 수 없습니다. 마이크를 켜고 녹음을 시작해주세요."
          );
          return;
        }
      }

      console.log(`사용할 녹음 파일: ${recordingBlob.size} 바이트`);

      // 서버에 업로드 시도
      try {
        const uploadResult = await uploadRecordingFile(recordingBlob, teamId);

        if (uploadResult.success) {
          console.log("녹음 파일 업로드 성공:", uploadResult);

          // 성공 시 상태 정리
          if (localStream) {
            localStream.getTracks().forEach((track) => {
              console.log(`미디어 트랙 중지: ${track.kind}`);
              track.stop();
            });
          }

          // 상태 초기화
          setLocalStream(null);
          setIsCamera(false);
          setIsMike(false);
          setIsRecording(false);
          setIsRecordingPaused(false);
          setMeetingEnd(true);
          setDiscord(false);

          console.log("회의 종료 처리 완료");
        } else {
          console.error("녹음 파일 업로드 실패:", uploadResult.error);
          alert("녹음 파일 업로드에 실패했습니다. 다시 시도해주세요.");
          return;
        }
      } catch (uploadError) {
        console.error("녹음 파일 업로드 중 오류:", uploadError);
        alert("녹음 파일 업로드에 실패했습니다. 다시 시도해주세요.");
        return;
      }
    } catch (error) {
      console.error("회의 종료 처리 오류:", error);
      alert("회의 종료 중 오류가 발생했습니다. 다시 시도해주세요.");
    }
  }, [
    getValidTeamId,
    isRecording,
    isRecordingPaused,
    localStream,
    setIsCamera,
    setIsMike,
    setMeetingEnd,
    setDiscord,
  ]);

  // 모달에서 종료 버튼 클릭 시 처리
  // onModalStopConfirm 함수 (Discord 컴포넌트 내에서)
  // onModalStopConfirm 함수 (Discord 컴포넌트 내에서)
  const onModalStopConfirm = useCallback(async () => {
    try {
      // 녹음 파일 유무 확인
      const teamId = getValidTeamId();
      let hasRecording = false;
      let recordingBlob = null;

      // 현재 녹음 중인 경우
      if (recordingServiceRef.current) {
        if (isRecording || isRecordingPaused) {
          hasRecording = true;
        } else {
          // 기존 녹음 확인
          recordingBlob =
            recordingServiceRef.current.getLatestRecording(teamId);
          hasRecording = recordingBlob && recordingBlob.size > 0;

          if (!hasRecording) {
            hasRecording =
              recordingServiceRef.current.hasRecordingHistory(teamId);
          }
        }
      }

      // window.latestRecordings에서 확인
      if (!hasRecording && window.latestRecordings?.[teamId]?.blob) {
        recordingBlob = window.latestRecordings[teamId].blob;
        hasRecording = recordingBlob && recordingBlob.size > 0;
      }

      // 로컬 스토리지에서 확인
      if (!hasRecording) {
        const infoKeys = Object.keys(localStorage).filter(
          (key) =>
            key.startsWith(`recording_${teamId}_`) && key.endsWith("_info")
        );
        hasRecording = infoKeys.length > 0;
      }

      if (!hasRecording) {
        alert(
          "녹음 파일이 없어 회의를 종료할 수 없습니다. 마이크를 켜고 녹음을 시작해주세요."
        );
        setIsModalOpen(false);
        return;
      }

      // 정상 종료 처리
      await handleMeetingEnd();
      setIsModalOpen(false);
    } catch (error) {
      console.error("모달 종료 처리 오류:", error);
      alert("회의 종료 중 오류가 발생했습니다. 다시 시도해주세요.");
      setIsModalOpen(false);
    }
  }, [handleMeetingEnd, getValidTeamId, isRecording, isRecordingPaused]);

  // X 버튼 클릭 핸들러
  const onClickEnd = useCallback(() => {
    if (meetingEnd) {
      setMeetingEnd(false);
      setDiscord(false);
    } else {
      handleMeetingEnd();
    }
  }, [meetingEnd, handleMeetingEnd, setMeetingEnd, setDiscord]);

  // 프레임 분석 상태 관리 최적화 - 객체 참조 안정화
  const analysisState = useMemo(
    () => ({
      isActive: isCamera && !meetingEnd && !isMettingStop,
      teamId: getValidTeamId(),
      accessToken,
    }),
    [isCamera, meetingEnd, isMettingStop, getValidTeamId, accessToken]
  );

  // 프레임 분석기 훅 사용
  const {
    isAlarmActive,
    lastAnalysisTime,
    isAnalyzing,
    analyzerError,
    isConnected,
    resetAlarm,
    analyzeCurrentFrame,
  } = useFrameAnalyzer({
    videoRef: localVideoRef,
    ...analysisState,
    analysisInterval: 5000,
  });

  // 디버깅: 분석 상태 변경 로깅
  useEffect(() => {
    if (isDevelopment) {
      console.log("==== 분석 상태 변경 ====");
      console.log("isActive:", analysisState.isActive);
      console.log("isCamera:", isCamera);
      console.log("meetingEnd:", meetingEnd);
      console.log("isMettingStop:", isMettingStop);
      console.log("teamId:", getValidTeamId());
    }
  }, [
    analysisState.isActive,
    isCamera,
    meetingEnd,
    isMettingStop,
    getValidTeamId,
  ]);

  // 디버깅: 알람 상태 변경 로깅
  useEffect(() => {
    if (isDevelopment) {
      console.log("알람 상태 변경:", isAlarmActive ? "활성화" : "비활성화");
    }
  }, [isAlarmActive]);

  // 디버깅: 분석 상태 업데이트
  useEffect(() => {
    setDebugInfo((prev) => ({
      ...prev,
      isAnalyzing,
      analyzerError,
    }));
  }, [isAnalyzing, analyzerError]);

  // 녹음 데이터 저장 함수 - 컨텍스트가 없을 때도 동작하도록 수정
  const saveRecordingData = useCallback(
    async (teamId) => {
      if (!recordingServiceRef.current) return false;

      try {
        if (!isRecording && !isRecordingPaused) {
          console.log("녹음 중이 아닙니다.");
          return false;
        }

        const recordingBlob = await recordingServiceRef.current.stopRecording(
          teamId
        );

        if (!recordingBlob || recordingBlob.size <= 0) {
          console.warn("녹음 데이터가 없거나 비어있습니다.");
          return false;
        }

        console.log(`녹음 완료: ${recordingBlob.size} 바이트`);

        // window 객체에 녹음 데이터 저장 (다른 컴포넌트에서 접근할 수 있도록)
        if (!window.latestRecordings) {
          window.latestRecordings = {};
        }
        window.latestRecordings[teamId] = {
          blob: recordingBlob,
          timestamp: Date.now(),
          type: recordingBlob.type,
        };

        // 녹음 데이터를 로컬 스토리지에도 저장
        saveToLocalStorage(teamId, recordingBlob);

        // 컨텍스트가 있는 경우에만 setRecordedChunks 호출
        if (typeof setRecordedChunks === "function") {
          try {
            setRecordedChunks((prev) => [...(prev || []), recordingBlob]);
            console.log("녹음 데이터 저장 성공");
          } catch (error) {
            console.error("녹음 데이터 저장 실패:", error);
          }
        }

        setIsRecording(false);
        setIsRecordingPaused(false);
        return true;
      } catch (error) {
        console.error("녹음 저장 실패:", error);
        return false;
      }
    },
    [isRecording, isRecordingPaused, setRecordedChunks, saveToLocalStorage]
  );

  const onClickMike = useCallback(async () => {
    const nextState = !isMike;
    const teamId = getValidTeamId();
    const service = recordingServiceRef.current;

    try {
      // 이미 상태 변경 중인지 확인
      if (isProcessingMikeChange.current) {
        console.log("마이크 상태 변경 중입니다. 잠시 후 다시 시도해주세요.");
        return;
      }

      isProcessingMikeChange.current = true;

      if (nextState) {
        // 마이크를 켤 때
        let audioStream;
        try {
          audioStream = await navigator.mediaDevices.getUserMedia({
            audio: {
              echoCancellation: true, // 에코 캔슬링 활성화
              noiseSuppression: true, // 노이즈 억제 활성화
              autoGainControl: true, // 자동 게인 컨트롤 활성화
            },
          });
        } catch (permissionError) {
          console.error("마이크 권한 획득 실패:", permissionError);
          alert("마이크 접근에 실패했습니다. 마이크 권한을 확인해주세요.");
          isProcessingMikeChange.current = false;
          return;
        }

        // 새 스트림 생성
        const newStream = new MediaStream();

        // 기존 비디오 트랙 유지 (있는 경우)
        if (localStream && localStream.getVideoTracks().length > 0) {
          const videoTrack = localStream.getVideoTracks()[0];
          if (videoTrack.readyState === "live") {
            newStream.addTrack(videoTrack);
          }
        }

        // 새 오디오 트랙 추가
        const audioTrack = audioStream.getAudioTracks()[0];
        if (!audioTrack) {
          console.error("오디오 트랙을 획득할 수 없습니다.");
          isProcessingMikeChange.current = false;
          return;
        }

        // 오디오 트랙에 종료 이벤트 리스너 추가
        audioTrack.addEventListener("ended", () => {
          console.log(
            "오디오 트랙이 종료되었습니다. 마이크 상태를 재설정합니다."
          );
          // 마이크 상태를 즉시 업데이트
          setIsMike(false);
        });

        newStream.addTrack(audioTrack);

        // 스트림 설정
        setLocalStream(newStream);

        // 비디오 요소 업데이트 (비디오 트랙이 있는 경우에만)
        if (localVideoRef.current && newStream.getVideoTracks().length > 0) {
          localVideoRef.current.srcObject = newStream;
        }

        // 녹음 설정 및 시작
        if (service) {
          try {
            if (isRecording && isRecordingPaused) {
              // 일시정지 상태에서 재개
              const setupSuccess = await service.setupRecording(
                teamId,
                newStream
              );
              if (setupSuccess) {
                // 기존 녹음 데이터 유지 확인
                const hasExistingRecording =
                  service.hasRecordingHistory(teamId);
                if (!hasExistingRecording) {
                  console.log(
                    "일시정지 상태이지만 기존 녹음 데이터가 없음. 새 녹음 시작"
                  );
                }

                const startSuccess = await service.startRecording(teamId);
                if (startSuccess) {
                  setIsRecordingPaused(false);
                  console.log("녹음이 일시정지 상태에서 재개되었습니다.");
                }
              }
            } else if (!isRecording) {
              // 새 녹음 시작
              const setupSuccess = await service.setupRecording(
                teamId,
                newStream
              );
              if (setupSuccess) {
                const startSuccess = await service.startRecording(teamId);
                if (startSuccess) {
                  setIsRecording(true);
                  setIsRecordingPaused(false);
                  console.log("새 녹음이 시작되었습니다.");
                }
              }
            } else {
              // 기존 녹음 중 오디오 소스 업데이트
              const updateSuccess = await service.updateAudioSource(
                teamId,
                newStream
              );
              if (updateSuccess) {
                console.log("기존 녹음의 오디오 소스가 업데이트되었습니다.");
              }
            }
          } catch (recordingError) {
            console.error("녹음 설정/시작 중 오류:", recordingError);
          }
        }

        // 상태 업데이트
        setIsMike(true);
      } else {
        // 마이크를 끌 때
        if (localStream) {
          // 녹음 일시정지
          if (service && isRecording && !isRecordingPaused) {
            try {
              const pauseSuccess = await service.pauseRecording(teamId);
              if (pauseSuccess) {
                setIsRecordingPaused(true);
                console.log("녹음이 일시정지되었습니다.");
              }
            } catch (pauseError) {
              console.error("녹음 일시정지 오류:", pauseError);
            }
          }

          // 오디오 트랙만 중지하고 제거
          const audioTracks = localStream.getAudioTracks();
          if (audioTracks.length > 0) {
            audioTracks.forEach((track) => {
              try {
                track.stop();
                localStream.removeTrack(track);
              } catch (trackError) {
                console.warn(
                  `오디오 트랙 중지 오류 (무시됨): ${trackError.message}`
                );
              }
            });
          }

          // 새 스트림 생성 (비디오만 유지)
          const newStream = new MediaStream();
          const videoTracks = localStream.getVideoTracks();
          if (videoTracks.length > 0) {
            videoTracks.forEach((track) => {
              if (track.readyState === "live") {
                newStream.addTrack(track);
              }
            });
          }

          setLocalStream(newStream);

          // 비디오 요소 업데이트 (비디오 트랙이 있는 경우에만)
          if (localVideoRef.current && newStream.getVideoTracks().length > 0) {
            localVideoRef.current.srcObject = newStream;
          } else if (localVideoRef.current) {
            localVideoRef.current.srcObject = null;
          }
        }

        // 상태 업데이트
        setIsMike(false);
      }
    } catch (error) {
      console.error("마이크 상태 변경 실패:", error);
      alert("마이크 접근 중 오류가 발생했습니다.");

      // 오류 발생 시 마이크 상태를 false로 설정
      setIsMike(false);
    } finally {
      isProcessingMikeChange.current = false;
    }
  }, [isMike, localStream, isRecording, isRecordingPaused, getValidTeamId]);

  // 카메라 제어 함수
  const onClickCamera = useCallback(async () => {
    const nextState = !isCamera;

    try {
      if (nextState) {
        // 카메라를 켤 때
        let videoStream;
        try {
          videoStream = await navigator.mediaDevices.getUserMedia({
            video: true,
          });
        } catch (permissionError) {
          console.error("카메라 권한 획득 실패:", permissionError);
          alert("카메라 접근에 실패했습니다. 카메라 권한을 확인해주세요.");
          return;
        }

        // 새 스트림 생성
        const newStream = new MediaStream();

        // 기존 오디오 트랙 유지 (있는 경우)
        if (localStream && localStream.getAudioTracks().length > 0) {
          const audioTrack = localStream.getAudioTracks()[0];
          if (audioTrack.readyState === "live") {
            newStream.addTrack(audioTrack);
          }
        }

        // 새 비디오 트랙 추가
        const videoTrack = videoStream.getVideoTracks()[0];
        if (!videoTrack) {
          console.error("비디오 트랙을 획득할 수 없습니다.");
          return;
        }

        // 비디오 트랙 종료 이벤트 리스너 추가
        videoTrack.addEventListener("ended", () => {
          console.log(
            "비디오 트랙이 종료되었습니다. 카메라 상태를 재설정합니다."
          );
          setIsCamera(false);
        });

        newStream.addTrack(videoTrack);

        // 스트림 설정
        setLocalStream(newStream);

        // 비디오 요소 업데이트
        if (localVideoRef.current) {
          localVideoRef.current.srcObject = newStream;
        }

        // 상태 업데이트
        setIsCamera(true);
      } else {
        // 카메라를 끌 때
        if (localStream) {
          // 비디오 트랙만 중지하고 제거
          const videoTracks = localStream.getVideoTracks();
          if (videoTracks.length > 0) {
            videoTracks.forEach((track) => {
              try {
                track.stop();
                localStream.removeTrack(track);
              } catch (trackError) {
                console.warn(
                  `비디오 트랙 중지 오류 (무시됨): ${trackError.message}`
                );
              }
            });
          }

          // 새 스트림 생성 (오디오만 유지)
          const newStream = new MediaStream();
          const audioTracks = localStream.getAudioTracks();
          if (audioTracks.length > 0) {
            audioTracks.forEach((track) => {
              if (track.readyState === "live") {
                newStream.addTrack(track);
              }
            });
          }

          setLocalStream(newStream);

          // 비디오 요소 업데이트 (비디오가 없으므로 null로 설정)
          if (localVideoRef.current) {
            localVideoRef.current.srcObject = null;
          }
        }

        // 상태 업데이트
        setIsCamera(false);
      }
    } catch (error) {
      console.error("카메라 상태 변경 실패:", error);
      alert("카메라 접근 중 오류가 발생했습니다.");

      // 오류 발생 시 카메라 상태를 false로 설정
      setIsCamera(false);
    }
  }, [isCamera, localStream]);

  // 스트림 변경 감지 및 비디오 요소 업데이트
  useEffect(() => {
    if (
      localStream &&
      localVideoRef.current &&
      localStream.getVideoTracks().length > 0
    ) {
      localVideoRef.current.srcObject = localStream;
    }
  }, [localStream]);

  // 녹음 서비스 초기화 - 의존성 배열 수정
  useEffect(() => {
    const teamId = getValidTeamId();

    // 이미 초기화되었는지 확인
    if (recordingServiceRef.current) return;

    console.log("녹음 서비스 초기화 시작");
    recordingServiceRef.current = new RecordingService();

    // 리스너 함수 정의 및 저장 (언마운트 시 제거를 위해)
    const recordingListener = (recordingBlob) => {
      // 전달된 데이터 유효성 확인
      if (!recordingBlob || recordingBlob.size === 0) {
        console.error("리스너에 전달된 녹음 데이터가 없거나 크기가 0입니다");
        return;
      }

      console.log(
        `녹음 완료 리스너 호출됨: ${recordingBlob.size} 바이트, 타입: ${recordingBlob.type}`
      );

      // setRecordedChunks가 있으면 사용
      if (typeof setRecordedChunks === "function") {
        try {
          console.log("setRecordedChunks 함수로 녹음 데이터 전달 시도");

          // 중요: 새 배열을 생성하여 전달 (이전 배열 참조 방지)
          setRecordedChunks((prev) => {
            // prev가 null, undefined인 경우 빈 배열 사용
            const prevChunks = prev || [];
            console.log(`이전 청크 개수: ${prevChunks.length}`);

            // 새 배열 생성하여 반환
            const newChunks = [...prevChunks, recordingBlob];
            console.log(`새 청크 개수: ${newChunks.length}`);
            return newChunks;
          });

          console.log("setRecordedChunks 함수 호출 완료");
        } catch (error) {
          console.error("setRecordedChunks 함수 호출 오류:", error);

          // 오류 발생 시 로컬 스토리지에 백업
          saveToLocalStorage(teamId, recordingBlob);
        }
      } else {
        console.warn(
          "setRecordedChunks is not available, 로컬 스토리지에 저장"
        );
        saveToLocalStorage(teamId, recordingBlob);
      }
    };

    // 리스너 등록
    recordingServiceRef.current.addListener(teamId, recordingListener);
    recordingListenerRef.current = recordingListener; // 참조 저장

    // 컴포넌트 언마운트 시 정리
    return () => {
      const service = recordingServiceRef.current;
      if (!service) return;

      // 강제로 정리 실행 플래그
      let isCleanupExecuted = false;

      const cleanupRecording = async () => {
        if (isCleanupExecuted) return;
        isCleanupExecuted = true;

        try {
          console.log("컴포넌트 언마운트 - 녹음 서비스 정리");

          // 리스너 제거
          if (recordingListenerRef.current) {
            service.removeListener(teamId, recordingListenerRef.current);
          }

          // 녹음 중인 경우 중지
          if (isRecording || isRecordingPaused) {
            console.log("언마운트 시 녹음 중지 시도");

            const recordingBlob = await service.stopRecording(teamId);
            console.log(
              `언마운트 시 녹음 정지: ${recordingBlob?.size || 0} 바이트`
            );

            // 녹음 데이터가 있고 setRecordedChunks 함수가 있으면 처리
            if (
              recordingBlob &&
              recordingBlob.size > 0 &&
              typeof setRecordedChunks === "function"
            ) {
              try {
                setRecordedChunks((prev) => [...(prev || []), recordingBlob]);
                console.log("언마운트 시 녹음 데이터 전달 성공");
              } catch (error) {
                console.error("언마운트 시 녹음 데이터 전달 실패:", error);
                // 로컬 스토리지에 백업
                saveToLocalStorage(teamId, recordingBlob);
              }
            } else if (recordingBlob && recordingBlob.size > 0) {
              // setRecordedChunks가 없으면 로컬 스토리지에 저장
              saveToLocalStorage(teamId, recordingBlob);
            }
          }

          // 최종 리소스 정리
          service.dispose(teamId);
          console.log("녹음 서비스 정리 완료");
        } catch (error) {
          console.error("녹음 정리 오류:", error);
        }
      };

      // 비동기 정리 함수 실행
      cleanupRecording();
    };
  }, [getValidTeamId, setRecordedChunks]); // 의존성 최적화

  // 사용자 이름과 색상 설정 - 의존성 배열 최적화
  useEffect(() => {
    const teamId = getValidTeamId();
    if (!teamId) return;

    const setupUserInfo = () => {
      try {
        // 팀별 이름 저장소에서 현재 사용자 이름 찾기
        const savedTeamNames = JSON.parse(
          localStorage.getItem("teamNames") || "{}"
        );

        // 팀에 속한 첫 번째 사용자 이름 사용
        const teamMemberKey = Object.keys(savedTeamNames).find(
          (key) =>
            key.startsWith(`${teamId}_`) && key.split("_")[0] === String(teamId)
        );

        if (teamMemberKey && savedTeamNames[teamMemberKey]) {
          setCurrentUserName(savedTeamNames[teamMemberKey]);
        }

        // 랜덤 색상 생성
        const bgColors = [
          "#8C6EFF",
          "#64B5F6",
          "#81C784",
          "#FFB74D",
          "#BA68C8",
          "#4FC3F7",
          "#4DB6AC",
        ];

        const circleColors = [
          "#EF5DA8",
          "#FF5252",
          "#FF4081",
          "#7C4DFF",
          "#FFD740",
          "#FF6E40",
          "#64FFDA",
        ];

        // 랜덤으로 색상 선택
        setRandomBgColor(bgColors[Math.floor(Math.random() * bgColors.length)]);
        setRandomCircleColor(
          circleColors[Math.floor(Math.random() * circleColors.length)]
        );
      } catch (error) {
        console.error("사용자 이름 로드 실패:", error);
      }
    };

    setupUserInfo();
  }, [getValidTeamId]); // 의존성 최소화

  // 녹음 서비스 초기화 (최초 실행) - 마운트 시 한 번만 실행하도록 빈 배열 유지
  useEffect(() => {
    const teamId = getValidTeamId();

    // 녹음 서비스 초기화
    if (!recordingServiceRef.current) {
      console.log("녹음 서비스 초기화");
      recordingServiceRef.current = new RecordingService();
    }

    // 리스너 함수 정의 및 저장 (언마운트 시 제거를 위해)
    const recordingListener = (recordingBlob) => {
      // 전달된 데이터 유효성 확인
      if (!recordingBlob || recordingBlob.size === 0) {
        console.error("리스너에 전달된 녹음 데이터가 없거나 크기가 0입니다");
        return;
      }

      console.log(
        `녹음 완료 리스너 호출됨: ${recordingBlob.size} 바이트, 타입: ${recordingBlob.type}`
      );

      // setRecordedChunks가 있으면 사용
      if (typeof setRecordedChunks === "function") {
        try {
          console.log("setRecordedChunks 함수로 녹음 데이터 전달 시도");

          // 중요: 새 배열을 생성하여 전달 (이전 배열 참조 방지)
          setRecordedChunks((prev) => {
            // prev가 null, undefined인 경우 빈 배열 사용
            const prevChunks = prev || [];
            console.log(`이전 청크 개수: ${prevChunks.length}`);

            // 새 배열 생성하여 반환
            const newChunks = [...prevChunks, recordingBlob];
            console.log(`새 청크 개수: ${newChunks.length}`);
            return newChunks;
          });

          console.log("setRecordedChunks 함수 호출 완료");
        } catch (error) {
          console.error("setRecordedChunks 함수 호출 오류:", error);

          // 오류 발생 시 로컬 스토리지에 백업
          saveToLocalStorage(teamId, recordingBlob);
        }
      } else {
        console.warn(
          "setRecordedChunks is not available, 로컬 스토리지에 저장"
        );
        saveToLocalStorage(teamId, recordingBlob);
      }
    };

    // 리스너 등록
    recordingServiceRef.current.addListener(teamId, recordingListener);
    recordingListenerRef.current = recordingListener; // 참조 저장

    // 초기 마이크 상태에 따른 녹음 설정
    const initializeRecording = async () => {
      if (isMike && localStream) {
        try {
          const success = await recordingServiceRef.current.setupRecording(
            teamId,
            localStream
          );
          if (success) {
            await recordingServiceRef.current.startRecording(teamId);
            setIsRecording(true);
          }
        } catch (error) {
          console.error("초기 녹음 설정 실패:", error);
        }
      }
    };

    initializeRecording();

    // 컴포넌트 언마운트 시 정리
    return () => {
      const service = recordingServiceRef.current;
      if (!service) return;

      console.log("컴포넌트 언마운트 - 녹음 리소스 정리 시작");

      // 비동기 정리 함수 (예외 처리 포함)
      const cleanupRecording = async () => {
        try {
          // 리스너 제거
          if (recordingListenerRef.current) {
            service.removeListener(teamId, recordingListenerRef.current);
          }

          // 녹음 상태 확인 후 중지
          if (isRecording || isRecordingPaused) {
            console.log("언마운트 시 녹음 중지 시도");

            try {
              const recordingBlob = await service.stopRecording(teamId);
              if (recordingBlob && recordingBlob.size > 0) {
                console.log(
                  `언마운트 시 녹음 정지: ${recordingBlob.size} 바이트`
                );

                // 녹음 데이터 저장 시도
                if (typeof setRecordedChunks === "function") {
                  try {
                    setRecordedChunks((prev) => [
                      ...(prev || []),
                      recordingBlob,
                    ]);
                    console.log("언마운트 시 녹음 데이터 전달 성공");
                  } catch (error) {
                    console.error("언마운트 시 녹음 데이터 전달 실패:", error);
                    saveToLocalStorage(teamId, recordingBlob);
                  }
                } else {
                  saveToLocalStorage(teamId, recordingBlob);
                }
              } else {
                console.log("언마운트 시 녹음 데이터 없음");
              }
            } catch (error) {
              console.error("언마운트 시 녹음 중지 오류:", error);
            }
          }

          // 미디어 스트림 정리
          if (localStream) {
            console.log("언마운트 시 로컬 미디어 스트림 정리");
            localStream.getTracks().forEach((track) => {
              try {
                track.stop();
                console.log(`${track.kind} 트랙 중지 완료`);
              } catch (trackError) {
                console.warn(`트랙 중지 오류 (무시됨): ${trackError.message}`);
              }
            });
          }

          // 서비스 상태 정리
          console.log("dispose 호출 전");
          service.dispose(teamId);
          console.log("녹음 서비스 정리 완료");
        } catch (error) {
          console.error("언마운트 시 녹음 정리 오류:", error);
        }
      };

      // 즉시 실행 (비동기 실행이지만 반드시 실행 보장)
      cleanupRecording();
    };
  }, [getValidTeamId]); // 컴포넌트 마운트/언마운트 시에만 실행되도록 최소한의 의존성 배열

  // UI 이벤트 핸들러 - 콜백 메모이제이션
  const onClickFull = useCallback(
    () => setFullScreen((prev) => !prev),
    [setFullScreen]
  );

  // 모달 제어 - 콜백 메모이제이션
  const openModalStop = useCallback(() => setIsModalOpen(true), []);
  const closeModal = useCallback(() => setIsModalOpen(false), []);
  const openModalStart = useCallback(() => setIsModalStart(true), []);
  const IsCloseModal = useCallback(() => setIsModalStart(false), []);

  // ============================
  // 디버깅 및 테스트 기능 추가 부분
  // ============================

  // 디버그 패널 토글
  const toggleDebugPanel = useCallback(() => {
    setShowDebug((prev) => !prev);
  }, []);

  // 수동 알람 테스트 함수
  const testAlarm = useCallback(() => {
    // 현재 알람 상태와 반대로 설정
    const newAlarmState = !isAlarmActive;
    console.log(
      `알람 상태를 ${newAlarmState ? "활성화" : "비활성화"}로 수동 변경`
    );

    if (newAlarmState) {
      // 알람 활성화 - 10초 후 자동 비활성화
      if (manualAlarmTimeoutRef.current) {
        clearTimeout(manualAlarmTimeoutRef.current);
      }

      // 타이머 설정
      manualAlarmTimeoutRef.current = setTimeout(() => {
        console.log("수동 알람 10초 후 자동 비활성화");
        resetAlarm();
        manualAlarmTimeoutRef.current = null;
      }, 10000);
    } else {
      // 알람 비활성화
      if (manualAlarmTimeoutRef.current) {
        clearTimeout(manualAlarmTimeoutRef.current);
        manualAlarmTimeoutRef.current = null;
      }
      resetAlarm();
    }
  }, [isAlarmActive, resetAlarm]);

  // 수동 프레임 분석 실행
  const triggerManualAnalysis = useCallback(async () => {
    try {
      console.log("수동 프레임 분석 시작");
      const result = await analyzeCurrentFrame();
      console.log("수동 분석 결과:", result);

      // 결과 저장
      setDebugInfo((prev) => ({
        ...prev,
        lastAnalysisResult: result,
      }));

      return result;
    } catch (error) {
      console.error("수동 분석 오류:", error);
      return { error: error.message };
    }
  }, [analyzeCurrentFrame]);

  // 컴포넌트 언마운트 시 정리
  useEffect(() => {
    return () => {
      const cleanup = async () => {
        try {
          const teamId = getValidTeamId();

          // 녹음 중인 경우만 저장 시도
          if (isRecording || isRecordingPaused) {
            console.log("언마운트 시 녹음 저장 시도");

            // 이미 saveRecordingData에서 stopRecording을 호출하므로,
            // 다른 useEffect에서 호출하는 것과 충돌할 수 있음
            // isProcessing 플래그 활용
            const isProcessingRef = { current: false };

            try {
              if (!isProcessingRef.current) {
                isProcessingRef.current = true;
                await saveRecordingData(teamId);
                console.log("언마운트 시 녹음 저장 완료");
              }
            } catch (error) {
              console.warn("언마운트 시 녹음 저장 실패:", error);
            }
          } else {
            console.log("언마운트 시 녹음 중이 아님, 저장 건너뜀");
          }

          // 미디어 트랙 중지
          if (localStream) {
            console.log("언마운트 시 미디어 트랙 정리");
            localStream.getTracks().forEach((track) => {
              try {
                track.stop();
                console.log(`${track.kind} 트랙 중지 완료`);
              } catch (trackError) {
                console.warn(`트랙 중지 오류 (무시됨): ${trackError.message}`);
              }
            });
          }

          // 타임아웃 정리
          if (manualAlarmTimeoutRef.current) {
            clearTimeout(manualAlarmTimeoutRef.current);
            manualAlarmTimeoutRef.current = null;
          }
        } catch (error) {
          console.error("언마운트 시 정리 오류:", error);
        }
      };

      // 즉시 실행
      cleanup();
    };
  }, [
    isRecording,
    isRecordingPaused,
    localStream,
    saveRecordingData,
    getValidTeamId,
  ]);

  return (
    <>
      {meetingEnd ? (
        <div className="discord">
          <div
            className="discord-end"
            style={{ backgroundColor: color.GrayScale[8] }}
          >
            <div className="discord-end-x">
              <img
                src={X}
                onClick={onClickEnd}
                style={{ width: "3%" }}
                alt="종료"
              />
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
        <>
          <div className="discord">
            <div
              className="discord-body"
              style={{ backgroundColor: color.GrayScale[8] }}
            >
              <JitsiMeetMain setIsMettingStop={setIsMettingStop} />

              {/* 로컬 비디오 */}
              <video
                ref={localVideoRef}
                autoPlay
                playsInline
                muted
                style={{
                  position: "absolute",
                  top: "2.5%",
                  left: "2.5%",
                  width: "95%",
                  height: "95%",
                  objectFit: "cover",
                  zIndex: 5,
                  transform: "scaleX(-1)",
                  display: isCamera ? "block" : "none",
                  borderRadius: "8px",
                }}
              />

              {/* 카메라 꺼짐 상태 UI */}
              {!isCamera && (
                <div
                  className="screen"
                  style={{
                    position: "absolute",
                    top: "2.5%",
                    left: "2.5%",
                    width: "95%",
                    height: "95%",
                    zIndex: 5,
                    backgroundColor: randomBgColor,
                    display: "flex",
                    justifyContent: "center",
                    alignItems: "center",
                    borderRadius: "8px",
                  }}
                >
                  <div
                    style={{
                      height: "15%",
                      aspectRatio: "1 / 1",
                      borderRadius: "50%",
                      backgroundColor: randomCircleColor,
                      display: "flex",
                      justifyContent: "center",
                      alignItems: "center",
                      color: "white",
                      fontSize: "18px",
                    }}
                  >
                    {currentUserName}
                  </div>
                </div>
              )}

              {/* 디버그 패널 */}
              {isDevelopment && showDebug && (
                <div
                  style={{
                    position: "absolute",
                    top: "10px",
                    left: "10px",
                    zIndex: 1000,
                    backgroundColor: "rgba(0,0,0,0.7)",
                    color: "white",
                    padding: "10px",
                    borderRadius: "4px",
                    fontSize: "12px",
                    maxWidth: "300px",
                    maxHeight: "60%",
                    overflow: "auto",
                  }}
                >
                  <h3 style={{ margin: "0 0 8px 0" }}>디버그 정보</h3>
                  <div>카메라: {isCamera ? "켜짐" : "꺼짐"}</div>
                  <div>마이크: {isMike ? "켜짐" : "꺼짐"}</div>
                  <div>알람: {isAlarmActive ? "활성화" : "비활성화"}</div>
                  <div>
                    분석 활성화: {analysisState.isActive ? "예" : "아니오"}
                  </div>
                  <div>분석 중: {isAnalyzing ? "예" : "아니오"}</div>
                  <div>WebSocket: {isConnected ? "연결됨" : "연결 안됨"}</div>
                  <div>
                    에러: {analyzerError ? analyzerError.message : "없음"}
                  </div>
                  <div>
                    마지막 분석:{" "}
                    {lastAnalysisTime
                      ? new Date(lastAnalysisTime).toLocaleTimeString()
                      : "없음"}
                  </div>

                  <div
                    style={{ marginTop: "10px", display: "flex", gap: "5px" }}
                  >
                    <button
                      onClick={triggerManualAnalysis}
                      style={{
                        padding: "4px 8px",
                        backgroundColor: "#4285f4",
                        color: "white",
                        border: "none",
                        borderRadius: "4px",
                        fontSize: "12px",
                        cursor: "pointer",
                      }}
                    >
                      분석 실행
                    </button>
                    <button
                      onClick={testAlarm}
                      style={{
                        padding: "4px 8px",
                        backgroundColor: isAlarmActive ? "#f44336" : "#4CAF50",
                        color: "white",
                        border: "none",
                        borderRadius: "4px",
                        fontSize: "12px",
                        cursor: "pointer",
                      }}
                    >
                      알람 {isAlarmActive ? "끄기" : "켜기"}
                    </button>
                  </div>

                  {debugInfo.lastAnalysisResult && (
                    <div style={{ marginTop: "10px" }}>
                      <div>마지막 분석 결과:</div>
                      <pre
                        style={{
                          fontSize: "10px",
                          maxHeight: "100px",
                          overflow: "auto",
                        }}
                      >
                        {JSON.stringify(debugInfo.lastAnalysisResult, null, 2)}
                      </pre>
                    </div>
                  )}
                </div>
              )}

              {/* 디버그 패널 토글 버튼 */}
              {isDevelopment && (
                <button
                  onClick={toggleDebugPanel}
                  style={{
                    position: "absolute",
                    top: "10px",
                    right: "10px",
                    zIndex: 1000,
                    padding: "5px",
                    backgroundColor: "rgba(0,0,0,0.5)",
                    color: "white",
                    border: "none",
                    borderRadius: "4px",
                    cursor: "pointer",
                    fontSize: "12px",
                  }}
                >
                  {showDebug ? "디버그 숨기기" : "디버그 보기"}
                </button>
              )}
            </div>
            <div
              className="discord-foot"
              style={{ backgroundColor: color.GrayScale[0] }}
            >
              <div className="discord-foot-Metting">
                <img
                  src={isMettingStop ? MettingStop : MettingStart}
                  onClick={isMettingStop ? openModalStart : openModalStop}
                  style={{ width: "50%" }}
                  alt="회의 상태"
                />
                {isNewTeam() ? (
                  <img
                    src={isAlarmActive ? AlarmLight : DisAlarm}
                    style={{ width: "50%" }}
                    alt="알람"
                  />
                ) : (
                  ""
                )}
              </div>
              <div className="discord-foot-Src">
                <div className="discord-foot-NoSrc">
                  <img
                    src={isMike ? Mike : NoMike}
                    onClick={onClickMike}
                    style={{ width: "30%" }}
                    alt="마이크"
                  />
                  <img
                    src={isCamera ? Camera : NoCamera}
                    onClick={onClickCamera}
                    style={{ width: "30%" }}
                    alt="카메라"
                  />
                </div>
                <img
                  src={Fullscreen}
                  onClick={onClickFull}
                  style={{ width: "15%" }}
                  alt="전체화면"
                />
              </div>
            </div>
            {isModalStart && (
              <ModalStart
                onClose={IsCloseModal}
                setIsMettingStop={setIsMettingStop}
              />
            )}
            {isModalOpen && (
              <ModalStop
                onClose={closeModal}
                onConfirm={onModalStopConfirm}
                setIsMettingStop={setIsMettingStop}
              />
            )}
          </div>
        </>
      )}
    </>
  );
};

export default Discord;
