import "../../../CSS/LetterTeam.css";
import { typography } from "../../../../fonts/fonts";
import { color } from "../../../../style/color";
import { useLocation } from "react-router-dom";

const Letter = () => {
  const location = useLocation()
  return (
    <>
      <div
        className={`Letter-p${
          location.pathname == "/TeamOwner" || location.pathname == "/TeamJoin"
            ? "-font"
            : ""
        }`}
      >
        <p style={{ ...typography.Header3, color: color.GrayScale[4] }}>
          초대장이 없어요
        </p>
      </div>
    </>
  );
};

export default Letter;
