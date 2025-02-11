import "./CSS/MainTeamJoinNo.css";
import DateTeamJoinNo from "./DateTeam";
import HeaderTeam from "./HeaderTeam"
import SidebarTeam from "./sidebarTeam";
import StartTeamJoinNo from "./StartTeamJoinNo";
import MeetingTeamJoinNo from "./MeetingTeam"

const MTeamJoinNo = () => {
  return (
    <>
      <HeaderTeam />
      <div className="MTJoinNoSrc">
        <SidebarTeam />
        <StartTeamJoinNo />
        <div className="MTJoinNoDate">
          <DateTeamJoinNo />
          <MeetingTeamJoinNo />
        </div>
      </div>
    </>
  );
};

export default MTeamJoinNo;
