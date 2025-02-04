import "./CSS/MainTeamJoinNo.css";
import DateTeamJoinNo from "../DateTeam";
import HeaderTeamJoinNo from "./HeaderTeamJoinNo";
import SidebarTeamJoinNo from "./sidebarTeamJoinNo";
import StartTeamJoinNo from "./StartTeamJoinNo";
import MeetingTeamJoinNo from "./MeetingTeamJoinNo";

const MTeamJoinNo = () => {
  return (
    <>
      <HeaderTeamJoinNo />
      <div className="MTJoinNoSrc">
        <SidebarTeamJoinNo />
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
