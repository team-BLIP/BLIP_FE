// ControlBar.jsx - 컨트롤 바 컴포넌트 (녹음 제어 등)
import React, { useContext } from "react";
import { TeamDel } from "../../Main/Main";
import styled from "styled-components";
import { color } from "../../../../style/color";

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
`;

const ControlButton = styled.button`
  padding: 8px 16px;
  border-radius: 4px;
  background-color: ${(props) =>
    props.isActive ? color.Primary500 : color.Gray700};
  color: ${color.White};
  border: none;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 8px;

  &:hover {
    background-color: ${(props) =>
      props.isActive ? color.Primary600 : color.Gray800};
  }

  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
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
      {isTeamLeader && (
        <>
          <ControlButton isActive={isRecording} onClick={onToggleRecording}>
            {isRecording ? "녹음 중지" : "녹음 시작"}
          </ControlButton>

          {isRecording && (
            <ControlButton
              isActive={!isPaused}
              onClick={isPaused ? onResumeRecording : onPauseRecording}
            >
              {isPaused ? "녹음 재개" : "녹음 일시중지"}
            </ControlButton>
          )}
        </>
      )}
    </ControlBarContainer>
  );
};

export default ControlBar;
