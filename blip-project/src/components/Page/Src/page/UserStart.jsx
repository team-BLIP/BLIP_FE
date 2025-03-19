import "../../../CSS/UserStart.css";
import { typography } from "../../../../fonts/fonts";
import { color } from "../../../../style/color";
import FeedbackSvg from "../../../../svg/feedback.svg";
import { useContext } from "react";
import { UseStateContext } from "../../../../Router";
import Feedback from "./Feedback";
import Keyword from "./Keyword";
import Graph from "../function/graph";

const UserStart = () => {

  const {
    setting,
    setSetting,
    isAlarm,
    setIsAlarm,
    isLetter,
    setIsLetter,
    isFeedback,
    setIsFeedback,
    isKeyword,
    setIsKeyword,
  } = useContext(UseStateContext);

  const onClickFeedback = () => {
    setIsFeedback((preState) => !preState);
    if (isLetter === true) {
      setIsLetter((preState) => !preState);
    } else if (setting === true) {
      setSetting((preState) => !preState);
    } else if (isAlarm === true) {
      setIsAlarm((preState) => !preState);
    } else if (isKeyword === true) {
      setIsKeyword((preState) => !preState);
    }
  };

  const onClickKeyword = () => {
    setIsKeyword((preState) => !preState);
    if (isLetter === true) {
      setIsLetter((preState) => !preState);
    } else if (setting === true) {
      setSetting((preState) => !preState);
    } else if (isAlarm === true) {
      setIsAlarm((preState) => !preState);
    } else if (isFeedback === true) {
      setIsFeedback((preState) => !preState);
    }
  };

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
              <div style={{ ...typography.Body2 }}>
                키워드 요약 확인하기
              </div>
              <p
                style={{
                  ...typography.Body3Regular,
                  color: color.GrayScale[6],
                }}
              >
                진행한 회의를 바탕으로 키워드를 요약했어요!
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
          <Graph/>
        </div>
      )}
    </>
  );
};

export default UserStart;
