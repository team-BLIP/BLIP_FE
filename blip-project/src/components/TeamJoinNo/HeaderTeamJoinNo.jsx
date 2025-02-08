import "./CSS/HeaderTeamJoinNo.css";
import Alarm from "/src/svg/Alarm.svg";
import blackLogo from "/src/svg/blackLogo.svg";
import Letter from "/src/svg/letter.svg";
import { useNavigate } from "react-router-dom";

const HeaderTeamJoinNo = () => {
  const nav = useNavigate()
  return (
    <div className="MHTeamJoinNo">
      <div className="HTeamJoinNo">
        <img onClick={() =>{nav("/Alarm",{state:{}})}} src={Alarm} style={{ width: "32px" }} />
        <img onClick={() =>{nav("/Letter",{state:{}})}} src={Letter} style={{ width: "32px" }} />
        <img onClick={()=>{nav("/",{state:{}})}} src={blackLogo} style={{ width: "52px" }} />
      </div>
    </div>
  );
};

export default HeaderTeamJoinNo;
