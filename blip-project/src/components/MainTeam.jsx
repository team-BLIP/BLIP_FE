import "./CSS/MainTeam.css";
import DateTeamJoinNo from "./DateTeam";
import HeaderTeam from "./HeaderTeam";
import SidebarTeam from "./sidebarTeam";
import StartTeam from "./StartTeam";
import MeetingTeamJoinNo from "./MeetingTeam";

const MainTeam = () => {
  return (
    <>
      <HeaderTeam />
      <div className="Main-Team">
        <SidebarTeam />
        <StartTeam />
        <div className="Main-Team-Date">
          <DateTeamJoinNo />
          <MeetingTeamJoinNo />
        </div>
      </div>
    </>
  );
};

export default MainTeam;
