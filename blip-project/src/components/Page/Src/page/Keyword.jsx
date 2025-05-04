import "../../../CSS/Keyword.css";
import { typography } from "../../../../fonts/fonts";
import { color } from "../../../../style/color";
import { useEffect, useState, useRef, useCallback } from "react";

const KEYWORD_STORAGE_KEY = "meeting_keywords";

//회의 요약 정보를 표시하는 컴포넌트
const Keyword = ({ Keywords = [], isLoading = false, endTime }) => {
  const [storedKeywords, setStoredKeywords] = useState([]);
  const containerRef = useRef(null);
  // 마지막으로 처리한 키워드 데이터를 추적하기 위한 ref
  const processedDataRef = useRef(null);
  const allTeamIds = Keywords.map((item) => item.team_id);

  // 디버깅을 위한 로그
  useEffect(() => {
    if (Keywords?.length > 0) {
      console.log("Keywords 업데이트:", Keywords);
      console.log("키워드 팀 ID 목록:", allTeamIds);
    }
    if (endTime) {
      console.log("endTime 업데이트:", endTime);
    }
  }, [Keywords, endTime, allTeamIds]);

  // 로컬 스토리지에서 키워드 데이터 로드 (마운트 시 한 번만)
  useEffect(() => {
    try {
      const storedData = localStorage.getItem(KEYWORD_STORAGE_KEY);
      const parsedData = storedData ? JSON.parse(storedData) : [];
      setStoredKeywords(parsedData);
      console.log(
        "로컬 스토리지에서 키워드 로드 완료:",
        parsedData.length,
        "항목"
      );
    } catch (error) {
      console.error("로컬 스토리지에서 키워드 로드 중 오류:", error);
      setStoredKeywords([]);
    }
  }, []);

  // 새 키워드 데이터 처리와 로컬 스토리지 업데이트
  useEffect(() => {
    // Keywords가 비어있거나 이전에 처리한 데이터와 동일하면 처리하지 않음
    if (
      !Keywords ||
      Keywords.length === 0 ||
      JSON.stringify(Keywords) === JSON.stringify(processedDataRef.current)
    ) {
      return;
    }

    // 현재 처리 중인 데이터 저장
    processedDataRef.current = [...Keywords];

    // 키워드 데이터 병합 로직
    const mergeKeywords = () => {
      // 로컬 스토리지에서 최신 데이터 가져오기
      try {
        const storedData = localStorage.getItem(KEYWORD_STORAGE_KEY);
        const currentStored = storedData ? JSON.parse(storedData) : [];

        // 새 데이터와 기존 데이터 병합
        const updatedKeywords = [...currentStored];
        let hasChanges = false;

        Keywords.forEach((newKeyword) => {
          // endTime 추가
          const meetingEndTime = newKeyword.endTime || endTime;
          const updatedKeyword = { ...newKeyword, endTime: meetingEndTime };

          const existingIndex = updatedKeywords.findIndex(
            (item) => item.meeting_id === newKeyword.meeting_id
          );

          if (existingIndex >= 0) {
            // 기존 항목 업데이트 (변경된 경우에만)
            if (
              JSON.stringify(updatedKeywords[existingIndex]) !==
              JSON.stringify(updatedKeyword)
            ) {
              updatedKeywords[existingIndex] = {
                ...updatedKeywords[existingIndex],
                ...updatedKeyword,
              };
              hasChanges = true;
            }
          } else {
            // 새 항목 추가
            updatedKeywords.push(updatedKeyword);
            hasChanges = true;
          }
        });

        // 변경사항이 있는 경우에만 로컬 스토리지 업데이트 및 상태 변경
        if (hasChanges) {
          localStorage.setItem(
            KEYWORD_STORAGE_KEY,
            JSON.stringify(updatedKeywords)
          );
          console.log(
            "키워드 데이터 저장 완료:",
            updatedKeywords.length,
            "항목"
          );
          setStoredKeywords(updatedKeywords);
        }
      } catch (error) {
        console.error("키워드 데이터 병합 중 오류:", error);
      }
    };

    // 데이터 병합 실행
    mergeKeywords();
  }, [Keywords, endTime]); // storedKeywords 의존성 제거

  // 로컬 스토리지에서 현재 팀 ID 가져오기
  const serializedData = localStorage.getItem("currentTeamId");
  console.log("현재 저장된 팀 ID:", serializedData);

  // 표시할 데이터 결정
  const displayKeywords = storedKeywords.length > 0 ? storedKeywords : Keywords;

  // serializedData(현재 팀 ID)와 일치하는 team_id를 가진 항목만 필터링
  const filteredKeywords = serializedData
    ? displayKeywords.filter(
        (item) =>
          item.team_id && String(item.team_id) === String(serializedData)
      )
    : displayKeywords;

  console.log("필터링 후 표시할 키워드 수:", filteredKeywords.length);

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
      return dateString.split("T")[0]; // ISO 포맷에서 날짜 부분만 추출
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

        // 날짜 포맷팅
        const meetingDate =
          (item.endTime && formatDate(item.endTime)) ||
          (endTime && formatDate(endTime)) ||
          formatDate(item.created_at) ||
          "날짜 정보 없음";

        // 요약 내용 처리
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
                {summaryContent.split("\n").map((line, lineIdx) => (
                  <p key={`line-${index}-${lineIdx}`}>{line}</p>
                ))}
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default Keyword;
