import "../../../CSS/Keyword.css";
import { typography } from "../../../../fonts/fonts";
import { color } from "../../../../style/color";
import { useEffect, useState, useRef } from "react";
import KeywordApi from "../api/KeywordApi";

const KEYWORD_STORAGE_KEY = "meeting_keywords";

// 회의 요약 정보를 표시하는 컴포넌트
const Keyword = ({ isLoading: initialLoading = false, endTime }) => {
  const [storedKeywords, setStoredKeywords] = useState([]);
  const [isLoading, setIsLoading] = useState(initialLoading);
  const [error, setError] = useState(null);
  const containerRef = useRef(null);
  const processedDataRef = useRef(null);

  // 키워드 데이터 가져오기
  const fetchKeywords = async () => {
    try {
      setIsLoading(true);
      setError(null);

      // 현재 팀 ID 가져오기
      const currentTeamId = localStorage.getItem("currentTeamId");
      if (!currentTeamId) {
        console.warn("현재 팀 ID를 찾을 수 없습니다.");
        return;
      }

      // KeywordApi 호출
      console.log("KeywordApi 호출 시작 - 팀 ID:", currentTeamId);
      const meetingsData = await KeywordApi(currentTeamId);
      console.log("KeywordApi 응답:", meetingsData);

      if (Array.isArray(meetingsData) && meetingsData.length > 0) {
        // 로컬 스토리지에 저장
        localStorage.setItem(KEYWORD_STORAGE_KEY, JSON.stringify(meetingsData));
        setStoredKeywords(meetingsData);
      }
    } catch (error) {
      console.error("키워드 데이터 가져오기 실패:", error);
      setError("회의 요약 정보를 가져오는데 실패했습니다.");
    } finally {
      setIsLoading(false);
    }
  };

  // 컴포넌트 마운트 시 데이터 가져오기
  useEffect(() => {
    fetchKeywords();
  }, []);

  // 로컬 스토리지에서 현재 팀 ID 가져오기
  let currentTeamId = null;
  try {
    currentTeamId = localStorage.getItem("currentTeamId");
  } catch (error) {
    console.warn("팀 ID 로드 실패:", error);
  }

  // 표시할 데이터 결정
  const filteredKeywords = currentTeamId
    ? storedKeywords.filter(
        (item) =>
          item &&
          item.team_id &&
          String(item.team_id) === String(currentTeamId)
      )
    : storedKeywords;

  // 로딩 상태 UI
  if (isLoading) {
    return (
      <div className="keyword-container">
        <div className="keyword-loading">
          <p style={{ ...typography.Header3, color: color.GrayScale[4] }}>
            회의 요약을 불러오는 중...
          </p>
        </div>
      </div>
    );
  }

  // 에러 상태 UI
  if (error) {
    return (
      <div className="keyword-container">
        <div className="keyword-error">
          <p style={{ ...typography.Header3, color: color.Error[0] }}>
            {error}
          </p>
        </div>
      </div>
    );
  }

  // 데이터가 없는 경우 UI
  if (!Array.isArray(filteredKeywords) || filteredKeywords.length === 0) {
    return (
      <div className="keyword-container">
        <div className="keyword-empty">
          <p style={{ ...typography.Header3, color: color.GrayScale[4] }}>
            회의 요약 정보가 없습니다.
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

      const datePart = dateString.split("T")[0];
      if (datePart && datePart.match(/^\d{4}-\d{2}-\d{2}$/)) {
        return datePart;
      }

      return "날짜 정보 없음";
    } catch (error) {
      console.error("날짜 포맷팅 오류:", error);
      return "날짜 정보 없음";
    }
  };

  // UI 렌더링
  return (
    <div className="keyword-container" ref={containerRef}>
      {filteredKeywords.map((item, index) => {
        if (!item) return null;

        const meetingDate =
          (item.endTime && formatDate(item.endTime)) ||
          (endTime && formatDate(endTime)) ||
          formatDate(item.created_at) ||
          "날짜 정보 없음";

        const summaryContent = item.summary || "회의 요약 정보가 없습니다.";

        return (
          <div
            key={`keyword-${item.meeting_id || index}`}
            className="keyword-card"
          >
            <div className="keyword-header">
              <h3 style={{ ...typography.Header3 }}>{meetingDate} 회의</h3>
            </div>
            <div className="keyword-content">
              <div
                style={{ ...typography.Body1, color: color.GrayScale[4] }}
                className="markdown-content"
              >
                {typeof summaryContent === "string" ? (
                  summaryContent
                    .split("\n")
                    .map((line, lineIdx) => (
                      <p key={`line-${index}-${lineIdx}`}>{line}</p>
                    ))
                ) : (
                  <p>회의 요약 정보가 없습니다.</p>
                )}
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default Keyword;
