// ParticipantTile.jsx - 개별 참가자 타일 컴포넌트
import "../../../CSS/Grid.css";
import React, { useCallback, memo, useEffect, useRef } from "react";
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
  // 비로컬 참가자를 위한 비디오 요소 참조
  const remoteVideoRef = useRef(null);

  // 마지막 타일 여부에 따라 스타일 구성
  const containerClassName = isLastTile ? "FullGrid-main-last" : "screen";
  const circleClassName = isLastTile
    ? "FullGrid-main-circle-src-last"
    : "FullGrid-main-circle-src";
  const footClassName = isLastTile
    ? "FullGrid-main-foot-last"
    : "FullGrid-main-foot";

  // 참가자 정보 로깅 (디버깅용)
  useEffect(() => {
    if (participant.isLocal) {
      console.log("로컬 참가자 렌더링:", {
        id: participant.id,
        isCamera,
        isMike,
      });
    }
  }, [participant.id, participant.isLocal, isCamera, isMike]);

  // 메모이제이션된 이벤트 핸들러
  const onMikeClick = useCallback(
    (e) => {
      e.stopPropagation(); // 이벤트 버블링 방지
      handleMikeToggle && handleMikeToggle();
    },
    [handleMikeToggle]
  );

  const onCameraClick = useCallback(
    (e) => {
      e.stopPropagation(); // 이벤트 버블링 방지
      handleCameraToggle && handleCameraToggle();
    },
    [handleCameraToggle]
  );

  // 비디오 표시 조건
  const shouldShowVideo = participant.isLocal
    ? isCamera
    : !participant.isVideoMuted;

  // 마이크 상태 계산
  const isMuted = participant.isLocal ? !isMike : participant.isAudioMuted;

  return (
    <>
      <div className={containerClassName}>
        {isLastTile ? (
          <div className="FullGrid-main-last-Div">
            {shouldShowVideo ? (
              <video
                ref={participant.isLocal ? videoRef : remoteVideoRef}
                playsInline
                autoPlay
                muted={participant.isLocal || isMuted}
                className="participant-video"
                style={{ width: "100%", height: "100%", objectFit: "cover" }}
              />
            ) : (
              <div className="FullGrid-main-circle">
                <div className={circleClassName}></div>
              </div>
            )}

            <div className={footClassName}>
              <p style={{ ...typography.Title3, color: color.White }}>
                {participant.name}
              </p>
            </div>

            {participant.isLocal && (
              <div
                className={`FullGrid-main-nofoot${isCamera ? "-video" : ""}`}
              >
                <img
                  src={isMike ? Mike : NoMike}
                  onClick={onMikeClick}
                  style={{ width: "5%" }}
                  alt={isMike ? "마이크 켜짐" : "마이크 꺼짐"}
                />
                <img
                  src={isCamera ? Camera : NoCamera}
                  onClick={onCameraClick}
                  style={{ width: "5%" }}
                  alt={isCamera ? "카메라 켜짐" : "카메라 꺼짐"}
                />
              </div>
            )}
          </div>
        ) : (
          // 일반 타일 (마지막 타일이 아닌 경우)
          <>
            {shouldShowVideo ? (
              <video
                ref={participant.isLocal ? videoRef : remoteVideoRef}
                playsInline
                autoPlay
                muted={participant.isLocal || isMuted}
                className="participant-video"
                style={{ width: "100%", height: "100%", objectFit: "cover" }}
              />
            ) : (
              <div
                className="FullGrid-main-circle"
                style={{
                  display: "flex",
                  flexDirection: "column",
                  justifyContent: "center",
                  alignItems: "center",
                  height: "80%",
                }}
              >
                <div className={circleClassName}></div>
              </div>
            )}

            <div className={footClassName}>
              <p style={{ ...typography.Title3, color: color.White }}>
                {participant.name}
              </p>
            </div>

            {participant.isLocal && (
              <div
                className={`FullGrid-main-nofoot${isCamera ? "-video" : ""}`}
              >
                <img
                  src={isMike ? Mike : NoMike}
                  onClick={onMikeClick}
                  style={{ width: "5%" }}
                  alt={isMike ? "마이크 켜짐" : "마이크 꺼짐"}
                />
                <img
                  src={isCamera ? Camera : NoCamera}
                  onClick={onCameraClick}
                  style={{ width: "5%" }}
                  alt={isCamera ? "카메라 켜짐" : "카메라 꺼짐"}
                />
              </div>
            )}
          </>
        )}
      </div>
    </>
  );
};

export default memo(ParticipantTile);
