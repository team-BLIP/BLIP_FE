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
  const { dispatch } = useSidebar() || {}; // null 체크 추가
  const { content, TeamUrl } = useContext(FindId) || {}; // null 체크 추가
  const [isJoining, setIsJoining] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const submitRef = useRef();
  const nav = useNavigate();

  // 디버깅을 위한 컨텍스트 데이터 로깅
  useEffect(() => {
    console.log("ModalJoin 컨텍스트 상태:", {
      dispatch: dispatch ? "있음" : "없음",
      targetId,
      content,
      TeamUrl,
    });
  }, [dispatch, targetId, content, TeamUrl]);

  const onClickUrl = async () => {
    if (!isInput) {
      submitRef.current.focus();
      return;
    }

    if (!isValidURL) {
      setErrorMessage("유효한 초대 링크를 입력해주세요");
      return;
    }

    try {
      setIsJoining(true);
      setErrorMessage("");

      const inviteCode = isInput.trim();
      console.log("초대 코드:", inviteCode);

      // 사용자에게 표시할 팀 이름 (content가 없으면 기본값 사용)
      const teamDisplayName = content || "새 팀";

      // 디스패치 객체 확인 로깅
      if (!dispatch) {
        console.warn(
          "경고: dispatch 객체가 없습니다. useContext가 제대로 설정되었는지 확인하세요."
        );
      }

      // JoinApi 호출 시 timestamp 추가하여 캐시/중복 방지
      const result = await JoinApi(
        inviteCode,
        targetId,
        setTargetId,
        teamDisplayName,
        dispatch, // dispatch가 undefined여도 JoinApi 내부에서 처리
        TeamUrl,
        nav
      );

      setIsJoining(false);

      if (result && result.success) {
        console.log("팀 참가 성공:", result);

        // 팀 가입 이벤트 발생 (다른 컴포넌트에서 감지할 수 있도록)
        window.dispatchEvent(
          new CustomEvent("teamJoined", {
            detail: {
              team: result.data,
              timestamp: Date.now(),
            },
          })
        );

        // 상태 업데이트
        setJoin((prev) => !prev);
        if (Owner) {
          setOwner((prev) => !prev);
        }

        // 모달 닫기
        onClose();
        if (parentOnClose) parentOnClose();

        // 메인 페이지로 이동 (forceRefresh로 화면 갱신 유도)
        nav("/mainPage", {
          state: {
            targetId: result.data.team_id,
            forceRefresh: true,
            timestamp: Date.now(),
          },
        });
      } else {
        // 오류 메시지 설정
        setErrorMessage(
          result?.error?.message || "팀 참가에 실패했습니다. 다시 시도해주세요."
        );
      }
    } catch (error) {
      setIsJoining(false);
      console.error("팀 참가 중 오류 발생:", error);
      setErrorMessage("유효하지 않은 초대 링크입니다. 다시 확인해주세요.");
    }
  };

  const onKeyDownUrl = (e) => {
    if (e.key === "Enter") {
      onClickUrl();
    }
  };

  const handleClick = UrlCheck(setIsInput, setIsValidURL);

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === "Escape") {
        onClose();
        if (parentOnClose) parentOnClose();
      }
    };

    window.addEventListener("keydown", handleKeyDown);

    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [onClose, parentOnClose]);

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
          {errorMessage && (
            <p style={{ color: "red", marginTop: "8px", fontSize: "12px" }}>
              {errorMessage}
            </p>
          )}
        </div>
        <div className="modal-Join-button">
          <button
            className={
              isInput && isValidURL && !isJoining
                ? "modal-Join-button-400"
                : "modal-Join-button-200"
            }
            style={{
              "--main-400": color.Main[4],
              "--main-200": color.Main[2],
              cursor:
                isInput && isValidURL && !isJoining ? "pointer" : "not-allowed",
            }}
            disabled={!isInput || !isValidURL || isJoining}
            onClick={onClickUrl}
          >
            {isJoining ? "처리 중..." : "시작하기"}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ModalJoin;
