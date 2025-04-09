import "../../CSS/MainTeamOwner.css";
import DateTeamJoinNo from "../Src/DateTeam";
import HeaderTeam from "../Src/page/HeaderTeam";
import SidebarTeam from "../Src/sidebarTeam";
import StartTeam from "./StartTeam";
import MeetingTeam from "../Src/MeetingTeam";
import { useContext } from "react";
import { UseStateContext } from "../../../Router"

const MainTeamOwner = () => {
  const { discord } = useContext(UseStateContext);

  // 디버깅을 위한
  console.log("MTeamJoinNo - discord 상태:", discord);
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
