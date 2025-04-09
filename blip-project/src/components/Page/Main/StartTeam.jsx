import "../../CSS/StartTeam.css";
import Member from "../Src/Member";
import UserStart from "../Src/page/UserStart";
import OwnerTeam from "../Src/page/OwnerTeam";
import { useContext } from "react";
import { UseStateContext } from "../../../Router";
import Alarm from "../Src/page/AlarmTeam";
import Letter from "../Src/page/LetterTeam";
import Discord from "../Src/page/Discord";
import StartTeamJoinNo from "../Src/page/StartTeamJoinNo";
import MainJoin from "./MainTeam";

const StartTeam = () => {
  const { setting, isAlarm, isLetter, discord, basic, join } =
    useContext(UseStateContext);

  console.log("dsfghasd", discord);

  console.log("현재 값", setting, isAlarm, isLetter, discord, basic, join);
  return (
    <div className="start-main">
      <Member />
      {setting ? (
        <OwnerTeam />
      ) : isAlarm ? (
        <Alarm />
      ) : isLetter ? (
        <Letter />
      ) : discord ? (
        <Discord />
      ) : basic ? (
        <UserStart />
      ) : join ? (
        <MainJoin />
      ) : (
        <StartTeamJoinNo />
      )}
    </div>
  );
};

export default StartTeam;
