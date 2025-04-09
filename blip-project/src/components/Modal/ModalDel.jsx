import "../CSS/ModalDel.css";
import { typography } from "../../../fonts/fonts";
import { color } from "../../../style/color";
import ESC from "../../../svg/ESC.svg";
import { useContext } from "react";
import { SidebarContext } from "../../../Router";
import { TeamDel } from "../Main/MainTeamOwner";
// import { TeamDel } from "../Page/Main/Main";
import { useNavigate } from "react-router-dom";

const ModalDel = ({ onClose }) => {
  const { dispatch } = useContext(SidebarContext);
  const { itemId } = useContext(TeamDel);
  const nav = useNavigate();

  const ClickDel = () => {
    if (itemId) {
      dispatch.onDel(itemId);
      nav("/", { state: {} });
    }
  };

  return (
    <div className="modalDel-overlay">
      <div className="modalDel-content">
        <div className="modalDel-title">
          <h2 style={{ ...typography.Header2, color: color.GrayScale[6] }}>
            정말 스페이스를 삭제 하실건가요?
          </h2>
          <img src={ESC} onClick={onClose} />
        </div>
        <div className="modalDel-button-main">
          <button
            className="modalDel-button"
            onClick={ClickDel}
            style={{ ...typography.Button0, backgroundColor: color.Error[0] }}
          >
            삭제
          </button>
        </div>
      </div>
    </div>
  );
};

export default ModalDel;
