import "../../CSS/ModalJoin.css";
import { typography } from "../../../fonts/fonts";
import { color } from "../../../style/color";
import ESC from "../../../svg/ESC.svg";
import { useState, useContext, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { TeamDel } from "../Main/Main";
import axios from "axios";

const ModalJoin = ({ onClose }) => {
  const [isInput, setIsInput] = useState("");
  const [isValidURL, setIsValidURL] = useState(true); // URL 유효성 상태
  const { setOwner, setJoin, Owner } = useContext(TeamDel);
  const [content, setContent] = useState("");
  const submitRef = useRef();

  const onChangeInput = (e) => {
    const value = e.target.value;
    setIsInput(value);

    // URL 유효성 검사
    try {
      new URL(value); // URL 객체로 변환
      setIsValidURL(true); // 유효한 URL
    } catch (error) {
      setIsValidURL(false); // 유효하지 않은 URL
    }
  };

  const nav = useNavigate();

  const apiUrl = import.meta.env.VITE_API_URL_URL_JOIN;

  const joinTeam = async (TeamId) => {
    const url = `${apiUrl}/data`;
    const accessToken = "토큰 값";

    const data = {
      team_id: TeamId,
    };
    try {
      const response = await axios.post(url, data, {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${accessToken}`,
        },
      });
      console.log("팀 가입 성공", response.data);
      return response.data;
    } catch (error) {
      console.log("팀 가입 실패", error);
      alert("팀 참가에 실패했습니다. 다시 시도해주세요.");
    }
  };

  const onClickUrl = async () => {
    if (isValidURL) {
      const teamId = new URL(isInput).searchParams.get("team_id");

      if (teamId) {
        const result = await joinTeam(teamId);

        if (result) {
          nav("/", { state: { isInput } });
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

  const onKeyDownUrl = (e) => {
    if (e.key === "Enter") {
      onClickUrl();
    }
  };

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
            onChange={onChangeInput}
            ref={submitRef}
            style={{
              borderColor: isValidURL ? "#F2F2F2" : "red", // 유효성에 따라 색상 변경
            }}
          ></input>
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
            disabled={!isInput || !isValidURL} // URL이 유효하지 않으면 버튼 비활성화
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
