import "../../../CSS/Feedback.css";
import { typography } from "../../../../fonts/fonts";
import { color } from "../../../../style/color";
import { useEffect, useState, useRef } from "react";

const FEEDBACK_STORAGE_KEY = "meeting_feedbacks";

const Feedback = ({ feedbacks = [], isLoading = false, endTime }) => {
  const [storedFeedbacks, setStoredFeedbacks] = useState([]);
  const containerRef = useRef(null);

  // 디버깅을 위한 로그
  useEffect(() => {
    if (feedbacks?.length > 0) {
      console.log("Feedback 컴포넌트 - 받은 피드백 데이터:", feedbacks);
      // 받은 데이터의 날짜 정보 확인
      feedbacks.forEach((item, index) => {
        console.log(`피드백 ${index} 날짜 정보:`, {
          endTime: item.endTime,
          created_at: item.created_at,
          meeting_date: item.meeting_date,
        });
      });
    }

    if (endTime) {
      console.log("Feedback 컴포넌트 - 받은 endTime:", endTime);
    }
  }, [feedbacks, endTime]);

  // 로컬 스토리지 데이터 로드
  useEffect(() => {
    const loadStoredFeedbacks = () => {
      try {
        const storedData = localStorage.getItem(FEEDBACK_STORAGE_KEY);
        const parsedData = storedData ? JSON.parse(storedData) : [];
        console.log("로컬 스토리지에서 로드한 피드백 데이터:", parsedData);
        return parsedData;
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

    // 현재 시간을 ISO 문자열로 가져오기 (기본 날짜로 사용)
    const currentTimeIso = new Date().toISOString();

    const updatedFeedbacks = feedbacks.map((newFeedback) => {
      const existingFeedback = storedFeedbacks.find(
        (item) => item.meeting_id === newFeedback.meeting_id
      );

      // endTime을 feedbacks에 추가 (다양한 소스에서 날짜 정보 확보)
      const meetingEndTime =
        newFeedback.endTime ||
        endTime ||
        newFeedback.created_at ||
        newFeedback.meeting_date ||
        currentTimeIso;

      return existingFeedback
        ? { ...existingFeedback, ...newFeedback, endTime: meetingEndTime }
        : { ...newFeedback, endTime: meetingEndTime };
    });

    console.log("병합된 피드백 데이터:", updatedFeedbacks);

    localStorage.setItem(
      FEEDBACK_STORAGE_KEY,
      JSON.stringify(updatedFeedbacks)
    );
    setStoredFeedbacks(updatedFeedbacks);
  }, [feedbacks, endTime, storedFeedbacks]);

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

  // 개선된 날짜 포맷팅 함수
  const formatDate = (dateString) => {
    try {
      // 숫자(timestamp)인 경우 처리
      if (typeof dateString === "number") {
        return new Date(dateString).toISOString().split("T")[0];
      }

      // 문자열이 아닌 경우
      if (!dateString || typeof dateString !== "string") {
        return "날짜 정보 없음";
      }

      // 날짜 형식인지 확인
      if (dateString.includes("T") || dateString.includes("-")) {
        // ISO 포맷 또는 날짜 포맷으로 보이는 경우
        return dateString.split("T")[0];
      }

      // meeting_id가 타임스탬프인 경우 처리 시도
      if (!isNaN(dateString) && dateString.length > 8) {
        const timestamp = parseInt(dateString);
        if (!isNaN(timestamp)) {
          return new Date(timestamp).toISOString().split("T")[0];
        }
      }

      return dateString; // 그외의 경우 원본 반환
    } catch (error) {
      console.error("날짜 포맷팅 오류:", error, "대상 문자열:", dateString);
      return "날짜 정보 없음";
    }
  };

  // UI 렌더링
  return (
    <div className="feedback-container">
      {displayFeedbacks.map((item, index) => {
        if (!item) return null;

        // 날짜 정보 출력 (디버깅)
        console.log(`렌더링 - 피드백 ${index} 날짜 정보:`, item.endTime);

        // 여러 소스에서 날짜 정보 추출 시도
        const meetingDate =
          (item.endTime && formatDate(item.endTime)) ||
          (item.created_at && formatDate(item.created_at)) ||
          (item.meeting_date && formatDate(item.meeting_date)) ||
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
