import "../../../CSS/Feedback.css";
import { typography } from "../../../../fonts/fonts";
import { color } from "../../../../style/color";
import { useEffect, useState, useRef } from "react";
import FeedBackApi from "../api/FeedBackApi";

const FEEDBACK_STORAGE_KEY = "meeting_feedbacks";

const Feedback = ({ isLoading: initialLoading = false, endTime }) => {
  const [storedFeedbacks, setStoredFeedbacks] = useState([]);
  const [isLoading, setIsLoading] = useState(initialLoading);
  const [error, setError] = useState(null);
  const containerRef = useRef(null);

  // 피드백 데이터 가져오기
  const fetchFeedbacks = async () => {
    try {
      setIsLoading(true);
      setError(null);

      // 현재 팀 ID 가져오기
      const currentTeamId = localStorage.getItem("currentTeamId");
      if (!currentTeamId) {
        console.warn("현재 팀 ID를 찾을 수 없습니다.");
        setIsLoading(false);
        return;
      }

      console.log("피드백 데이터 가져오기 시작 - 팀 ID:", currentTeamId);

      // 1. API 호출
      const feedbacksData = await FeedBackApi(currentTeamId);
      console.log("API 응답 데이터:", feedbacksData);

      // 2. 데이터가 있으면 로컬 스토리지에 저장
      if (Array.isArray(feedbacksData) && feedbacksData.length > 0) {
        // 기존 데이터 로드
        const existingData = [];
        try {
          const storedData = localStorage.getItem(FEEDBACK_STORAGE_KEY);
          if (storedData) {
            const parsedData = JSON.parse(storedData);
            if (Array.isArray(parsedData)) {
              existingData.push(...parsedData);
            }
          }
        } catch (e) {
          console.error("기존 데이터 로드 오류:", e);
        }

        // 새 데이터와 기존 데이터 병합 (중복 방지)
        const mergedData = [...existingData];

        feedbacksData.forEach((newItem) => {
          // 기존 항목과 중복 체크
          const existingIndex = mergedData.findIndex(
            (item) => item && item.meeting_id === newItem.meeting_id
          );

          if (existingIndex >= 0) {
            // 업데이트
            mergedData[existingIndex] = {
              ...mergedData[existingIndex],
              ...newItem,
            };
          } else {
            // 추가
            mergedData.push(newItem);
          }
        });

        // 3. 로컬 스토리지에 저장 (explicit)
        try {
          const jsonData = JSON.stringify(mergedData);
          localStorage.setItem(FEEDBACK_STORAGE_KEY, jsonData);
          console.log(
            `로컬 스토리지에 ${mergedData.length}개 항목 저장됨:`,
            FEEDBACK_STORAGE_KEY
          );

          // 4. 상태 업데이트
          setStoredFeedbacks(mergedData);
        } catch (storageError) {
          console.error("로컬 스토리지 저장 오류:", storageError);
          setError("데이터를 저장하는 중 오류가 발생했습니다.");
        }
      } else {
        // 데이터가 없는 경우 기존 데이터 로드
        try {
          const storedData = localStorage.getItem(FEEDBACK_STORAGE_KEY);
          if (storedData) {
            const parsedData = JSON.parse(storedData);
            if (Array.isArray(parsedData)) {
              setStoredFeedbacks(parsedData);
              console.log("기존 로컬 스토리지 데이터 로드:", parsedData.length);
            }
          }
        } catch (e) {
          console.error("로컬 스토리지 로드 오류:", e);
        }
      }
    } catch (error) {
      console.error("피드백 데이터 가져오기 실패:", error);
      setError(error.message || "피드백 정보를 가져오는데 실패했습니다.");

      // 오류 발생 시 기존 로컬 스토리지 데이터 로드
      try {
        const storedData = localStorage.getItem(FEEDBACK_STORAGE_KEY);
        if (storedData) {
          const parsedData = JSON.parse(storedData);
          if (Array.isArray(parsedData)) {
            setStoredFeedbacks(parsedData);
            console.log("오류 발생 시 기존 데이터 로드:", parsedData.length);
          }
        }
      } catch (e) {
        console.error("오류 후 로컬 스토리지 로드 실패:", e);
      }
    } finally {
      setIsLoading(false);
    }
  };

  // 컴포넌트 마운트 시 데이터 가져오기
  useEffect(() => {
    fetchFeedbacks();
  }, []);

  // 로컬 스토리지에서 현재 팀 ID 가져오기
  let currentTeamId = null;
  try {
    currentTeamId = localStorage.getItem("currentTeamId");
  } catch (error) {
    console.warn("팀 ID 로드 실패:", error);
  }

  // 표시할 데이터 결정
  const filteredFeedbacks = currentTeamId
    ? storedFeedbacks.filter(
        (item) =>
          item &&
          item.meeting_id &&
          String(item.team_id) === String(currentTeamId)
      )
    : storedFeedbacks;

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

  // 에러 상태 UI
  if (error) {
    return (
      <div className="feedback-container">
        <div className="feedback-error">
          <p style={{ ...typography.Header3, color: color.Error[0] }}>
            {error}
          </p>
        </div>
      </div>
    );
  }

  // 데이터가 없는 경우 UI
  if (!Array.isArray(filteredFeedbacks) || filteredFeedbacks.length === 0) {
    return (
      <div className="no-feedback-container">
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

      const date = new Date(dateString);
      return date.toLocaleDateString("ko-KR", {
        year: "numeric",
        month: "long",
        day: "numeric",
      });
    } catch (error) {
      console.error("날짜 포맷팅 오류:", error);
      return "날짜 정보 없음";
    }
  };

  // UI 렌더링
  return (
    <div className="feedback-container" ref={containerRef}>
      {filteredFeedbacks.map((item, index) => {
        if (!item) return null;

        const meetingDate =
          (item.endTime && formatDate(item.endTime)) ||
          (endTime && formatDate(endTime)) ||
          formatDate(item.created_at) ||
          "날짜 정보 없음";

        const feedbackContent = item.feedback || "피드백 내용이 없습니다.";

        return (
          <div
            key={`feedback-${item.meeting_id || index}`}
            className="feedback-card"
          >
            <div className="feedback-header">
              <h3 style={{ ...typography.Header3 }}>{meetingDate} 회의</h3>
            </div>
            <div className="feedback-content">
              <div
                style={{ ...typography.Body1, color: color.GrayScale[4] }}
                className="markdown-content"
              >
                {typeof feedbackContent === "string" ? (
                  feedbackContent
                    .split("\n")
                    .map((line, lineIdx) => (
                      <p key={`line-${index}-${lineIdx}`}>{line}</p>
                    ))
                ) : (
                  <p>피드백 내용이 없습니다.</p>
                )}
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default Feedback;
