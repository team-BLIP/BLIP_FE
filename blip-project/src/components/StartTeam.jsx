import "./CSS/StartTeam.css";
import Member from "./Member";
import UserStart from "./UserStart";
import OwnerTeam from "./OwnerTeam";
import { useContext } from "react";
import { UseStateContext } from "../Router";
import Alarm from "./AlarmTeam";
import Letter from "./LetterTeam";
import Discord from "./Discord";

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
