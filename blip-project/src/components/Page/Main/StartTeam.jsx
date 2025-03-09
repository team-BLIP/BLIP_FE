import "../../CSS/StartTeam.css";
import Member from "../Src/Member";
import UserStart from "../Src/page/UserStart";
import OwnerTeam from "../Src/page/OwnerTeam";
import { useContext } from "react";
import { UseStateContext } from "../../../Router";
import Alarm from "../Src/page/AlarmTeam";
import Letter from "../Src/page/LetterTeam";
import Discord from "../Src/page/Discord";

const StartTeam = () => {
  const { setting, isAlarm, isLetter, discord } = useContext(UseStateContext);

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
      ) : (
        <UserStart />
      )}
    </div>
  );
};

export default StartTeam;
