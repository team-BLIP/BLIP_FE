import React, { useMemo, memo } from "react";
import ParticipantTile from "./ParticipantTile";

const ParticipantsGrid = ({
  participants,
  isCamera,
  isMike,
  videoRef,
  handleMikeToggle,
  handleCameraToggle,
}) => {
  // 그리드 레이아웃 최적화를 위한 계산 메모이제이션
  const { isOddNumberOfParticipants, regularParticipants, lastParticipant } =
    useMemo(() => {
      const isOdd = participants.length % 2 === 1;
      return {
        isOddNumberOfParticipants: isOdd,
        regularParticipants: isOdd
          ? participants.slice(0, participants.length - 1)
          : participants,
        lastParticipant: isOdd ? participants[participants.length - 1] : null,
      };
    }, [participants]);

  // 참가자 현황 로깅 (디버깅용)
  useMemo(() => {
    console.log("참가자 현황:", {
      count: participants.length,
      isOdd: isOddNumberOfParticipants,
      localParticipant: participants.find((p) => p.isLocal),
    });
  }, [participants, isOddNumberOfParticipants]);

  // 참가자가 없을 경우 대체 UI
  if (participants.length === 0) {
    return (
      <div
        className="empty-grid-message"
        style={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          height: "100%",
          color: "#666",
          fontSize: "1.2rem",
        }}
      >
        회의에 참가자가 없습니다.
      </div>
    );
  }

  return (
    <>
      {/* 일반 참가자 타일 렌더링 */}
      {regularParticipants.map((participant) => (
        <ParticipantTile
          key={participant.id}
          participant={participant}
          videoRef={participant.isLocal ? videoRef : null}
          isCamera={participant.isLocal ? isCamera : !participant.isVideoMuted}
          isMike={participant.isLocal ? isMike : !participant.isAudioMuted}
          handleMikeToggle={participant.isLocal ? handleMikeToggle : null}
          handleCameraToggle={participant.isLocal ? handleCameraToggle : null}
        />
      ))}

      {/* 홀수 참가자일 경우 마지막 참가자 별도 처리 */}
      {lastParticipant && (
        <ParticipantTile
          key={lastParticipant.id}
          participant={lastParticipant}
          videoRef={lastParticipant.isLocal ? videoRef : null}
          isCamera={
            lastParticipant.isLocal ? isCamera : !lastParticipant.isVideoMuted
          }
          isMike={
            lastParticipant.isLocal ? isMike : !lastParticipant.isAudioMuted
          }
          isLastTile={true}
          handleMikeToggle={lastParticipant.isLocal ? handleMikeToggle : null}
          handleCameraToggle={
            lastParticipant.isLocal ? handleCameraToggle : null
          }
        />
      )}
    </>
  );
};

// 불필요한 리렌더링 방지를 위한 memo 적용
export default memo(ParticipantsGrid);
