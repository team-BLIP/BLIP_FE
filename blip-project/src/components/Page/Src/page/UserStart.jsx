import "../../../CSS/UserStart.css";
import { typography } from "../../../../fonts/fonts";
import { color } from "../../../../style/color";
import FeedbackSvg from "../../../../svg/feedback.svg";
import { useContext, useEffect, useState } from "react";
import { TeamDel } from "../../Main/Main";
import Feedback from "./Feedback";
import Keyword from "./Keyword";
import ModalName from "../../Modal/ModalName"
import { useAppState } from "../../../../contexts/AppContext";

const UserStart = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const {
    setSetting,
    setIsAlarm,
    setIsLetter,
    isFeedback,
    setIsFeedback,
    isKeyword,
    setIsKeyword,
  } = useAppState();
  
  const { itemId } = useContext(TeamDel);

  const toggleView = (viewToShow) => {
    setSetting(false);
    setIsAlarm(false);
    setIsLetter(false);
    setIsFeedback(false);
    setIsKeyword(false);

    if (viewToShow === "feedback") setIsFeedback(true);
    if (viewToShow === "keyword") setIsKeyword(true);
  };
  
  const onClickFeedback = () => toggleView("feedback");
  const onClickKeyword = () => toggleView("keyword");

  useEffect(() => {
    // 팀 ID가 있는 경우 해당 팀에 이름이 등록되어 있는지 확인
    if (itemId) {
      try {
        // 사용자 고유 식별자 가져오기 (없으면 생성)
        let userId = localStorage.getItem('userId');
        if (!userId) {
          userId = 'user_' + Date.now();
          localStorage.setItem('userId', userId);
        }
        
        // 팀 ID와 사용자 ID를 조합한 고유 키 생성
        const teamUserKey = `${itemId}_${userId}`;
        
        // 저장된 팀 이름 데이터 가져오기
        const savedTeamNames = JSON.parse(localStorage.getItem('teamNames') || '{}');
        
        // 현재 사용자가 이 팀에 이름을 등록했는지 확인 (조합된 키로만 확인)
        const hasRegisteredName = savedTeamNames[teamUserKey];
        
        if (hasRegisteredName) {
          // 이름이 이미 등록된 경우 모달을 띄우지 않음
          console.log(`팀 ID "${itemId}"의 사용자 "${userId}"에 이미 이름 "${hasRegisteredName}"이(가) 등록되어 있습니다.`);
          setIsModalOpen(false);
        } else {
          // 이름이 등록되지 않은 경우 모달 띄움
          console.log(`팀 ID "${itemId}"의 사용자 "${userId}"에 등록된 이름이 없습니다. 모달을 표시합니다.`);
          setIsModalOpen(true);
        }
      } catch (error) {
        console.error("저장된 이름 확인 실패:", error);
        // 오류 발생 시 안전하게 모달 표시
        setIsModalOpen(true);
      }
    } else {
      // 팀 ID가 없는 경우(예외 상황) 모달 표시
      console.log("팀 ID가 없습니다. 모달을 표시합니다.");
      setIsModalOpen(true);
    }
  }, [itemId]);

  const closeModal = () => setIsModalOpen(false);

  return (
    <>
      {isFeedback ? (
        <Feedback />
      ) : isKeyword ? (
        <Keyword />
      ) : (
        <div className="council">
          <div className="council-keyword">
            <div className="council-keyword-main">
              <div style={{ ...typography.Body2 }}>회의 요약 확인하기</div>
              <p
                style={{
                  ...typography.Body3Regular,
                  color: color.GrayScale[6],
                }}
              >
                진행한 회의를 요약했어요!
              </p>
              <button
                onClick={onClickKeyword}
                style={{ ...typography.Button3, "--main-400": color.Main[4] }}
              >
                확인하기
              </button>
            </div>
          </div>
          <div
            className="council-feedback"
            style={{ "--gray-200": color.GrayScale[2] }}
          >
            <div className="council-feedback-main">
              <div>
                <div style={{ ...typography.Body2 }}>회의 피드백 확인하기</div>
                <p
                  style={{
                    ...typography.Body3Regular,
                    color: color.GrayScale[6],
                  }}
                >
                  진행한 회의를 피드백 해드릴게요!
                </p>
              </div>
              <button
                onClick={onClickFeedback}
                style={{ ...typography.Button3, "--main-400": color.Main[4] }}
              >
                확인하기
              </button>
            </div>
            <img src={FeedbackSvg} />
          </div>
        </div>
      )}
      {isModalOpen && <ModalName onClose={closeModal} />}
    </>
  );
};

export default UserStart;
