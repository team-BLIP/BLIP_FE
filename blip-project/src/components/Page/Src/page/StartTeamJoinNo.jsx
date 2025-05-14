import "../../../CSS/StartTeamJoinNo.css";
import { typography } from "../../../../fonts/fonts";
import { color } from "../../../../style/color";
import Modal from "../../Modal/Modal";
import { useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import JoinApi from "../api/JoinApi";
import UrlCheck from "../function/UrlCheck";

const StartTeamJoinNo = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isValidURL, setIsValidURL] = useState(true);
  const [isInput, setIsInput] = useState("");
  const [content, setContent] = useState("");
  const submitRef = useRef();

  const onClickUrl = async () => {
    if (isValidURL) {
      const teamId = new URL(isInput).searchParams.get("team_id");

      if (teamId) {
        const result = await JoinApi(teamId);

        if (result) {
          nav("/mainPage", { state: { isInput } });
          onCreatedouble(content);
          setContent("");
          setJoin((prev) => !prev);
          if (Owner) {
            setOwner((prev) => !prev);
          }
        }
      } else {
        alert("유효하지 않은 초대 링크입니다. 다시 확인해주세요.");
      }
    } else if (content === "") {
      submitRef.current.focus();
      return;
    }
  };

  const nav = useNavigate();

  const handleKeyDown = (e) => {
    if (e.key === "Enter") {
      onClickUrl();
    }
  };

  const handleClick = UrlCheck(setIsInput, setIsValidURL);

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
              value={isInput}
              type="text"
              onKeyDown={handleKeyDown}
              onChange={handleClick}
              ref={submitRef}
              style={{
                ...typography.Header3,
                borderColor: isValidURL ? "#616064" : "red",
              }}
            />
          </div>
          <button
            className="STJoinNoButton"
            onClick={openModal}
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
