import React, { useState, useContext, useCallback } from "react";
import "../../CSS/MeetingTeam.css";
import { color } from "../../../style/color";
import { typography } from "../../../fonts/fonts";
import { UseStateContext, useAppState } from "../../../contexts/AppContext";
import { Call } from "../../../contexts/compatibility";
import { TeamDel, FindId } from "../Main/Main";
import ModalMeeting from "../Modal/ModalMeeting";
import MettingContent from "./page/MeetingContent";
import { handleMeetingEnd } from "./api/MeetingEndApi";
import MeetingLeaveApi from "./api/MeetingLeaveApi";
import ModalMeetingJoin from "../Modal/ModalMeetingJoin";
import PropTypes from "prop-types";

// 초기 상태 객체들
const initialColor = {
  Main: {
    4: "#8C6EFF", // 보라색 계열
  },
  Secondary: {
    4: "#4CAF50", // 초록색 계열
  },
  White: "#FFFFFF",
  GrayScale: {
    0: "#F8F9FA",
    4: "#CED4DA",
  },
  Black: "#212529",
};

const initialTypography = {
  Title1: {
    fontSize: "18px",
    fontWeight: "bold",
  },
  Body2: {
    fontSize: "14px",
    fontWeight: "normal",
  },
};

// 안전한 Context 접근을 위한 커스텀 훅들
const useSafeTeamDelContext = () => {
  const context = useContext(TeamDel);
  return {
    itemId: context?.itemId || "",
    meetingId: context?.meetingId || 1,
    setMeetingId: context?.setMeetingId || (() => {}),
  };
};

const useSafeFindIdContext = () => {
  const context = useContext(FindId);
  return {
    createTeamId: context?.createTeamId || "",
    itemBackendId: context?.itemBackendId || "",
    TeamJoinId: context?.temaJoinId || "",
  };
};

const useSafeUseStateContext = () => {
  const context = useContext(UseStateContext);
  return {
    discord: context?.discord || false,
    meetingEnd: context?.meetingEnd || false,
    setMeetingEnd: context?.setMeetingEnd || (() => {}),
  };
};

const useSafeAppState = () => {
  const context = useAppState();
  return {
    setFullScreen: context?.setFullScreen || (() => {}),
    isMike: context?.isMike || false,
    setIsMike: context?.setIsMike || (() => {}),
    localStream: context?.localStream || null,
    setLocalStream: context?.setLocalStream || (() => {}),
    isRecording: context?.isRecording || false,
    setIsRecording: context?.setIsRecording || (() => {}),
  };
};

const useSafeCallContext = () => {
  const context = useContext(Call);
  return {
    recordedChunks: context?.recordedChunks || [],
  };
};

/**
 * 팀 회의 관련 컴포넌트
 * 회의 시작/종료 및 관련 정보 표시 기능 제공
 */
