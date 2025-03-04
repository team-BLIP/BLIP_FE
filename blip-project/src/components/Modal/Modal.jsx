import "../CSS/Modal.css"
import { typography } from "../../fonts/fonts";
import { color } from "../../style/color";
import ESC from "../../svg/ESC.svg"
import { useState } from "react";
import ModalCreate from "./ModalCreate";
import ModalJoin from "./ModalJoin";

const Modal = ({ onClose }) => {
  const [isColor, setIsColor] = useState(false);
  const [isColorButton, setIsColorButton] = useState(false);
  const [isModalJoin, setIsModalJoin] = useState(false);
  const [isModalCreate, setIsModalCreate] = useState(false);

  const OpenModalJoin = () => setIsModalJoin(true);
  const CloseModalJoin = () => setIsModalJoin(false);

  const OpenModalCreate = () => setIsModalCreate(true);
  const CloseModalCreate = () => setIsModalCreate(false);

  const clickisColor = () => {
    setIsColor(true);
    setIsColorButton(false);
    if (isColor === true) {
      setIsColor(false);
    }
  };

  const clickisColorButton = () => {
    setIsColor(false);
    setIsColorButton(true);
    if (isColorButton === true) {
      setIsColorButton(false);
    }
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
          {isColor ? (
            <button
              className="modal-team-buttons"
              style={{
                ...typography.Title1,
                boxShadow: "0 0 3px 3px  #31AD5F",
              }}
              onClick={clickisColor}
            >
              팀스페이스 만들기
            </button>
          ) : (
            <button
              className="modal-team-buttons"
              style={{ ...typography.Title1 }}
              onClick={clickisColor}
            >
              팀스페이스 만들기
            </button>
          )}
          {isColorButton ? (
            <button
              className="modal-team-buttons"
              style={{
                ...typography.Title1,
                boxShadow: "0 0 3px 3px  #31AD5F",
              }}
              onClick={clickisColorButton}
            >
              팀스페이스 입장하기
            </button>
          ) : (
            <button
              className="modal-team-buttons"
              style={{ ...typography.Title1 }}
              onClick={clickisColorButton}
            >
              팀스페이스 입장하기
            </button>
          )}
        </div>
        <div className="modal-button-main">
          {isColor ? (
            <button
              className="modal-button-400"
              style={{ "--main-400": color.Main[4] }}
              onClick={OpenModalCreate}
            >
              시작하기
            </button>
          ) : isColorButton ? (
            <button
              className="modal-button-400"
              style={{ "--main-400": color.Main[4] }}
              onClick={OpenModalJoin}
            >
              시작하기
            </button>
          ) : (
            <button
              className="modal-button-200"
              style={{ "--main-200": color.Main[2] }}
            >
              시작하기
            </button>
          )}
        </div>
      </div>
      {isModalJoin && <ModalJoin onClose={CloseModalJoin} />}
      {isModalCreate && <ModalCreate onClose={CloseModalCreate} />}
    </div>
  );
};

export default Modal;
