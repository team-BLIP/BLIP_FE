import "../../CSS/ModalJoin.css";
import { typography } from "../../../fonts/fonts";
import { color } from "../../../style/color";
import ESC from "../../../svg/ESC.svg";
import { useState, useContext, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { TeamDel } from "../Main/Main";
import { UseStateContext } from "../../../contexts/AppContext";
import { FindId } from "../Main/Main";
import JoinApi from "../Src/api/JoinApi";
import UrlCheck from "../Src/function/UrlCheck";
import { useSidebar } from "../../../contexts/AppContext";

const ModalJoin = ({ onClose, parentOnClose }) => {
  const [isInput, setIsInput] = useState("");
  const [isValidURL, setIsValidURL] = useState(true);
  const { setOwner, setJoin, Owner } = useContext(TeamDel);
  const { targetId, setTargetId } = useContext(UseStateContext);
  const { dispatch } = useSidebar();
  const { content, TeamUrl } = useContext(FindId);
  const [JoinUrl, setJoinUrl] = useState("");
  const submitRef = useRef();
  const nav = useNavigate();
  const [inputFont, setInputFont] = useState("");
  const [isJoining, setIsJoining] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  const onClickUrl = async () => {
    if (!isInput) {
      submitRef.current.focus();
      return;
    }

    if (isValidURL) {
      try {
        const inviteCode = isInput.trim();
        console.log("초대 코드", inviteCode);
        console.log(isInput);
        console.log("Dafsghg", isValidURL);

        const rusult = await JoinApi(
          inviteCode,
          targetId,
          setTargetId,
          content,
          dispatch,
          TeamUrl,
          nav,
          content
        );

        if (rusult) {
          console.log("팀 참가 성공", rusult);
          nav("/", { state: { isInput } });
          setJoin((prev) => !prev);
          if (Owner) {
            setOwner((prev) => !prev);
          }
        }
        onClose();
        if (parentOnClose) parentOnClose();
      } catch (error) {
        console.error("팀 참가 중 오류 발생:", error);
        alert("유효하지 않은 초대 링크입니다. 다시 확인해주세요.");
      }
    }
  };

  const onKeyDownUrl = (e) => {
    if (e.keyCode === 13) {
      onClickUrl();
    }
  };

  const handleClick = UrlCheck(setIsInput, setIsValidURL);

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.keyCode === 27) {
        onClose();
        if (parentOnClose) parentOnClose();
      }
    };

    window.addEventListener("keydown", handleKeyDown);

    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [onClose]);

  useEffect(() => {
    try {
      const storedTeams = JSON.parse(localStorage.getItem("teams") || "[]");
      if (storedTeams.length > 0) {
        const latestTeam = storedTeams[storedTeams.length - 1];
        if (latestTeam && latestTeam.JoinUrl) {
          console.log("로컬 스토리지에서 JoinUrl 발견:", latestTeam.JoinUrl);
          setJoinUrl(latestTeam.JoinUrl);
          return;
        }
      }
    } catch (error) {
      console.error("로컬 스토리지 접근 오류:", error);
    }
  }, [location.state]);

  return (
    <div className="modal-overlay">
      <div className="modal-content">
        <div className="modal-Join-header">
          <div>
            <div style={typography.Label2_46}>팀스페이스 입장하기</div>
            <div
              className="modal-Join-p"
              style={{ ...typography.Body1, color: color.GrayScale[6] }}
            >
              팀을 찾고 목표를 이루세요!
            </div>
          </div>
          <img src={ESC} alt="닫기" onClick={onClose} />
        </div>
        <div className="modal-Join-main">
          <div
            className="modal-Join-main-title"
            style={{ ...typography.Title1, color: color.GrayScale[7] }}
          >
            초대링크
          </div>
          <p style={{ ...typography.Button2, color: color.GrayScale[6] }}>
            초대 받은 링크를 입력해주세요!
          </p>
          <input
            onKeyDown={onKeyDownUrl}
            placeholder="링크 주소를 입력하세요."
            value={isInput}
            type="text"
            onChange={handleClick}
            ref={submitRef}
            style={{
              borderColor: isValidURL ? "#F2F2F2" : "red",
            }}
          />
        </div>
        <div className="modal-Join-button">
          <button
            className={
              isInput && isValidURL
                ? "modal-Join-button-400"
                : "modal-Join-button-200"
            }
            style={{
              "--main-400": color.Main[4],
              "--main-200": color.Main[2],
              cursor: isInput && isValidURL ? "pointer" : "not-allowed",
            }}
            disabled={!isInput || !isValidURL}
            onClick={onClickUrl}
          >
            시작하기
          </button>
        </div>
      </div>
    </div>
  );
};

export default ModalJoin;