function MeetingTeam({ showSettingIcon = true }) {
  // 안전한 Context 사용
  const { discord, meetingEnd, setMeetingEnd } = useSafeUseStateContext();
  const { setFullScreen } = useSafeAppState();
  const { itemId, meetingId, setMeetingId } = useSafeTeamDelContext();
  const { createTeamId, itemBackendId, TeamJoinId } = useSafeFindIdContext();

  // 로컬 상태
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isJoinModalOpen, setIsJoinModalOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isInMeeting, setIsInMeeting] = useState(false);

  // 모달 제어 함수 - useCallback으로 메모이제이션
  const openModal = useCallback(() => setIsModalOpen(true), []);
  const closeModal = useCallback(() => setIsModalOpen(false), []);
  const openJoinModal = useCallback(() => setIsJoinModalOpen(true), []);
  const closeJoinModal = useCallback(() => setIsJoinModalOpen(false), []);

  // 회의 시작 성공 처리
  const handleMeetingStarted = useCallback(() => {
    setIsInMeeting(true);
    closeModal();
  }, [closeModal]);

  // 회의 참가 성공 처리
  const handleMeetingJoined = useCallback(() => {
    setIsInMeeting(true);
    closeJoinModal();
  }, [closeJoinModal]);

  // 유효한 팀 ID 가져오기
  const getValidTeamId = useCallback(() => {
    const id = itemBackendId || createTeamId || TeamJoinId || itemId || 1;
    if (typeof id === "string" && id.includes("create-")) {
      const match = id.match(/create-(\d+)/);
      return match && match[1] ? match[1] : id;
    } else if (typeof id === "string" && id.includes("Join-")) {
      const match = id.match(/create-(\d+)/);
      return match && match[1] ? match[1] : id;
    }
    return id;
  }, [itemBackendId, createTeamId, TeamJoinId, itemId]);

  // 유효한 미팅 ID 가져오기
  const getValidMeetingId = useCallback(() => {
    return meetingId || 1;
  }, [meetingId]);

  // 새 팀인지 확인
  const isNewTeam = useCallback(() => {
    return (
      (typeof createTeamId === "string" && createTeamId.includes("create-")) ||
      (typeof TeamJoinId === "string" && TeamJoinId.includes("Join-"))
    );
  }, [createTeamId, TeamJoinId]);

  // 회의 종료 처리 함수
  const handleEndMeeting = useCallback(async () => {
    setIsLoading(true);
    try {
      const teamId = getValidTeamId();
      const result = await handleMeetingEnd(
        null, // meetingId
        teamId,
        setMeetingId,
        createTeamId,
        itemBackendId,
        TeamJoinId,
        null // recordingBlob은 사용하지 않음
      );

      if (result && result.success) {
        setIsInMeeting(false); // 회의가 종료되었으므로 상태 업데이트
        if (setMeetingEnd) setMeetingEnd(true);
        if (setFullScreen) setFullScreen(false);
      } else {
        console.error("회의 종료 실패:", result?.error || "알 수 없는 오류");
        alert(result?.error || "회의 종료 중 오류가 발생했습니다.");
      }
    } catch (error) {
      console.error("회의 종료 처리 중 오류:", error);
    } finally {
      setIsLoading(false);
    }
  }, [
    getValidTeamId,
    setMeetingId,
    createTeamId,
    itemBackendId,
    TeamJoinId,
    setMeetingEnd,
    setFullScreen,
  ]);

  // 회의 나가기 처리 함수
  const handleLeaveMeeting = useCallback(async () => {
    setIsLoading(true);
    try {
      const teamId = getValidTeamId();
      const meetingIdValue = getValidMeetingId();

      const result = await MeetingLeaveApi.leaveMeeting(teamId, meetingIdValue);

      if (result && result.success) {
        setIsInMeeting(false); // 회의에서 나갔으므로 상태 업데이트
        if (setMeetingEnd) setMeetingEnd(true);
        if (setFullScreen) setFullScreen(false);
      } else {
        console.error("회의 나가기 실패:", result?.error || "알 수 없는 오류");
        alert(result?.error || "회의 나가기 중 오류가 발생했습니다.");
      }
    } catch (error) {
      console.error("회의 나가기 처리 중 오류:", error);
    } finally {
      setIsLoading(false);
    }
  }, [
    getValidTeamId,
    getValidMeetingId,
    setMeetingEnd,
    setFullScreen,
  ]);

  // 버튼 스타일 가져오기
  const getButtonStyle = useCallback((isMeetingEnd) => {
    const safeColor = color || initialColor;
    const safeTypography = typography || initialTypography;

    const mainColor = safeColor.Main?.[4] || initialColor.Main[4];
    const secondaryColor =
      safeColor.Secondary?.[4] || initialColor.Secondary[4];
    const whiteColor = safeColor.White || initialColor.White;

    return {
      ...safeTypography.Title1,
      backgroundColor: isMeetingEnd ? mainColor : secondaryColor,
      color: whiteColor,
      opacity: isLoading ? 0.7 : 1,
      cursor: isLoading ? "not-allowed" : "pointer",
    };
  }, [isLoading]);

  // 버튼 렌더링
  const renderButton = () => {
    const buttonStyle = getButtonStyle(meetingEnd);

    if (isNewTeam()) {
      // create 상태 - 회의 생성자
      let buttonText, handleClick;
      
      if (isInMeeting) {
        // 회의 진행 중이면 종료 버튼 표시
        buttonText = "회의 종료하기";
        handleClick = handleEndMeeting;
      } else {
        // 회의 진행 중이 아니면 시작 버튼 표시
        buttonText = "회의 시작하기";
        handleClick = openModal;
      }

      return (
        <button
          className="MeetingTButton"
          onClick={handleClick}
          disabled={isLoading}
          style={buttonStyle}
        >
          {isLoading ? "처리 중..." : buttonText}
        </button>
      );
    } else {
      // Join 상태 - 회의 참가자
      let buttonText, handleClick;
      
      if (isInMeeting) {
        // 회의에 참가 중이면 나가기 버튼 표시
        buttonText = "회의 나가기";
        handleClick = handleLeaveMeeting;
      } else {
        // 회의에 참가 중이 아니면 참가 버튼 표시
        buttonText = "회의 참가하기";
        handleClick = openJoinModal;
      }

      return (
        <button
          className="MeetingTButton"
          onClick={handleClick}
          disabled={isLoading}
          style={buttonStyle}
        >
          {isLoading ? "처리 중..." : buttonText}
        </button>
      );
    }
  };

  // 방어적 코딩 적용 - CSS 변수도 안전하게 설정
  const getContainerStyle = useCallback(() => {
    const safeColor = color || initialColor;
    const grayScale0 = safeColor.GrayScale?.[0] || initialColor.GrayScale[0];
    const grayScale4 = safeColor.GrayScale?.[4] || initialColor.GrayScale[4];
    const blackColor = safeColor.Black || initialColor.Black;

    return {
      "--gray-50": grayScale0,
      "--gray-400": grayScale4,
      "--black": blackColor,
    };
  }, []);

  const getTitleStyle = useCallback(() => {
    const safeTypography = typography || initialTypography;
    return safeTypography.Body2 || initialTypography.Body2;
  }, []);

  return (
    <>
      <div className="MeetingTeams" style={getContainerStyle()}>
        <div className="MeetingTFont" style={getTitleStyle()}>
          지난 회의 내용 요약
        </div>
        <MettingContent />
      </div>
      <div className="MeetingTeams">
        {renderButton()}
        {isModalOpen && (
          <ModalMeeting
            onClose={closeModal}
            setIsLoading={setIsLoading}
            onMeetingStart={handleMeetingStarted} // 회의 시작 성공 시 호출될 콜백
            setIsInMeeting={setIsInMeeting}
          />
        )}
        {isJoinModalOpen && (
          <ModalMeetingJoin
            onClose={closeJoinModal}
            meetingId={getValidMeetingId()}
            onMeetingJoin={handleMeetingJoined} // 회의 참가 성공 시 호출될 콜백
          />
        )}
      </div>
    </>
  );
}

MeetingTeam.propTypes = {
  showSettingIcon: PropTypes.bool,
};

export default MeetingTeam; 