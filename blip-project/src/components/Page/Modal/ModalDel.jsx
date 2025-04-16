import "../../CSS/ModalDel.css";
import { typography } from "../../../fonts/fonts";
import { color } from "../../../style/color";
import ESC from "../../../svg/ESC.svg";
import { useContext, useState, useEffect } from "react";
import { SidebarContext } from "../../../Router";
import { TeamDel } from "../Main/Main";
import { FindId } from "../Main/Main";
import { UseStateContext } from "../../../Router";
import { useNavigate } from "react-router-dom";
import listDel from "../Src/api/listDel";

const ModalDel = ({ onClose }) => {
  const { dispatch } = useContext(SidebarContext);
  const { itemId, setOwner, setJoin, createTeamId } = useContext(TeamDel);
  const { setSetting, setBasic } = useContext(UseStateContext);
  const nav = useNavigate();
  const { itemBackendId } = useContext(FindId);
  const [isDeleting, setIsDeleting] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  // 커스텀 이벤트 리스너 등록
  useEffect(() => {
    // 컴포넌트가 마운트될 때 이벤트 리스너 등록
    const handleTeamDeleted = (event) => {
      const deletedTeamId = event.detail?.teamId;
      console.log("팀 삭제 이벤트 감지:", deletedTeamId);

      // 추가 UI 업데이트 로직 (필요한 경우)
      if (dispatch && typeof dispatch.onDel === "function") {
        dispatch.onDel(deletedTeamId);
      }
    };

    window.addEventListener("teamDeleted", handleTeamDeleted);

    // 컴포넌트가 언마운트될 때 이벤트 리스너 제거
    return () => {
      window.removeEventListener("teamDeleted", handleTeamDeleted);
    };
  }, [dispatch]);

  const ClickDel = async () => {
    if (!itemId && !createTeamId) {
      setErrorMessage("삭제할 팀이 선택되지 않았습니다.");
      return;
    }

    setIsDeleting(true);
    setErrorMessage("");

    try {
      // itemId에서 실제 백엔드 ID 추출
      const backendId =
        typeof itemId === "string" && itemId.startsWith("create-")
          ? itemId.replace("create-", "")
          : itemId;

      // createTeamId에서도 ID 추출 (대체 방법)
      const teamIdFromContext =
        typeof createTeamId === "string" && createTeamId.startsWith("create-")
          ? createTeamId.replace("create-", "")
          : createTeamId;

      // 최종적으로 사용할 ID 결정
      const idToDelete = backendId || teamIdFromContext;

      console.log("삭제할 팀 ID:", idToDelete);

      // UI 업데이트 콜백 함수 정의
      const onSuccessfulDelete = (deletedId) => {
        console.log("팀 삭제 성공 콜백 실행:", deletedId);

        // dispatch를 통해 UI 컴포넌트 업데이트
        if (dispatch && typeof dispatch.onDel === "function") {
          dispatch.onDel(itemId || createTeamId);
        }

        // 커스텀 이벤트 발생 - 다른 컴포넌트에게 알림
        window.dispatchEvent(
          new CustomEvent("teamDeleted", {
            detail: { teamId: deletedId },
          })
        );

        // 로컬 스토리지에서 현재 선택된 팀 ID 제거
        localStorage.removeItem("currentTeamId");

        // 홈으로 리디렉션
        nav("/", { state: {} });

        // 상태 초기화
        setOwner(false);
        setJoin(false);
        setSetting(false);
        setBasic(false);

        // 모달 닫기
        onClose();
      };

      // 백엔드 API 호출하여 팀 삭제 (콜백 함수 전달)
      const success = await listDel(idToDelete, onSuccessfulDelete);

      if (!success) {
        console.error("팀 삭제 실패");
        setErrorMessage("권한이 없거나 서버 오류가 발생했습니다.");

        // 사용자에게 로컬에서만 삭제할지 물어보기 (선택적)
        const forceLocalDelete = window.confirm(
          "서버에서 팀을 삭제하는데 문제가 발생했습니다. 로컬에서만 팀을 삭제하시겠습니까? (다음 로그인 시 팀이 다시 나타날 수 있습니다)"
        );

        if (forceLocalDelete) {
          // 로컬에서만 삭제 처리
          onSuccessfulDelete(idToDelete);
        }
      }
    } catch (error) {
      console.error("팀 삭제 중 오류 발생:", error);

      let errorMsg = "오류가 발생했습니다. 다시 시도해주세요.";

      if (error.response) {
        if (error.response.status === 403) {
          errorMsg = "권한이 없습니다. 팀 소유자만 삭제할 수 있습니다.";
        } else if (error.response.status === 500) {
          errorMsg = "서버 오류가 발생했습니다. 나중에 다시 시도해주세요.";
        } else if (error.response.status === 404) {
          errorMsg = "팀을 찾을 수 없습니다.";
        }
      }

      setErrorMessage(errorMsg);
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <div className="modalDel-overlay">
      <div className="modalDel-content">
        <div className="modalDel-title">
          <h2 style={{ ...typography.Header2, color: color.GrayScale[6] }}>
            정말 스페이스를 삭제 하실건가요?
          </h2>
          <img src={ESC} alt="스페이스 삭제 창 닫기" onClick={onClose} />
        </div>

        {/* 오류 메시지 표시 영역 */}
        {errorMessage && (
          <div
            className="modalDel-error"
            style={{
              color: color.Error[0],
              margin: "10px 0",
              textAlign: "center",
              ...typography.Body1,
            }}
          >
            {errorMessage}
          </div>
        )}

        <div className="modalDel-button-main">
          <button
            className="modalDel-button"
            onClick={ClickDel}
            disabled={isDeleting}
            style={{
              ...typography.Button0,
              backgroundColor: color.Error[0],
              opacity: isDeleting ? 0.7 : 1,
              cursor: isDeleting ? "not-allowed" : "pointer",
            }}
          >
            {isDeleting ? "삭제 중..." : "삭제"}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ModalDel;
