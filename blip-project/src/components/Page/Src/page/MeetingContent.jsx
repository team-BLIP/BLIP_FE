import "../../../CSS/MeetingContent.css";
import { typography } from "../../../../fonts/fonts";
import { useContext, useEffect, useState } from "react";
import { TeamDel } from "../../Main/Main";
import { color } from "../../../../style/color";
import KeywordApi from "../api/KeywordApi";

const MeetingContent = () => {
  const { itemId } = useContext(TeamDel) || {};
  const [recentMeeting, setRecentMeeting] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchMeetingContent = async () => {
      // 팀 ID가 유효한지 확인
      if (!itemId) {
        setLoading(false);
        return;
      }

      // 현재 팀 ID 가져오기
      const currentTeamId = localStorage.getItem("currentTeamId");
      const teamId = currentTeamId || itemId;

      try {
        console.log("회의 요약 데이터 가져오기 시작 - 팀 ID:", teamId);
        const meetingsData = await KeywordApi(teamId);
        console.log("받은 회의 요약 데이터:", meetingsData);

        if (Array.isArray(meetingsData) && meetingsData.length > 0) {
          // 날짜 기준으로 정렬 (최신순)
          const sortedKeywords = [...meetingsData].sort((a, b) => {
            const dateA = new Date(a.endTime || a.created_at || 0);
            const dateB = new Date(b.endTime || b.created_at || 0);
            return dateB - dateA;
          });

          // 가장 최근 회의 요약 선택
          const mostRecent = sortedKeywords[0];
          console.log("가장 최근 회의 요약:", mostRecent);

          // 포맷에 맞게 데이터 변환
          setRecentMeeting({
            title: `${formatDate(
              mostRecent.endTime || mostRecent.created_at
            )} 회의`,
            date: mostRecent.endTime || mostRecent.created_at,
            summary: mostRecent.summary || "회의 요약 정보가 없습니다.",
            keywords: mostRecent.keywords || [],
          });
        }
      } catch (error) {
        console.error("회의 요약 로드 실패:", error);
        setError("회의 요약을 불러오는데 실패했습니다.");
      } finally {
        setLoading(false);
      }
    };

    fetchMeetingContent();
  }, [itemId]);

  // 날짜 포맷팅 함수
  const formatDate = (dateString) => {
    if (!dateString) return "날짜 정보 없음";

    try {
      const date = new Date(dateString);
      if (isNaN(date.getTime())) return dateString;

      return new Intl.DateTimeFormat("ko-KR", {
        year: "numeric",
        month: "long",
        day: "numeric",
      }).format(date);
    } catch (error) {
      console.error("날짜 포맷 오류:", error);
      return "날짜 정보 없음";
    }
  };

  return (
    <div className="meeting-content">
      {loading ? (
        <div className="meeting-content-main" style={typography.Header3}>
          회의 내용을 불러오는 중...
        </div>
      ) : error ? (
        <div className="meeting-content-main" style={typography.Header3}>
          {error}
        </div>
      ) : recentMeeting ? (
        <div className="meeting-content-main">
          <div
            style={{
              ...typography.Header3,
              backgroundColor: color.White,
              color: color.GrayScale[6],
            }}
          >
            {recentMeeting.title}
            <div
              style={{
                ...typography.Body2,
                backgroundColor: color.White,
              }}
            >
              {recentMeeting.summary}
              {recentMeeting.keywords && recentMeeting.keywords.length > 0 && (
                <div
                  className="meeting-keywords"
                  style={{
                    marginTop: "16px",
                    display: "flex",
                    flexWrap: "wrap",
                    gap: "8px",
                  }}
                >
                  {recentMeeting.keywords.map((keyword, index) => (
                    <span
                      key={index}
                      style={{
                        ...typography.Caption,
                        backgroundColor: color.White,
                        color: color.GrayScale[7],
                        padding: "4px 10px",
                        borderRadius: "16px",
                      }}
                    >
                      {keyword}
                    </span>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      ) : (
        <div className="meeting-content-main" style={typography.Header3}>
          아직 기록된 회의 내용이 없어요
        </div>
      )}
    </div>
  );
};

export default MeetingContent;
