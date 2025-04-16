import "../../CSS/MeetingTeam.css";
import { color } from "../../../style/color";
import { typography } from "../../../fonts/fonts";
import { useState, useContext, useEffect } from "react";
import { UseStateContext, Call } from "../../../Router";
import { TeamDel, FindId } from "../Main/Main";
import { SidebarContext } from "../../../Router";
import ModalMeeting from "../Modal/ModalMeeting";
import MettingContent from "./page/MeetingContent";
import { handleMeetingEnd as apiHandleMeetingEnd } from "./api/MeetingEndApi";

/**
 * 팀 회의 관련 컴포넌트
 * 회의 시작/종료 및 관련 정보 표시 기능 제공
 */
const MeetingTeam = () => {
  // Context에서 필요한 상태 및 함수 가져오기
  const { discord, meetingEnd } = useContext(UseStateContext);
  const { recordedChunks } = useContext(Call);
  const { todos } = useContext(SidebarContext);
  const { itemId, meetingId, setMeetingId } = useContext(TeamDel);
  const { createTeamId, itemBackendId } = useContext(FindId);

  // 로컬 상태
  const [userEmail, setUserEmail] = useState("");
  const [lastApiResult, setLastApiResult] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  // ID 정제 함수 - create-X 형식의 ID를 정수로 변환
  const cleanId = (id) => {
    if (typeof id === "string" && id.includes("create-")) {
      const match = id.match(/create-(\d+)/);
      return match && match[1] ? match[1] : id;
    }
    return id;
  };

  // 유효한 팀 ID를 결정하는 함수
  const getValidTeamId = () => {
    const id = itemBackendId || createTeamId || itemId || 1;
    return cleanId(id);
  };

  // 유효한 회의 ID를 결정하는 함수
  const getValidMeetingId = () => meetingId || itemId || 1;

  // 사용자 정보 로드
  useEffect(() => {
    try {
      const storedEmail = localStorage.getItem("userEmail");
      if (storedEmail) {
        setUserEmail(storedEmail);
      }
    } catch (error) {
      console.error("사용자 정보 로드 실패:", error);
    }
  }, []);

  // API 결과 처리
  useEffect(() => {
    if (lastApiResult?.error) {
      console.error("❌ API 오류 발생:", lastApiResult.error);
      console.log("현재 토큰:", localStorage.getItem("accessToken"));
      setError(lastApiResult.error);
    }
  }, [lastApiResult]);

  // 회의 종료 처리 함수
  const handleMeetingEnd = async () => {
    setIsLoading(true);
    setError(null);

    const teamId = getValidTeamId();
    const validMeetingId = getValidMeetingId();

    try {
      // 이메일 확인 및 설정
      const storedEmail = localStorage.getItem("userEmail");
      if (!storedEmail) {
        const defaultEmail = "enhld00@gmail.com";
        localStorage.setItem("userEmail", defaultEmail);
      }

      // 회의 상태 저장
      localStorage.setItem("lastMeetingTeamId", teamId);
      localStorage.setItem("lastMeetingId", validMeetingId);

      // 녹음 데이터 준비
      const recordingBlob =
        recordedChunks && recordedChunks.length > 0
          ? new Blob(recordedChunks, { type: "audio/webm" })
          : null;

      // 로컬 스토리지에 토큰이 없으면 경고
      if (!localStorage.getItem("accessToken")) {
        throw new Error("로그인이 필요합니다. 토큰이 없습니다.");
      }

      // API 호출
      const result = await apiHandleMeetingEnd(
        validMeetingId,
        teamId,
        setMeetingId,
        createTeamId,
        itemBackendId,
        recordingBlob
      );

      if (!result.success) {
        throw new Error(result.error || "회의 종료 중 오류가 발생했습니다.");
      }

      setLastApiResult(result);
      alert("회의가 성공적으로 종료되었습니다.");
      return result;
    } catch (error) {
      console.error("💥 회의 종료 처리 실패:", error);

      // 인증 오류인 경우 로그인 화면으로 이동 제안
      if (
        error.message.includes("인증") ||
        error.message.includes("토큰") ||
        error.message.includes("로그인")
      ) {
        alert("인증이 만료되었습니다. 다시 로그인해 주세요.");
        // 로그인 페이지로 리디렉션 옵션:
        // window.location.href = "/login";
      } else {
        alert(`회의 종료 중 문제가 발생했습니다: ${error.message}`);
      }

      setLastApiResult({ success: false, error: error.message });
      setError(error.message);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  // 모달 제어 함수
  const modalOpen = () => setIsModalOpen(true);
  const modalClose = () => setIsModalOpen(false);

  // 회의 버튼 텍스트 결정
  const getButtonText = () => {
    if (isLoading) return "처리중...";
    return meetingEnd === true ? "회의 시작하기" : "회의 나가기";
  };

  // 조건에 따른 버튼 렌더링
  const renderButton = () => {
    // Discord 연결된 경우
    if (discord) {
      return (
        <button
          className="MeetingTButton"
          onClick={handleMeetingEnd }
          disabled={isLoading}
          style={{
            ...typography.Title1,
            backgroundColor:
              meetingEnd === true ? color.GrayScale[0] : color.Main[4],
            color: meetingEnd === true ? color.GrayScale[4] : color.White,
            opacity: isLoading ? 0.7 : 1,
            cursor: isLoading ? "not-allowed" : "pointer",
          }}
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
        style={{
          ...typography.Title1,
          backgroundColor: color.Main[4],
          color: color.White,
          opacity: isLoading ? 0.7 : 1,
          cursor: isLoading ? "not-allowed" : "pointer",
        }}
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
  };

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
      </div>
      {renderButton()}
      {isModalOpen && <ModalMeeting onClose={modalClose} />}
    </>
  );
};

export default MeetingTeam;
