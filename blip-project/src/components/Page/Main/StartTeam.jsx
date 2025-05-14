import "../../CSS/StartTeam.css";
import Member from "../Src/Member";
import UserStart from "../Src/page/UserStart";
import OwnerTeam from "../Src/page/OwnerTeam";
import { useContext } from "react";
import { UseStateContext } from "../../../contexts/AppContext";
import Alarm from "../Src/page/AlarmTeam";
import Letter from "../Src/page/LetterTeam";
import Discord from "../Src/page/Discord";
import StartTeamJoinNo from "../Src/page/StartTeamJoinNo";
import MainJoin from "./MainTeam";

const StartTeam = () => {
  const { setting, isAlarm, isLetter, discord, basic, join } =
    useContext(UseStateContext);

  // 조건부 렌더링을 위한 컴포넌트 선택
  let CurrentComponent = StartTeamJoinNo;

  if (setting) {
    CurrentComponent = OwnerTeam;
  } else if (isAlarm) {
    CurrentComponent = Alarm;
  } else if (isLetter) {
    CurrentComponent = Letter;
  } else if (discord) {
    CurrentComponent = Discord;
  } else if (basic) {
    CurrentComponent = UserStart;
  } else if (join) {
    CurrentComponent = MainJoin;
  }

  return (
    <div className="start-main">
      <Member />
      <CurrentComponent />
    </div>
  );
};

export default StartTeam;
