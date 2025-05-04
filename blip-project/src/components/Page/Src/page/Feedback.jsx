import "../../../CSS/Feedback.css";
import { typography } from "../../../../fonts/fonts";
import { color } from "../../../../style/color";
import { useEffect, useState, useRef } from "react";

const FEEDBACK_STORAGE_KEY = "meeting_feedbacks";

const Feedback = ({ feedbacks = [], isLoading = false, endTime }) => {
  const [storedFeedbacks, setStoredFeedbacks] = useState([]);
  const containerRef = useRef(null);
  // 이전 피드백 데이터 추적용 ref
  const processedFeedbacksRef = useRef(null);

  // 디버깅을 위한 로그
  useEffect(() => {
    if (feedbacks?.length > 0) {
      console.log("Feedback 컴포넌트 - 받은 피드백 데이터:", feedbacks);
    }
    if (endTime) {
      console.log("Feedback 컴포넌트 - 받은 endTime:", endTime);
    }
  }, [feedbacks, endTime]);

  // 로컬 스토리지 데이터 로드 (마운트 시 한 번만)
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
    // 새 피드백이 없거나 이전과 동일한 데이터면 처리하지 않음
    if (
      !feedbacks ||
      feedbacks.length === 0 ||
      JSON.stringify(feedbacks) ===
        JSON.stringify(processedFeedbacksRef.current)
    ) {
      return;
    }

    // 현재 처리 중인 피드백 데이터 저장
    processedFeedbacksRef.current = [...feedbacks];

    // 로컬 스토리지에서 최신 데이터 직접 가져오기
    try {
      const storedData = localStorage.getItem(FEEDBACK_STORAGE_KEY);
      const currentStored = storedData ? JSON.parse(storedData) : [];

      // 새 데이터와 기존 데이터 병합
      const updatedFeedbacks = [...currentStored];
      let hasChanges = false;

      feedbacks.forEach((newFeedback) => {
        // endTime 추가
        const meetingEndTime =
          newFeedback.endTime || endTime || new Date().toISOString();
        const updatedFeedback = { ...newFeedback, endTime: meetingEndTime };

        // 기존 데이터에서 같은 meeting_id를 가진 항목 찾기
        const existingIndex = updatedFeedbacks.findIndex(
          (item) => item.meeting_id === newFeedback.meeting_id
        );

        if (existingIndex >= 0) {
          // 기존 항목 업데이트 (변경된 경우에만)
          if (
            JSON.stringify(updatedFeedbacks[existingIndex]) !==
            JSON.stringify(updatedFeedback)
          ) {
            updatedFeedbacks[existingIndex] = {
              ...updatedFeedbacks[existingIndex],
              ...updatedFeedback,
            };
            hasChanges = true;
          }
        } else {
          // 새 항목 추가
          updatedFeedbacks.push(updatedFeedback);
          hasChanges = true;
        }
      });

      // 변경사항이 있는 경우에만 로컬 스토리지 업데이트 및 상태 변경
      if (hasChanges) {
        localStorage.setItem(
          FEEDBACK_STORAGE_KEY,
          JSON.stringify(updatedFeedbacks)
        );
        console.log(
          "피드백 데이터 저장 완료:",
          updatedFeedbacks.length,
          "항목"
        );
        setStoredFeedbacks(updatedFeedbacks);
      }
    } catch (error) {
      console.error("피드백 데이터 병합 중 오류:", error);
    }
  }, [feedbacks, endTime]); // storedFeedbacks 의존성 제거

  // 로딩 상태 UI
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

  // 표시할 데이터 결정
  const displayFeedbacks =
    storedFeedbacks.length > 0 ? storedFeedbacks : feedbacks;

  // 데이터가 없는 경우 UI
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

  // 날짜 포맷팅 함수
  const formatDate = (dateString) => {
    try {
      if (!dateString || typeof dateString !== "string") {
        return "날짜 정보 없음";
      }

      // ISO 형식의 날짜 문자열에서 날짜 부분만 추출
      const datePart = dateString.split("T")[0];

      // yyyy-mm-dd 형식 확인
      if (datePart && datePart.match(/^\d{4}-\d{2}-\d{2}$/)) {
        return datePart;
      }

      return "날짜 정보 없음";
    } catch (error) {
      console.error("날짜 포맷팅 오류:", error);
      return "날짜 정보 없음";
    }
  };

  // UI 렌더링 부분
  return (
    <div className="feedback-container">
      {displayFeedbacks.map((item, index) => {
        if (!item) return null;

        // 날짜 포맷팅
        const meetingDate =
          (item.endTime && formatDate(item.endTime)) || "날짜 정보 없음";

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
