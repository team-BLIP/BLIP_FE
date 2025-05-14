import "../../CSS/ModalMeeting.css";
import { typography } from "../../../fonts/fonts";
import { color } from "../../../style/color";
import { useState, useContext } from "react";
import ESC from "../../../svg/ESC.svg";
import { UseStateContext, useAppState } from "../../../contexts/AppContext";
import { TeamDel } from "../Main/Main";
import MeetingJoinApi from "../Src/api/MeetingJoinApi";
import PropTypes from "prop-types";

const ModalMeetingJoin = ({ onClose, meetingId }) => {
  const [isCheckMike, setIsCheckMike] = useState(false);
  const [isCheckCamera, setIsCheckCamera] = useState(false);
  const { setFullScreen } = useAppState();

  const {
    setIsMike,
    setIsCamera,
    setDiscord,
    setMeetingEnd,
  } = useContext(UseStateContext);

  const { setMeetingId } = useContext(TeamDel);

  const onChangeCheckMike = () => {
    setIsCheckMike(!isCheckMike);
    setIsMike((prev) => !prev);
  };

  const onChangeCheckCamera = () => {
    setIsCheckCamera(!isCheckCamera);
    setIsCamera((prev) => !prev);
  };

  const onClickJoinMeeting = async () => {
    console.log("회의 참가 시도 - meetingId:", meetingId);

    if (!meetingId) {
      alert("유효한 회의 ID가 필요합니다.");
      return;
    }

    try {
      const result = await MeetingJoinApi(meetingId);
      console.log("회의 참가 성공:", result);

      // room_url을 localStorage에 저장
      if (result && result.room_url) {
        localStorage.setItem("currentRoomUrl", result.room_url);
        console.log("회의실 URL 저장됨:", result.room_url);
      }

      // meeting_id 저장
      if (result && result.meeting_id) {
        localStorage.setItem("currentMeetingId", String(result.meeting_id));
        setMeetingId(result.meeting_id);
      }

      // 다른 필요한 데이터 저장
      localStorage.setItem("discordActive", "true");

      // 모달 닫기
      onClose();
      setFullScreen(false);

      // 상태 업데이트
      setTimeout(() => {
        try {
          setDiscord(true);
          setMeetingEnd(false);
          console.log("Discord 활성화 상태 설정 완료");
        } catch (err) {
          console.error("상태 업데이트 중 오류:", err);
          alert(
            "회의 화면으로 전환 중 문제가 발생했습니다. 페이지를 새로고침합니다."
          );
          window.location.reload();
        }
      }, 100);
    } catch (error) {
      console.error("회의 참가 실패:", error);
      alert("회의 참가에 실패했습니다. 다시 시도해주세요.");
    }
  };

  return (
    <div className="modalMeeting">
      <div className="modalMeeting-main">
        <div className="modalMeeting-header">
          <div className="modalMeeting-header-font">회의 참가하기</div>
          <img
            src={ESC}
            alt="닫기"
            onClick={onClose}
            style={{ cursor: "pointer" }}
          />
        </div>

        <div className="modalMeeting-content">
          <div className="modalMeeting-content-check">
            <div className="modalMeeting-content-check-font">
              마이크 및 카메라 설정
            </div>
            <div className="modalMeeting-content-check-main">
              <div className="modalMeeting-content-check-mike">
                <input
                  type="checkbox"
                  checked={isCheckMike}
                  onChange={onChangeCheckMike}
                />
                <div
                  className="modalMeeting-content-check-mike-font"
                  style={typography.Body2}
                >
                  마이크 켜기
                </div>
              </div>
              <div className="modalMeeting-content-check-camera">
                <input
                  type="checkbox"
                  checked={isCheckCamera}
                  onChange={onChangeCheckCamera}
                />
                <div
                  className="modalMeeting-content-check-camera-font"
                  style={typography.Body2}
                >
                  카메라 켜기
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="modalMeeting-button-main">
          {isCheckMike || isCheckCamera ? (
            <button
              className="modalMeeting-button"
              onClick={onClickJoinMeeting}
              style={{
                ...typography.Button0,
                backgroundColor: color.Main[4],
                color: color.White,
              }}
            >
              회의 참가하기
            </button>
          ) : (
            <button
              className="modalMeeting-button"
              style={{
                ...typography.Button0,
                backgroundColor: color.Main[2],
                color: color.White,
              }}
            >
              회의 참가하기
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

ModalMeetingJoin.propTypes = {
  onClose: PropTypes.func.isRequired,
  meetingId: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
};

export default ModalMeetingJoin; 