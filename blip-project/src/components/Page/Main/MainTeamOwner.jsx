import "../../CSS/MainTeamOwner.css";
import DateTeamJoinNo from "../Src/DateTeam";
import HeaderTeam from "../Src/page/HeaderTeam";
import SidebarTeam from "../Src/sidebarTeam";
import StartTeam from "./StartTeam";
import MeetingTeam from "../Src/MeetingTeam";

const MainTeamOwner = () => {
  return (
    <>
      <HeaderTeam />
      <div className="Main-Team-owner">
        <SidebarTeam />
        <StartTeam />
        <div className="Main-Team-Date-owner">
          <DateTeamJoinNo />
          <MeetingTeam />
        </div>
      </div>
    </>
  );
};

export default MainTeamOwner;
