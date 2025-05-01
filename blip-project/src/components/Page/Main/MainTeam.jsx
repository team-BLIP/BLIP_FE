import "../../CSS/MainTeam.css";
import DateTeam from "../Src/DateTeam";
import HeaderTeam from "../Src/page/HeaderTeam";
import SidebarTeam from "../Src/sidebarTeam";
import StartTeam from "./StartTeam";
import MeetingTeam from "../Src/MeetingTeam";
import { useContext } from "react";
import { UseStateContext } from "../../../Router";

const MainTeam = () => {
  return (
    <>
      <HeaderTeam />
      <div className="Main-Team">
        <SidebarTeam />
        <StartTeam />
        <div className="Main-Team-Date">
          <DateTeam />
          <MeetingTeam />
        </div>
      </div>
    </>
  );
};

export default MainTeam;
