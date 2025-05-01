// ControlBar.jsx - 컨트롤 바 컴포넌트
import React, { useContext, memo } from "react";
import { TeamDel } from "../../Main/Main";
import styled from "styled-components";
import { color } from "../../../../style/color";

// 스타일 컴포넌트
const ControlBarContainer = styled.div`
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  height: 60px;
  background-color: ${color.Gray900};
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 20px;
  z-index: 10;
  box-shadow: 0 -2px 10px rgba(0, 0, 0, 0.1);
`;

const ControlButton = styled.button`
  padding: 8px 16px;
  border-radius: 4px;
  background-color: ${(props) =>
    props.$isActive ? color.Primary500 : color.Gray700};
  color: ${color.White};
  border: none;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 14px;
  transition: background-color 0.2s ease;

  &:hover {
    background-color: ${(props) =>
      props.$isActive ? color.Primary600 : color.Gray800};
  }

  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
`;

const RecordingStatus = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
  color: ${color.White};
  font-size: 14px;
`;

const RecordingIndicator = styled.div`
  width: 10px;
  height: 10px;
  border-radius: 50%;
  background-color: ${(props) =>
    props.$isPaused ? color.Yellow500 : color.Red500};
  animation: ${(props) =>
    props.$isPaused ? "none" : "pulse 1.5s infinite ease-in-out"};

  @keyframes pulse {
    0% {
      opacity: 1;
    }
    50% {
      opacity: 0.5;
    }
    100% {
      opacity: 1;
    }
  }
`;

const ControlBar = ({
  isRecording,
  isPaused,
  onToggleRecording,
  onPauseRecording,
  onResumeRecording,
}) => {
  const { isTeamLeader } = useContext(TeamDel);

  return (
    <ControlBarContainer>
      {isTeamLeader ? (
        <>
          <ControlButton
            $isActive={isRecording}
            onClick={onToggleRecording}
            aria-label={isRecording ? "녹음 중지" : "녹음 시작"}
          >
            {isRecording ? "녹음 중지" : "녹음 시작"}
          </ControlButton>

          {isRecording && (
            <ControlButton
              $isActive={!isPaused}
              onClick={isPaused ? onResumeRecording : onPauseRecording}
              aria-label={isPaused ? "녹음 재개" : "녹음 일시중지"}
            >
              {isPaused ? "녹음 재개" : "녹음 일시중지"}
            </ControlButton>
          )}

          {isRecording && (
            <RecordingStatus>
              <RecordingIndicator $isPaused={isPaused} />
              {isPaused ? "일시중지됨" : "녹음 중"}
            </RecordingStatus>
          )}
        </>
      ) : (
        isRecording && (
          <RecordingStatus>
            <RecordingIndicator $isPaused={isPaused} />
            {isPaused ? "녹음 일시중지됨" : "녹음 중"}
          </RecordingStatus>
        )
      )}
    </ControlBarContainer>
  );
};

export default memo(ControlBar);
