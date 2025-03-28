import "../../../CSS/UserStart.css";
import { typography } from "../../../../fonts/fonts";
import { color } from "../../../../style/color";
import FeedbackSvg from "../../../../svg/feedback.svg";
import { useContext } from "react";
import { UseStateContext } from "../../../../Router";
import Feedback from "./Feedback";
import Keyword from "./Keyword";

const UserStart = () => {
  const {
    setSetting,
    setIsAlarm,
    setIsLetter,
    isFeedback,
    setIsFeedback,
    isKeyword,
    setIsKeyword,
  } = useContext(UseStateContext);

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
              <div style={{ ...typography.Body2 }}>키워드 요약 확인하기</div>
              <p
                style={{
                  ...typography.Body3Regular,
                  color: color.GrayScale[6],
                }}
              >
                진행한 회의를 바탕으로 키워드를 요약했어요!
              </p>
              <button
                onClick={toggleView}
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
    </>
  );
};

export default UserStart;
