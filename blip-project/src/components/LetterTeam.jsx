import { typography } from "../fonts/fonts";
import { color } from "../style/color";
import "./LetterTeam.css";
import DateTeamJoinNo from "./DateTeam";
import HeaderTeamJoinNo from "./TeamJoinNo/HeaderTeamJoinNo";
import SidebarTeamJoinNo from "./TeamJoinNo/sidebarTeamJoinNo";
import MeetingTeamJoinNo from "./MeetingTeam";

const MTeamJoinNo = () => {
  return (
    <>
      <HeaderTeamJoinNo />
      <div className="Letter-main">
        <SidebarTeamJoinNo />
        <div className="Letter-p">
          <p style={{ ...typography.Header3, color: color.GrayScale[4] }}>
            초대장이 없어요
          </p>
        </div>
        <div className="Letter-src ">
          <DateTeamJoinNo />
          <MeetingTeamJoinNo />
        </div>
      </div>
    </>
  );
};

export default MTeamJoinNo;
