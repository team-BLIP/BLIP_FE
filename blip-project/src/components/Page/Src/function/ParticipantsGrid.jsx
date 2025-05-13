import { color } from "../../../../style/color";
import React from "react";
import PropTypes from 'prop-types';
import NoMike from "../../../../svg/NoMike.svg";
import NoCamera from "../../../../svg/NoCamera.svg";
import Mike from "../../../../svg/Mike.svg";
import Camera from "../../../../svg/DisCamera.svg";

const ParticipantsGrid = ({ participants, isCamera, isMike, videoRef, handleMikeToggle, handleCameraToggle }) => {
  // 그리드 스타일 계산
  const gridStyle = React.useMemo(() => {
    const count = participants.length;
    let columns;

    if (count <= 1) {
      columns = 1;
    } else if (count <= 4) {
      columns = 2;
    } else if (count <= 9) {
      columns = 3;
    } else {
      columns = 4;
    }

    return {
      display: "grid",
      gridTemplateColumns: `repeat(${columns}, 1fr)`,
      gridAutoRows: "1fr",
      gap: "10px",
      height: "100%",
      width: "100%",
      padding: "10px",
    };
  }, [participants.length]);

  return (
    <div style={gridStyle}>
      {participants.map((participant) => (
      <div
          key={participant.id}
          className="participant-container"
          style={{
            backgroundColor: color.GrayScale[7],
            borderRadius: "8px",
            overflow: "hidden",
            position: "relative",
          }}
        >
          {participant.isLocal ? (
            <video
              ref={videoRef}
              autoPlay
              muted
              playsInline
              style={{
                width: "100%",
                height: "100%",
                objectFit: "cover",
                display: isCamera ? "block" : "none",
              }}
          />
          ) : (
            <video
              autoPlay
              playsInline
              style={{
                width: "100%",
                height: "100%",
                objectFit: "cover",
                display: !participant.isVideoMuted ? "block" : "none",
              }}
          />
          )}
      <div
            className="participant-info"
            style={{
              position: "absolute",
              bottom: "10px",
              left: "10px",
              color: "white",
              display: "flex",
              alignItems: "center",
              gap: "8px",
            }}
          >
            <span>{participant.name}</span>
            {participant.isLocal && (
              <>
              <img
                  src={isMike ? Mike : NoMike}
                  onClick={handleMikeToggle}
                  style={{ cursor: "pointer", width: "20px", height: "20px" }}
              />
              <img
                  src={isCamera ? Camera : NoCamera}
                  onClick={handleCameraToggle}
                  style={{ cursor: "pointer", width: "20px", height: "20px" }}
                />
              </>
            )}
          </div>
        </div>
      ))}
    </div>
  );
};

ParticipantsGrid.propTypes = {
  participants: PropTypes.arrayOf(
    PropTypes.shape({
      id: PropTypes.string.isRequired,
      name: PropTypes.string.isRequired,
      isLocal: PropTypes.bool,
      isVideoMuted: PropTypes.bool,
      isAudioMuted: PropTypes.bool,
    })
  ).isRequired,
  isCamera: PropTypes.bool.isRequired,
  isMike: PropTypes.bool.isRequired,
  videoRef: PropTypes.object,
  handleMikeToggle: PropTypes.func.isRequired,
  handleCameraToggle: PropTypes.func.isRequired,
};

export default ParticipantsGrid;
