import { typography } from "../fonts/fonts";
import { color } from "../style/color";
import "./AlarmTeam.css";
import DateTeamJoinNo from "./DateTeam";
import HeaderTeamJoinNo from "./TeamJoinNo/HeaderTeamJoinNo";
import SidebarTeamJoinNo from "./TeamJoinNo/sidebarTeamJoinNo";
import MeetingTeamJoinNo from "./MeetingTeam";

const MTeamJoinNo = () => {
  return (
    <>
      <HeaderTeamJoinNo />
      <div className="Alarm-main">
        <SidebarTeamJoinNo />
        <div className="Alarm-p">
          <p style={{ ...typography.Header3, color: color.GrayScale[4] }}>
            아직 받은 알람이 없어요
          </p>
        </div>
        <div className="Alarm-src ">
          <DateTeamJoinNo />
          <MeetingTeamJoinNo />
        </div>
      </div>
    </>
  );
};

export default MTeamJoinNo;
