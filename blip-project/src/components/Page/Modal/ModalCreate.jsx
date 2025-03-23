import "../../CSS/ModalCreate.css";
import { typography } from "../../../fonts/fonts";
import { color } from "../../../style/color";
import ESC from "../../../svg/ESC.svg";
import { useState, useContext, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { SidebarContext } from "../../../Router";
import { TeamDel } from "../Main/Main";
import axios from "axios";

const ModalCreate = ({ onClose }) => {
  const { dispatch } = useContext(SidebarContext);
  const { setOwner, setJoin, join } = useContext(TeamDel);
  const [content, setContent] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const submitRef = useRef();
  const nav = useNavigate();

  const onChangeInput = (e) => {
    setContent(e.target.value);
    console.log(e.target.value);
  };

  const onKeyDownCreate = (e) => {
    if (e.key === "Enter") {
      handleSubmit();
    }
  };

  const handleSubmit = async () => {
    const url = "/teams/create";
    const accessToken = "토큰 값"

    console.log("fds");
    if (content === "") {
      submitRef.current.focus();
      return;
    }

    const data = {
      team_name: content,
      nick_name: "er",
    };

    try {
      const reponse = await axios.post(url, data, {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${accessToken}`,
        },
      });
      console.log("팀 생성 성공:", reponse.data);

      setOwner((prev) => !prev);
      if (join) {
        setJoin((prev) => !prev);
      }

      const TeamId = reponse.data.team_id;
      nav("/", { state: { content, TeamId } });
      console.log(TeamId);
      dispatch.onCreateone(content);
      setContent("");
      onClose();
    } catch (error) {
      console.error("팀 생성 실패:", error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="modal-overlay">
      <div className="modal-content">
        <div className="modal-create-header">
          <div>
            <div style={typography.Label2_46}>팀스페이스 만들기</div>
            <div
              className="modal-create-p"
              style={{ ...typography.Body1, color: color.GrayScale[6] }}
            >
              BLIP은 실시간 요약, 키워드 기록, 참여율 분석으로 더 스마트하고
              효율적인 회의를 제공합니다.
            </div>
          </div>
          <img src={ESC} alt="닫기" onClick={onClose} />
        </div>
        <div className="modal-create-main">
          <div
            className="modal-create-main-title"
            style={{ ...typography.Title1, "--gray-700": color.GrayScale[7] }}
          >
            팀스페이스
          </div>
          <p style={{ ...typography.Button2, color: color.GrayScale[6] }}>
            팀스페이스의 이름을 정해주세요!
          </p>
          <input
            placeholder="팀스페이스의 이름을 작성해주세요."
            value={content}
            type="text"
            onKeyDown={onKeyDownCreate}
            onChange={onChangeInput}
            ref={submitRef}
          ></input>
        </div>
        <div className="modal-create-button">
          {content ? (
            <button
              className="modal-create-button-400"
              style={{ "--main-400": color.Main[4] }}
              onClick={handleSubmit}
            >
              시작하기
            </button>
          ) : (
            <button
              className="modal-create-button-200"
              style={{ "--main-200": color.Main[2] }}
            >
              시작하기
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default ModalCreate;
