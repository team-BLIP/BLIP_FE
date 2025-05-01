import "../../../CSS/Feedback.css";
import { typography } from "../../../../fonts/fonts";
import { color } from "../../../../style/color";
import { useEffect, useState, useRef } from "react";

const FEEDBACK_STORAGE_KEY = "meeting_feedbacks";

const Feedback = ({ feedbacks = [], isLoading = false, endTime }) => {
  const [storedFeedbacks, setStoredFeedbacks] = useState([]);
  const containerRef = useRef(null);

  useEffect(() => {
    console.log(feedbacks); // feedbacks 데이터 확인
  }, [feedbacks]);

  // 로컬 스토리지 데이터 로드
  useEffect(() => {
    const loadStoredFeedbacks = () => {
      try {
        const storedData = localStorage.getItem(FEEDBACK_STORAGE_KEY);
        return storedData ? JSON.parse(storedData) : [];
      } catch (error) {
        console.error("로컬 스토리지에서 피드백 로드 중 오류:", error);
        return [];
      }
    };

    setStoredFeedbacks(loadStoredFeedbacks());
  }, []);

  // 새로운 피드백 데이터 병합
  useEffect(() => {
    if (!feedbacks || feedbacks.length === 0) return;

    const updatedFeedbacks = feedbacks.map((newFeedback) => {
      const existingFeedback = storedFeedbacks.find(
        (item) => item.meeting_id === newFeedback.meeting_id
      );

      // endTime을 feedbacks에 추가
      const meetingEndTime = newFeedback.endTime || endTime;
      return existingFeedback
        ? { ...existingFeedback, ...newFeedback, endTime: meetingEndTime }
        : { ...newFeedback, endTime: meetingEndTime };
    });

    localStorage.setItem(
      FEEDBACK_STORAGE_KEY,
      JSON.stringify(updatedFeedbacks)
    );
    setStoredFeedbacks(updatedFeedbacks);
  }, [feedbacks, endTime]);

  if (isLoading) {
    return (
      <div className="feedback-container">
        <div className="feedback-loading">
          <p style={{ ...typography.Header3, color: color.GrayScale[4] }}>
            피드백을 불러오는 중...
          </p>
        </div>
      </div>
    );
  }

  const displayFeedbacks =
    storedFeedbacks.length > 0 ? storedFeedbacks : feedbacks;

  if (!Array.isArray(displayFeedbacks) || displayFeedbacks.length === 0) {
    return (
      <div className="feedback-container">
        <div className="feedback-empty">
          <p style={{ ...typography.Header3, color: color.GrayScale[4] }}>
            피드백이 없습니다.
          </p>
        </div>
      </div>
    );
  }
  
  const formatDate = (dateString) => {
    try {
      if (!dateString || typeof dateString !== "string") {
        return "날짜 정보 없음";
      }

      // ISO 포맷에서 'T' 이전의 날짜 부분만 추출
      return dateString.split("T")[0];
    } catch (error) {
      console.error("날짜 포맷팅 오류:", error);
      return "날짜 정보 없음";
    }
  };

  // UI 렌더링 부분 수정
  return (
    <div className="feedback-container">
      {displayFeedbacks.map((item, index) => {
        if (!item) return null;

        // 항상 endTime을 포맷팅
        const meetingDate =
          (item.endTime && formatDate(item.endTime)) ||
          formatDate(item.meeting_id) ||
          "날짜 정보 없음";
        const feedback = item.feedback || "피드백 내용이 없습니다.";

        return (
          <div
            key={`feedback-${item.meeting_id || index}`}
            className="feedback-card"
          >
            <div className="feedback-header">
              <h3 style={{ ...typography.Header3 }}>{meetingDate} 회의</h3>
            </div>
            <div className="feedback-content">
              {feedback.split("\n").map((line, lineIdx) => (
                <p
                  key={`line-${index}-${lineIdx}`}
                  style={{ ...typography.Body1, color: color.GrayScale[4] }}
                >
                  {line}
                </p>
              ))}
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default Feedback;
