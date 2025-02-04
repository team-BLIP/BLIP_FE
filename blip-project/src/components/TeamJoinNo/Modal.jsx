import { typography } from "../../fonts/fonts";
import { color } from "../../style/color";
import ESC from "../../svg/ESC.svg";
import "./CSS/Modal.css";
import { useState } from "react";

const Modal = ({ onClose }) => {
  const [isColor, setIsColor] = useState(false);

  const onClickTeam = () => {
    setIsColor(true);
  };

  return (
    <div className="modal-overlay">
      <div className="modal-content">
        <div className="modal-title">
          <div className="modal-title-font">
            <h2 style={typography.Label1}>무엇을 하실건가요?</h2>
            <p
              className="modal-title-font-p"
              style={{ ...typography.Body1, "--gray-600": color.GrayScale[6] }}
            >
              BLIP은 실시간 요약, 키워드 기록, 참여율 분석으로 더 스마트하고
              효율적인 회의를 제공합니다.
            </p>
          </div>
          <div>
            <img src={ESC} onClick={onClose} />
          </div>
        </div>
        <div
          className="modal-team"
          style={{ "--gray-700": color.GrayScale[7] }}
        >
          <button
            className="modal-team-buttons"
            style={{ ...typography.Title1 }}
            onClick={onClickTeam}
          >
            팀스페이스 만들기
          </button>
          <button
            className="modal-team-buttons"
            style={{ ...typography.Title1 }}
          >
            팀스페이스 입장하기
          </button>
        </div>
        <div className="modal-button-main">
          <button
            className="modal-button"
            style={{ "--main-200": color.Main[2] }}
          >
            시작하기
          </button>
        </div>
      </div>
    </div>
  );
};

export default Modal;
