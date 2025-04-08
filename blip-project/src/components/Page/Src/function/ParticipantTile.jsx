// ParticipantTile.jsx - 개별 참가자 타일 컴포넌트
import React from "react";
import { typography } from "../../../../fonts/fonts";
import { color } from "../../../../style/color";
import NoMike from "../../../../svg/NoMike.svg";
import NoCamera from "../../../../svg/NoCamera.svg";
import Mike from "../../../../svg/Mike.svg";
import Camera from "../../../../svg/DisCamera.svg";

const ParticipantTile = ({
  participant,
  videoRef,
  isCamera,
  isMike,
  isLastTile = false,
  handleMikeToggle,
  handleCameraToggle,
}) => {
  // 마지막 타일 여부에 따라 스타일 구성
  const containerClassName = isLastTile ? "FullGrid-main-last" : "screen";
  const circleClassName = isLastTile
    ? "FullGrid-main-circle-src-last"
    : "FullGrid-main-circle-src";
  const footClassName = isLastTile
    ? "FullGrid-main-foot-last"
    : "FullGrid-main-foot";

  return (
    <>
      <div className={containerClassName}>
        {isLastTile && <div className="FullGrid-main-last-Div"></div>}

        {isCamera && !participant.isVideoMuted ? (
          <video
            ref={videoRef}
            playsInline
            autoPlay
            muted={!isMike || !participant.isLocal}
          />
        ) : (
          <div className="FullGrid-main-circle">
            <div className={circleClassName}></div>
          </div>
        )}

        <div className={footClassName}>
          <p
            style={
              isLastTile
                ? { ...typography.Title3, color: color.White }
                : typography.Title3
            }
          >
            {participant.name}
          </p>
        </div>

        {participant.isLocal && (
          <div className={`FullGrid-main-nofoot${isCamera ? "-video" : ""}`}>
            <img
              src={isMike ? Mike : NoMike}
              onClick={handleMikeToggle}
              style={{ width: "5%" }}
            />
            <img
              src={isCamera ? Camera : NoCamera}
              onClick={handleCameraToggle}
              style={{ width: "5%" }}
            />
          </div>
        )}
      </div>
    </>
  );
};

export default ParticipantTile;
