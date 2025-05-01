import "../../CSS/MeetingTeam.css";
import { color } from "../../../style/color";
import { typography } from "../../../fonts/fonts";
import { useState, useContext, useEffect, useCallback } from "react";
import { UseStateContext, Call } from "../../../Router";
import { TeamDel, FindId } from "../Main/Main";
import ModalMeeting from "../Modal/ModalMeeting";
import MettingContent from "./page/MeetingContent";
import { handleMeetingEnd as apiHandleMeetingEnd } from "./api/MeetingEndApi";
import Feedback from "./page/Feedback"; // Feedback 컴포넌트 import
import FeedBackApi from "./api/FeedBackApi"; // FeedBackApi import

//팀 회의 관련 컴포넌트 (함수형 접근)
//회의 시작/종료 및 관련 정보 표시 기능 제공
const MeetingTeam = () => {
  // Context에서 필요한 상태 및 함수 가져오기
  const { discord, meetingEnd, setMeetingEnd, targetId } =
    useContext(UseStateContext);
  const { recordedChunks } = useContext(Call);
  const { itemId, meetingId = 1, setMeetingId } = useContext(TeamDel);
  const { createTeamId, itemBackendId } = useContext(FindId);

  // 로컬 상태 (순수 함수형 접근)
  const [userEmail, setUserEmail] = useState("");
  const [lastApiResult, setLastApiResult] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [endTime, setEndTime] = useState(null);

  // 피드백 관련 상태 추가
  const [feedbacks, setFeedbacks] = useState([]);
  const [isLoadingFeedback, setIsLoadingFeedback] = useState(false);

  // ID 정제 함수 - create-X 형식의 ID를 정수로 변환 (순수 함수)
  const cleanId = useCallback((id) => {
    if (typeof id === "string" && id.includes("create-")) {
      const match = id.match(/create-(\d+)/);
      return match && match[1] ? match[1] : id;
    }
    return id;
  }, []);

  // 유효한 팀 ID를 결정하는 함수 (순수 함수)
  const getValidTeamId = useCallback(() => {
    const id = itemBackendId || createTeamId || itemId || targetId || 1;
    return cleanId(id);
  }, [itemBackendId, createTeamId, itemId, targetId, cleanId]);

  // 유효한 회의 ID를 결정하는 함수 (순수 함수)
  const getValidMeetingId = useCallback(
    () => (meetingId || {} ? meetingId : 1),
    [meetingId]
  );

  // 피드백 데이터 로드 함수
  const loadFeedbacks = useCallback(async () => {
    const teamId = getValidTeamId();
    if (!teamId) return;

    setIsLoadingFeedback(true);
    try {
      const feedbackData = await FeedBackApi(teamId);
      setFeedbacks(feedbackData);
    } catch (error) {
      console.error("피드백 로딩 중 오류 발생:", error);
    } finally {
      setIsLoadingFeedback(false);
    }
  }, [getValidTeamId]);

  // 사용자 정보 로드 (부수 효과 분리)
  useEffect(() => {
    const loadUserEmail = () => {
      try {
        const storedEmail = localStorage.getItem("userEmail");
        if (storedEmail) {
          setUserEmail(storedEmail);
        }
      } catch (error) {
        console.error("사용자 정보 로드 실패:", error);
      }
    };

    loadUserEmail();
  }, []);

  // 컴포넌트 마운트 시 피드백 로드
  useEffect(() => {
    loadFeedbacks();
  }, [loadFeedbacks]);

  // API 결과 처리 (부수 효과 분리)
  useEffect(() => {
    if (lastApiResult?.error) {
      console.error("❌ API 오류 발생:", lastApiResult.error);
      console.log("현재 토큰:", localStorage.getItem("accessToken"));
      setError(lastApiResult.error);
    }
  }, [lastApiResult]);

  // 녹음 데이터 준비 함수 (순수 함수)
  const prepareRecordingBlob = useCallback(
    async (teamId) => {
      // Call Context의 recordedChunks 확인
      if (recordedChunks && recordedChunks.length > 0) {
        // 녹음 데이터가 있는 경우 mp3 형식으로 설정
        return new Blob(recordedChunks, { type: "audio/mpeg" });
      }

      // 전역 녹음 서비스에서 데이터 가져오기 시도
      try {
        if (window.recordingService) {
          const originalBlob = await window.recordingService.stopRecording(
            teamId
          );
          if (originalBlob) {
            // 올바른 MIME 타입 설정 (필요한 경우에만 변환)
            return originalBlob.type === "audio/mpeg"
              ? originalBlob
              : new Blob([originalBlob], { type: "audio/mpeg" });
          }
        }
      } catch (recError) {
        console.warn("녹음 서비스에서 데이터를 가져오는 중 오류:", recError);
      }

      return null;
    },
    [recordedChunks]
  );

  // 회의 종료 처리 함수 (순수 함수적 접근)
  const handleMeetingEnd = useCallback(
    async (meetingId) => {
      setIsLoading(true);
      setError(null);

      const teamId = getValidTeamId();
      const validMeetingId = getValidMeetingId();

      try {
        // 마이크 및 카메라 스트림 종료 처리
        const stopMediaDevices = async () => {
          try {
            // 활성화된 모든 미디어 스트림 가져오기
            const streams = await navigator.mediaDevices
              .getUserMedia({
                audio: true,
                video: true,
              })
              .catch(() => null);

            // 스트림이 있으면 모든 트랙 중지
            if (streams) {
              streams.getTracks().forEach((track) => {
                track.stop();
                console.log(`${track.kind} 트랙이 중지되었습니다.`);
              });
            }

            // 추가로 모든 활성 미디어 스트림 검색 및 중지
            if (
              navigator.mediaDevices &&
              navigator.mediaDevices.enumerateDevices
            ) {
              const devices = await navigator.mediaDevices.enumerateDevices();
              devices.forEach((device) => {
                if (
                  device.kind === "audioinput" ||
                  device.kind === "videoinput"
                ) {
                  console.log(`${device.kind} 장치 접근 해제: ${device.label}`);
                }
              });
            }
          } catch (mediaError) {
            console.warn("미디어 장치 중지 중 오류:", mediaError);
          }
        };

        // 미디어 장치 중지 실행
        await stopMediaDevices();

        // 회의 상태 저장 (부수 효과)
        localStorage.setItem("lastMeetingTeamId", teamId);
        localStorage.setItem("lastMeetingId", validMeetingId);

        // 로컬 스토리지에 토큰이 없으면 경고
        if (!localStorage.getItem("accessToken")) {
          throw new Error("로그인이 필요합니다. 토큰이 없습니다.");
        }

        // 녹음 데이터 준비
        const recordingBlob = await prepareRecordingBlob(teamId);

        // 녹음 데이터가 없는 경우 사용자에게 알림
        if (!recordingBlob || recordingBlob.size === 0) {
          alert(
            "녹음 파일이 없어 회의를 종료할 수 없습니다. 마이크 권한을 확인해주세요."
          );
          setIsLoading(false);
          return;
        }

        console.log("업로드할 녹음 파일 타입:", recordingBlob.type);
        console.log("업로드할 녹음 파일 크기:", recordingBlob.size, "bytes");

        console.log("API 호출 전:", {
          validMeetingId,
          teamId,
          meetingId,
        });

        // API 호출 (의존성 주입 방식 적용)
        const result = await apiHandleMeetingEnd(
          teamId,
          meetingId,
          setMeetingId,
          createTeamId,
          itemBackendId,
          recordingBlob,
          endTime,
          setEndTime
        );
        console.log("회의 종료 후 meetingId:", meetingId); // 호출 후
        console.log("회의 종료 시각:", endTime);

        if (!result.success) {
          throw new Error(result.error || "회의 종료 중 오류가 발생했습니다.");
        }

        // API 호출 성공 후 피드백 데이터를 로드하는 부분
        if (result.success) {
          try {
            // 피드백 데이터 로드 (약간의 지연을 주어 서버에서 데이터 준비 시간 확보)
            setTimeout(async () => {
              await loadFeedbacks();
            }, 1000);
          } catch (feedbackError) {
            console.error("피드백 로드 중 오류:", feedbackError);
          }
        }

        setLastApiResult(result);
        setMeetingEnd(true);
        alert("회의가 성공적으로 종료되었습니다.");
        return result;
      } catch (error) {
        console.error("💥 회의 종료 처리 실패:", error);

        // 오류가 발생해도 미디어 장치 중지 시도
        try {
          const streams = await navigator.mediaDevices
            .getUserMedia({
              audio: true,
              video: true,
            })
            .catch(() => null);

          if (streams) {
            streams.getTracks().forEach((track) => {
              track.stop();
            });
          }
        } catch (mediaError) {
          console.warn("오류 처리 중 미디어 장치 중지 실패:", mediaError);
        }

        // 인증 오류인 경우 로그인 화면으로 이동 제안
        if (
          error.message.includes("인증") ||
          error.message.includes("토큰") ||
          error.message.includes("로그인")
        ) {
          alert("인증이 만료되었습니다. 다시 로그인해 주세요.");
        } else {
          alert(`회의 종료 중 문제가 발생했습니다: ${error.message}`);
        }

        setLastApiResult({ success: false, error: error.message });
        setError(error.message);
      } finally {
        setIsLoading(false);
      }
    },
    [
      getValidTeamId,
      getValidMeetingId,
      prepareRecordingBlob,
      setMeetingId,
      createTeamId,
      itemBackendId,
      loadFeedbacks,
    ]
  );

  // 모달 제어 함수 (순수 함수)
  const modalOpen = useCallback(() => setIsModalOpen(true), []);
  const modalClose = useCallback(() => setIsModalOpen(false), []);

  // 회의 버튼 텍스트 결정 (순수 함수)
  const getButtonText = useCallback(() => {
    if (isLoading) return "처리중...";
    return meetingEnd === true ? "회의 시작하기" : "회의 나가기";
  }, [isLoading, meetingEnd]);

  // 버튼 스타일 계산 함수 (순수 함수)
  const getButtonStyle = useCallback(
    (isNewTeam = false) => {
      const baseStyle = {
        ...typography.Title1,
        opacity: isLoading ? 0.7 : 1,
        cursor: isLoading ? "not-allowed" : "pointer",
      };

      // 조건에 따른 스타일 적용
      if (meetingEnd === true || isNewTeam) {
        return {
          ...baseStyle,
          backgroundColor: isNewTeam ? color.Main[4] : color.GrayScale[0],
          color: isNewTeam ? color.White : color.GrayScale[4],
        };
      }

      return {
        ...baseStyle,
        backgroundColor: color.Main[4],
        color: color.White,
      };
    },
    [isLoading, meetingEnd]
  );

  // 조건에 따른 버튼 렌더링 (UI 로직 분리)
  const renderButton = useCallback(() => {
    // Discord 연결된 경우
    if (discord) {
      return meetingEnd ? (
        <button
          className="MeetingTButton"
          disabled={isLoading}
          style={getButtonStyle()}
        >
          {getButtonText()}
        </button>
      ) : (
        <button
          className="MeetingTButton"
          onClick={() => handleMeetingEnd(meetingId)}
          disabled={isLoading}
          style={getButtonStyle()}
        >
          {getButtonText()}
        </button>
      );
    }

    // 새로운 팀 생성 모드인 경우
    const isNewTeam =
      typeof createTeamId === "string" && createTeamId.startsWith("create-");

    return isNewTeam ? (
      <button
        className="MeetingTButton"
        onClick={modalOpen}
        disabled={isLoading}
        style={getButtonStyle(true)}
      >
        회의 시작하기
      </button>
    ) : (
      <button
        className="MeetingTButton"
        style={{
          ...typography.Title1,
          "--gray-50": color.GrayScale[0],
        }}
      >
        회의 참가하기
      </button>
    );
  }, [
    discord,
    meetingEnd,
    isLoading,
    createTeamId,
    meetingId,
    handleMeetingEnd,
    modalOpen,
    getButtonStyle,
    getButtonText,
  ]);

  return (
    <>
      <div
        className="MeetingTeams"
        style={{
          "--gray-50": color.GrayScale[0],
          "--gray-400": color.GrayScale[4],
          "--black": color.Black,
        }}
      >
        <div className="MeetingTFont" style={{ ...typography.Body2 }}>
          지난 회의 내용 요약
        </div>
        <MettingContent />

        {/* 피드백 섹션 추가 */}
        <div className="FeedbackSection" style={{ marginTop: "30px" }}>
          <div
            className="MeetingTFont"
            style={{ ...typography.Body2, marginBottom: "16px" }}
          >
            회의 피드백
          </div>
          <Feedback
            feedbacks={feedbacks}
            isLoading={isLoadingFeedback}
            endTime={endTime}
          />
        </div>
      </div>
      {renderButton()}
      {isModalOpen && <ModalMeeting onClose={modalClose} />}
    </>
  );
};

export default MeetingTeam;
