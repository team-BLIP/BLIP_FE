import "../../CSS/ModalMeeting.css";
import { typography } from "../../../fonts/fonts";
import { color } from "../../../style/color";
import { useState, useContext, useEffect } from "react";
import ESC from "../../../svg/ESC.svg";
import { UseStateContext, useAppState } from "../../../contexts/AppContext";
import { TeamDel } from "../Main/Main";
import { FindId } from "../Main/Main";
import MeetingStartApi from "../Src/api/MeetingStartApi";

const ModalMeeting = ({ onClose }) => {
  const [isCheckMike, setIsCheckMike] = useState(false);
  const [isCheckCamera, setIsCheckCamera] = useState(false);
  const [userEmail, setUserEmail] = useState("");
  const { setFullScreen } = useAppState();

  const {
    setIsMike,
    setIsCamera,
    discord,
    setDiscord,
    meetingEnd,
    setMeetingEnd,
  } = useContext(UseStateContext);

  const { itemId, isTopic, setIsTopic, userName, meetingId, setMeetingId } =
    useContext(TeamDel);

  const { content, targetId, itemBackendId, createTeamId } = useContext(FindId);

  // 컴포넌트 마운트 시 필요한 정보 로드
  useEffect(() => {
    // 로컬 스토리지에서 사용자 이메일 가져오기 시도
    try {
      const storedEmail = localStorage.getItem("userEmail");
      if (storedEmail) {
        setUserEmail(storedEmail);
        console.log("저장된 사용자 이메일 로드:", storedEmail);
      }
    } catch (error) {
      console.error("저장된 이메일 로드 실패:", error);
    }

    console.log("discord 상태 변경:", discord);
  }, [discord]);

  // 팀 ID에 따른 리더 이메일 확인
  const getLeaderEmailForTeam = (teamId) => {
    // ID 정제
    const cleanedId =
      typeof teamId === "string"
        ? Number(teamId.replace("create-", ""))
        : Number(teamId);

    // 팀 ID 기반 이메일 선택
    if (cleanedId === 1) {
      return "enhld00@gmail.com";
    } else if (cleanedId === 2) {
      return "enhld00@dsm.hs.kr";
    }

    // 기본 이메일 반환
    return userEmail || "";
  };

  const onChageTopic = (e) => {
    setIsTopic(e.target.value);
    console.log(e.target.value);
  };

  const onChnageCheckMike = () => {
    setIsCheckMike(!isCheckMike);
    setIsMike((prev) => !prev);
  };
  const onChnageCheckCamera = () => {
    setIsCheckCamera(!isCheckCamera);
    setIsCamera((prev) => !prev);
  };

  const onClickStartMeeting = async () => {
    console.log("회의 시작 시도");

    // 백엔드 ID 확인
    const validTeamId = itemBackendId || targetId || itemId;

    if (!validTeamId) {
      alert("유효한 팀 ID를 찾을 수 없습니다.");
      return;
    }

    // 팀 ID에 맞는 리더 이메일 가져오기
    const leaderEmail = getLeaderEmailForTeam(validTeamId);
    console.log("회의 시작에 사용할 리더 이메일:", leaderEmail);

    if (typeof setDiscord !== "function") {
      console.error("setDiscord 함수가 정의되지 않았습니다");
      alert("회의 시작 기능을 사용할 수 없습니다.");
      onClose();
      return;
    }

    try {
      // 로딩 상태 표시 (필요한 경우 여기에 추가)

      const result = await MeetingStartApi({
        isTopic,
        targetId: validTeamId,
        createTeamId,
        itemBackendId,
        setMeetingId,
        userEmail: leaderEmail,
      });

      console.log("회의 시작 성공:", result);

      // 중요: room_url을 localStorage에 저장
      if (result && result.room_url) {
        localStorage.setItem("currentRoomUrl", result.room_url);
        console.log("회의실 URL 저장됨:", result.room_url);
      }

      // meeting_id도 저장
      if (result && result.meeting_id) {
        localStorage.setItem("currentMeetingId", String(result.meeting_id));
        if (typeof setMeetingId === "function") {
          setMeetingId(result.meeting_id);
        }
      }

      // 다른 필요한 데이터 저장
      localStorage.setItem("discordActive", "true");

      // 상태 변경 전에 모달 닫기
      onClose();
      setFullScreen(false);

      // 약간의 지연 후 상태 업데이트
      setTimeout(() => {
        try {
          setDiscord(true);
          setMeetingEnd(false);
          console.log("Discord 활성화 상태 설정 완료");
        } catch (err) {
          console.error("상태 업데이트 중 오류:", err);
          // 오류 발생 시 수동으로 페이지 새로고침하여 복구 시도
          alert(
            "회의 화면으로 전환 중 문제가 발생했습니다. 페이지를 새로고침합니다."
          );
          window.location.reload();
        }
      }, 100);
    } catch (error) {
      console.error("회의 시작 실패:", error);
      alert("회의 시작에 실패했습니다. 다시 시도해주세요.");

      // 버튼 상태 복원
      const button = document.querySelector(".modalMeeting-button");
      if (button) {
        button.textContent = "회의 시작하기";
        button.disabled = false;
      }
    }
  };

  useEffect(() => {
    console.log("discord 상태 변경됨:", discord);
  }, [discord]);

  return (
    <div className="modalMeeting-overlay">
      <div className="modalMeeting-content">
        <div className="modalMeeting-title">
          <div>
            <h2 style={{ ...typography.Label2_46 }}>회의 시작하기</h2>
            <p style={{ ...typography.Body1, color: color.GrayScale[6] }}>
              BLIP은 실시간 요약, 키워드 기록, 참여율 분석으로 더 스마트하고
              효율적인 회의를 제공합니다.
            </p>
          </div>
          <img src={ESC} onClick={onClose} style={{ width: "7%" }} />
        </div>
        <div className="modalMeeting-body">
          <div className="modalMeeting-body-Topic">
            <div style={{ ...typography.Title2, color: color.GrayScale[7] }}>
              회의 주제
            </div>
            <p style={{ ...typography.Button2, color: color.GrayScale[6] }}>
              회의 주제를 정해주세요!
            </p>
            <input
              style={{
                ...typography.Body2,
                "--gray-50": color.GrayScale[0],
                "--gray-200": color.GrayScale[2],
              }}
              type="text"
              minLength={4}
              value={isTopic}
              onChange={onChageTopic}
              placeholder="정기회의"
            />
          </div>
          <div className="modalMeeting-body-setting">
            <div>
              <div style={{ ...typography.Title2, color: color.GrayScale[7] }}>
                설정
              </div>
              <p style={{ ...typography.Button2, color: color.GrayScale[6] }}>
                무엇을 허용하고 입장하실건가요?
              </p>
            </div>
            <div
              className="modalMeeting-body-setting-call"
              style={{
                ...typography.Body3Regular,
                "--gray-600": color.GrayScale[6],
              }}
            >
              <div className="setting-call-mike">
                <p>마이크</p>
                <input
                  type="Checkbox"
                  checked={isCheckMike}
                  onChange={onChnageCheckMike}
                  style={{ display: "none" }}
                  id="Mike"
                />
                <label
                  htmlFor="Mike"
                  style={{ "--Main-400": color.Main[4] }}
                  className={`checkbox-label${isCheckMike ? "-checked" : ""}`}
                />
              </div>
              <div className="setting-call-camera">
                <p>카메라</p>
                <input
                  type="Checkbox"
                  checked={isCheckCamera}
                  onChange={onChnageCheckCamera}
                  style={{ display: "none" }}
                  id="camera"
                />
                <label
                  htmlFor="camera"
                  style={{ "--Main-400": color.Main[4] }}
                  className={`checkbox-label${isCheckCamera ? "-checked" : ""}`}
                />
              </div>
            </div>
          </div>
        </div>
        <div className="modalMeeting-button-main">
          {isTopic.length >= 4 || isCheckMike || isCheckCamera ? (
            <button
              className="modalMeeting-button"
              onClick={onClickStartMeeting}
              style={{
                ...typography.Button0,
                backgroundColor: color.Main[4],
                color: color.White,
              }}
              key={itemId}
            >
              회의 시작하기
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
              회의 시작하기
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default ModalMeeting;
