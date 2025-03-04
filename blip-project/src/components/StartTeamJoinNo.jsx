import "./CSS/StartTeamJoinNo.CSS";
import { typography } from "../fonts/fonts";
import { color } from "../style/color";
import Modal from "./Modal/Modal";
import { useState, useContext, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { SidebarContext } from "../Router";

const StartTeamJoinNo = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [urlInput, setUrlInput] = useState("");
  const [isUrl, setIsUrl] = useState(false);
  const { dispatch } = useContext(SidebarContext);
  const [content, setContent] = useState("");
  const submitRef = useRef();

  const onChangeUrlInput = (e) => {
    const urlValue = e.target.value;
    setUrlInput(urlValue);
    try {
      new URL(urlValue);
      setIsUrl(true);
    } catch (error) {
      setIsUrl(false);
    }
  };

  const nav = useNavigate();

  const handleClick = () => {
    if (isUrl) {
      nav("/TeamJoin", { state: { urlInput } });
      dispatch.onCreatedouble(content);
      setContent("");
    } else {
      openModal();
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter") {
      handleClick(); // Enter 키가 눌리면 onClickCreate 함수 호출
    }
  };

  const openModal = () => setIsModalOpen(true);
  const closeModal = () => setIsModalOpen(false);

  return (
    <>
      <div className="StartTeamJoinNos">
        <div className="STJoinNoMain">
          <div className="STJoinNoLink">
            <div className="STJoinNoFont">
              <p style={typography.Header1}>팀을 꾸리거나 팀에 참여하세요!</p>
              <p style={typography.Header3}>초대받은 팀의 코드를 입력하세요!</p>
            </div>
            <input
              className="STJoinNoInput"
              placeholder="링크 주소를 입력하세요."
              value={urlInput}
              type="text"
              onKeyDown={handleKeyDown}
              onChange={onChangeUrlInput}
              ref={submitRef}
              style={{
                ...typography.Header3,
                borderColor: isUrl ? "#616064" : "red",
              }}
            />
          </div>
          <button
            className="STJoinNoButton"
            onClick={handleClick}
            onKeyDown={handleKeyDown}
            style={{
              ...typography.Button0,
              "--main-400": color.Main[4],
              "--white": color.White,
            }}
          >
            시작하기
          </button>
        </div>
      </div>
      {isModalOpen && <Modal onClose={closeModal} />}
    </>
  );
};

export default StartTeamJoinNo;
