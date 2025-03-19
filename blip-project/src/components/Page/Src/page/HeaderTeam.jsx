import "../../../CSS/HeaderTeam.css";
import Alarm from "../../../../svg/alarm.svg";
import blackLogo from "../../../../svg/blackLogo.svg";
import Letter from "../../../../svg/letter.svg";
import { useNavigate } from "react-router-dom";
import { useContext } from "react";
import { UseStateContext } from "../../../../Router";

const HeaderTeam = () => {
  const nav = useNavigate();
  const {
    setting,
    setSetting,
    isAlarm,
    setIsAlarm,
    isLetter,
    setIsLetter,
    isFeedback,
    setIsFeedback,
    isKeyword,
    setIsKeyword,
  } = useContext(UseStateContext);

  const onClickAlarm = () => {
    setIsAlarm((preState) => !preState);
    if (isLetter === true) {
      setIsLetter((preState) => !preState);
    } else if (setting === true) {
      setSetting((preState) => !preState);
    } else if (isFeedback === true) {
      setIsFeedback((preState) => !preState);
    } else if (isKeyword === true) {
      setIsKeyword((preState) => !preState);
    }
  };

  const onClickLetter = () => {
    setIsLetter((preState) => !preState);
    if (isAlarm === true) {
      setIsAlarm((preState) => !preState);
    } else if (setting === true) {
      setSetting((preState) => !preState);
    } else if (isFeedback === true) {
      setIsFeedback((preState) => !preState);
    } else if (isKeyword === true) {
      setIsKeyword((preState) => !preState);
    }
  };

  return (
    <div className="MHTeamJoinNo">
      <div className="HTeamJoinNo">
        <img onClick={onClickAlarm} src={Alarm} style={{ width: "32px" }} />
        <img onClick={onClickLetter} src={Letter} style={{ width: "32px" }} />
        <img
          onClick={() => {
            nav("/", { state: {} });
          }}
          src={blackLogo}
          style={{ width: "52px" }}
        />
      </div>
    </div>
  );
};

export default HeaderTeam;
