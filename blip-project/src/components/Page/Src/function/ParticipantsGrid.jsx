// ParticipantsGrid.jsx - 참가자 그리드 표시 컴포넌트
import React from "react";
import ParticipantTile from "./ParticipantTile";

const ParticipantsGrid = ({ 
  participants, 
  isCamera, 
  isMike, 
  videoRef,
  handleMikeToggle,
  handleCameraToggle
}) => {
  const isOddNumberOfParticipants = participants.length % 2 === 1;
  
  return (
    <>
      {isOddNumberOfParticipants ? (
        <>
          {/* 홀수 참가자일 때 마지막 참가자를 제외하고 표시 */}
          {participants.slice(0, participants.length - 1).map((participant) => (
            <ParticipantTile
              key={participant.id}
              participant={participant}
              videoRef={participant.isLocal ? videoRef : null}
              isCamera={isCamera}
              isMike={isMike}
              handleMikeToggle={handleMikeToggle}
              handleCameraToggle={handleCameraToggle}
            />
          ))}

          {/* 마지막 참가자 별도 표시 (홀수 경우) */}
          <ParticipantTile
            key={participants[participants.length - 1].id}
            participant={participants[participants.length - 1]}
            videoRef={participants[participants.length - 1].isLocal ? videoRef : null}
            isCamera={isCamera}
            isMike={isMike}
            isLastTile={true}
            handleMikeToggle={handleMikeToggle}
            handleCameraToggle={handleCameraToggle}
          />
        </>
      ) : (
        <>
          {/* 짝수 참가자 또는 1명일 때 모두 표시 */}
          {participants.map((participant) => (
            <ParticipantTile
              key={participant.id}
              participant={participant}
              videoRef={participant.isLocal ? videoRef : null}
              isCamera={isCamera}
              isMike={isMike}
              handleMikeToggle={handleMikeToggle}
              handleCameraToggle={handleCameraToggle}
            />
          ))}
        </>
      )}
    </>
  );
};

export default ParticipantsGrid;