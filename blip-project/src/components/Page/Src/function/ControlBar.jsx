import React, { useState, memo } from "react";
import styled from "styled-components";
import { color } from "../../../../style/color";
import CameraOffIcon from "../../../../svg/Nocamera.svg";
import CameraOnIcon from "../../../../svg/camera.svg";
import MicOnIcon from "../../../../svg/Mike.svg";
import MicOffIcon from "../../../../svg/NoMike.svg";

const ControlBarContainer = styled.div`
  background-color: ${color.GrayScale[0]};
  display: flex;
  width: 100%;
  height: 10%;
  flex-direction: column;
  justify-items: center;
  align-items: center;
  justify-content: space-between;
`;

const ControlButton = styled.img`
  width: ${({ size }) => size || "30%"};
  cursor: pointer;
`;

const SrcControls = styled.div`
  display: flex;
  justify-content: center;
  width: 100%;
`;

const ControlBar = () => {
  // 카메라와 마이크 상태를 관리하는 state
  const [isCameraOn, setIsCameraOn] = useState(true);
  const [isMicOn, setIsMicOn] = useState(true);

  return (
    <ControlBarContainer>
      <SrcControls>
        {/* 마이크 버튼 */}
        <ControlButton
          src={isMicOn ? MicOnIcon : MicOffIcon}
          style={{ width: "5%" }}
          alt="Mic Control"
          onClick={() => setIsMicOn((prev) => !prev)} // 상태 토글
        />

        {/* 카메라 버튼 */}
        <ControlButton
          src={isCameraOn ? CameraOnIcon : CameraOffIcon}
          style={{ width: "5%" }}
          alt="Camera Control"
          onClick={() => setIsCameraOn((prev) => !prev)} // 상태 토글
        />
      </SrcControls>
    </ControlBarContainer>
  );
};

export default memo(ControlBar);
