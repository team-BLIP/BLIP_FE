import "./CSS/HeaderTeamJoinNo.css";
import Alarm from "/src/svg/Alarm.svg";
import blackLogo from "/src/svg/blackLogo.svg";
import Letter from "/src/svg/letter.svg";

const HeaderTeamJoinNo = () => {
  return (
    <div className="MHTeamJoinNo">
      <div className="HTeamJoinNo">
        <img src={Alarm} style={{ width: "32px" }} />
        <img src={Letter} style={{ width: "32px" }} />
        <img src={blackLogo} style={{ width: "52px" }} />
      </div>
    </div>
  );
};

export default HeaderTeamJoinNo;
