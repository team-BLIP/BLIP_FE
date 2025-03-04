import "./CSS/AlarmTeam.css";
import { typography } from "../fonts/fonts";
import { color } from "../style/color";
import { useLocation } from "react-router-dom";

const Alarm = () => {
  const location = useLocation();
  return (
    <>
      <div
        className={`Alarm-p${
          location.pathname == "/TeamOwner" || location.pathname == "/TeamJoin"
            ? "-font"
            : ""
        }`}
      >
        <p style={{ ...typography.Header3, color: color.GrayScale[4] }}>
          아직 받은 알람이 없어요
        </p>
      </div>
    </>
  );
};

export default Alarm;
