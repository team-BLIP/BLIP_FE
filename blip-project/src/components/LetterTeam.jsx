import "./CSS/LetterTeam.css";
import { typography } from "../fonts/fonts";
import { color } from "../style/color";
import DateTeamJoinNo from "./DateTeam";
import HeaderTeam from "./HeaderTeam";
import SidebarTeam from "./sidebarTeam";
import MeetingTeamJoinNo from "./MeetingTeam";

const MTeamJoinNo = () => {
  return (
    <>
      <HeaderTeam />
      <div className="Letter-main">
        <SidebarTeam />
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
