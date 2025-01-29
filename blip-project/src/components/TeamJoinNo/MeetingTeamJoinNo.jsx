import "./MeetingTeamJoinNo.css";
import { color } from "../../style/color";
import { typography } from "../../fonts/fonts";

const MeetingTeamJoinNo = () => {
  return (
    <>
      <div
        className="MeetingTeamJoinNos"
        style={{
          "--gray-50": color.GrayScale[0],
          "--gray-400": color.GrayScale[4],
          "--black": color.Black,
        }}
      >
        <div className="MeetingTJoinNoFont" style={{ ...typography.Body2 }}>
          지난 회의 내용 요약
        </div>
        <div className="MMeetingTJoinNo">
          <div className="MeetingTJoinNo" style={{ ...typography.Header3 }}>
            아직 기록된 회의 내용이 없어요
          </div>
        </div>
      </div>
      <button
        className="MeetingTJoinNoButton"
        style={{ ...typography.Title1, "--gray-400": color.GrayScale[4] }}
      >
        회의 참가하기
      </button>
    </>
  );
};

export default MeetingTeamJoinNo;
