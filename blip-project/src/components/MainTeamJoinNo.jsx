import "./CSS/MainTeamJoinNo.css";
import DateTeamJoinNo from "./DateTeam";
import HeaderTeam from "./HeaderTeam";
import SidebarTeam from "./sidebarTeam";
import StartTeamJoinNo from "./StartTeamJoinNo";
import MeetingTeamJoinNo from "./MeetingTeam";
import Alarm from "./AlarmTeam";
import Letter from "./LetterTeam";
import { useContext } from "react";
import { UseStateContext } from "../Router";

const MTeamJoinNo = () => {
  const { isAlarm, isLetter } = useContext(UseStateContext);
  return (
    <>
      <HeaderTeam />
      <div className="MTJoinNoSrc">
        <SidebarTeam />
        {isAlarm ? <Alarm /> : isLetter ? <Letter /> : <StartTeamJoinNo />}
        <div className="MTJoinNoDate">
          <DateTeamJoinNo />
          <MeetingTeamJoinNo />
        </div>
      </div>
    </>
  );
};

export default MTeamJoinNo;
