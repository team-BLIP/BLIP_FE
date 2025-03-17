import "../../CSS/MainTeamJoinNo.css";
import DateTeam from "../Src/DateTeam";
import HeaderTeam from "../Src/page/HeaderTeam";
import SidebarTeam from "../Src/sidebarTeam";
import StartTeam from "./StartTeam";
import MeetingTeam from "../Src/MeetingTeam";

const MTeamJoinNo = () => {
  return (
    <>
      <HeaderTeam />
      <div className="MTJoinNoSrc">
        <SidebarTeam />
        <StartTeam />
        <div className="MTJoinNoDate">
          <DateTeam />
          <MeetingTeam />
        </div>
      </div>
    </>
  );
};

export default MTeamJoinNo;
