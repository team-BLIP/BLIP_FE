import "./CSS/HeaderTeam.css"
import Alarm from "../svg/Alarm.svg";
import blackLogo from "../svg/blackLogo.svg";
import Letter from "../svg/letter.svg"
import { useNavigate } from "react-router-dom";

const HeaderTeam = () => {
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

export default HeaderTeam;
