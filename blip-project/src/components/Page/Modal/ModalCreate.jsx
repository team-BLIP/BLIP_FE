import "../../CSS/ModalCreate.css";
import { typography } from "../../../fonts/fonts";
import { color } from "../../../style/color";
import ESC from "../../../svg/ESC.svg";
import { useState, useRef, useContext, useEffect } from "react";
import { SidebarContext } from "../../../Router";
import { UseStateContext } from "../../../Router";
import { FindId } from "../Main/Main";
import { useNavigate } from "react-router-dom";
import CreateApi from "../Src/api/CreateApi";

const ModalCreate = ({ onClose, parentOnClose }) => {
  const { dispatch } = useContext(SidebarContext);
  const { targetId, setTargetId } = useContext(UseStateContext);
  const { idMappings } = useContext(FindId);
  const [content, setContent] = useState("");
  const [teamNames, setTeamName] = useState([]);
  const submitRef = useRef();
  const nav = useNavigate();

  console.log(dispatch);

  useEffect(() => {
    try {
      const localName = localStorage.getItem("TeamName");
      if (localName) {
        setTeamName(JSON.parse(localName));
      }
    } catch (error) {
      console.log("팀 이름 로드 실패", error);
    }
  }, []);

  const onChangeInput = (e) => {
    setContent(e.target.value);
    console.log(e.target.value);
  };

  const addTeams = () => {
    if (content.trim()) {
      const updataLocal = [...teamNames, content];
      setTargetId(updataLocal);
      setTeamName("");
      try {
        localStorage.setItem("TeamName", JSON.stringify(updataLocal));
        console.log("정상적으로 팀 이름을 저장함", content);
      } catch (error) {
        console.log("팀 이름 저장을 실패함", error);
      }
    }
  };

  const handleCreateAndClose = async () => {
    if (content.trim().length > 0) {
      try {
        await CreateApi(
          content,
          nav,
          submitRef,
          onClose,
          dispatch || {},
          targetId,
          setTargetId,
          parentOnClose,
          idMappings,
          teamNames
        );
        addTeams();
      } catch (error) {
        console.log("팀 생성 중 오류 발생", error);
        alert("팀 생성 중 오류 발생");
      }
    }
  };

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.keyCode === 27) {
        onClose();
      } else if (e.keyCode === 13) {
        // Enter 키
        if (content.trim().length > 0) {
          handleCreateAndClose(); // 여기서 한 번 호출
        }
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [onClose, content, handleCreateAndClose]);

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
            onChange={onChangeInput}
            ref={submitRef}
          ></input>
        </div>
        <div className="modal-create-button">
          {content ? (
            <button
              className="modal-create-button-400"
              style={{ "--main-400": color.Main[4] }}
              onClick={handleCreateAndClose}
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
