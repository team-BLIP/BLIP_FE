import "./MeetingTeam.css"
import { color } from "../style/color";
import { typography } from "../fonts/fonts";

const MeetingTeam = () => {
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
        <div className="MMeetingT">
          <div className="MeetingT" style={typography.Header3}>
            아직 기록된 회의 내용이 없어요
          </div>
        </div>
      </div>
      <button
        className="MeetingTButton"
        style={{ ...typography.Title1, "--gray-50": color.GrayScale[0] }}
      >
        회의 참가하기
      </button>
    </>
  );
};

export default MeetingTeam;
