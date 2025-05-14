import "../../../CSS/MeetingContent.css";
import { typography } from "../../../../fonts/fonts";
import { useContext, useEffect, useState, useRef } from "react";
import { TeamDel } from "../../Main/Main";
import { color } from "../../../../style/color";
import KeywordApi from "../api/KeywordApi";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

const MeetingContent = () => {
  const { itemId } = useContext(TeamDel) || {};
  const [recentMeeting, setRecentMeeting] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const contentRef = useRef(null);

  // WebKit 기반 브라우저를 위한 스크롤바 스타일링
  useEffect(() => {
    const style = document.createElement("style");
    style.textContent = `
      .meeting-content::-webkit-scrollbar {
        width: 1%;
      }
      .meeting-content::-webkit-scrollbar-track {
        background: transparent;
      }
      .meeting-content::-webkit-scrollbar-thumb {
        background-color: ${color.GrayScale[3]};
        border-radius: 0.5%;
      }
    `;
    document.head.appendChild(style);

    return () => {
      document.head.removeChild(style);
    };
  }, []);

  useEffect(() => {
    const fetchMeetingContent = async () => {
      if (!itemId) {
        setLoading(false);
        return;
      }

      const currentTeamId = localStorage.getItem("currentTeamId");
      const teamId = currentTeamId || itemId;

      try {
        console.log("회의 요약 데이터 가져오기 시작 - 팀 ID:", teamId);
        const meetingsData = await KeywordApi(teamId);
        console.log("받은 회의 요약 데이터:", meetingsData);

        if (Array.isArray(meetingsData) && meetingsData.length > 0) {
          const sortedKeywords = [...meetingsData].sort((a, b) => {
            const dateA = new Date(a.endTime || a.created_at || 0);
            const dateB = new Date(b.endTime || b.created_at || 0);
            return dateB - dateA;
          });

          const mostRecent = sortedKeywords[0];
          console.log("가장 최근 회의 요약:", mostRecent);

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

  const renderContent = () => {
    if (loading) {
      return <div style={typography.Header3}>회의 내용을 불러오는 중...</div>;
    }

    if (error) {
      return <div style={typography.Header3}>{error}</div>;
    }

    if (!recentMeeting) {
      return (
        <div style={typography.Header3}>아직 기록된 회의 내용이 없어요</div>
      );
    }

    return (
      <>
        <div
          className="meeting-content-title"
          style={{
            ...typography.Header3,
            color: color.GrayScale[6],
            marginBottom: "3%",
          }}
        >
          {recentMeeting.title}
        </div>

        <div className="meeting-content-summary" style={typography.Body2}>
          <ReactMarkdown
            remarkPlugins={[remarkGfm]}
            components={{
              p: ({ node, ...props }) => (
                <p style={{ margin: "2% 0" }} {...props} />
              ),
              h1: ({ node, ...props }) => (
                <h1
                  style={{ ...typography.Header2, margin: "4% 0 2%" }}
                  {...props}
                />
              ),
              h2: ({ node, ...props }) => (
                <h2
                  style={{ ...typography.Header3, margin: "3% 0 2%" }}
                  {...props}
                />
              ),
              h3: ({ node, ...props }) => (
                <h3
                  style={{ ...typography.Subtitle1, margin: "3% 0 2%" }}
                  {...props}
                />
              ),
              ul: ({ node, ...props }) => (
                <ul style={{ paddingLeft: "5%", margin: "2% 0" }} {...props} />
              ),
              ol: ({ node, ...props }) => (
                <ol style={{ paddingLeft: "5%", margin: "2% 0" }} {...props} />
              ),
              li: ({ node, ...props }) => (
                <li style={{ margin: "1% 0" }} {...props} />
              ),
              blockquote: ({ node, ...props }) => (
                <blockquote
                  style={{
                    borderLeft: `2% solid ${color.GrayScale[3]}`,
                    paddingLeft: "4%",
                    margin: "4% 0",
                    color: color.GrayScale[5],
                  }}
                  {...props}
                />
              ),
              code: ({ node, inline, ...props }) =>
                inline ? (
                  <code
                    style={{
                      backgroundColor: color.GrayScale[1],
                      padding: "0.5% 1%",
                      borderRadius: "1%",
                      fontFamily: "monospace",
                    }}
                    {...props}
                  />
                ) : (
                  <code
                    style={{
                      display: "block",
                      backgroundColor: color.GrayScale[1],
                      padding: "3%",
                      borderRadius: "2%",
                      fontFamily: "monospace",
                      overflowX: "auto",
                      margin: "3% 0",
                    }}
                    {...props}
                  />
                ),
            }}
          >
            {recentMeeting.summary}
          </ReactMarkdown>
        </div>

        {recentMeeting.keywords && recentMeeting.keywords.length > 0 && (
          <div
            className="meeting-keywords"
            style={{
              marginTop: "6%",
              display: "flex",
              flexWrap: "wrap",
              gap: "2%",
            }}
          >
            {recentMeeting.keywords.map((keyword, index) => (
              <span
                key={index}
                style={{
                  ...typography.Caption,
                  backgroundColor: color.GrayScale[1],
                  color: color.GrayScale[7],
                  padding: "1% 2.5%",
                  borderRadius: "5%",
                  display: "inline-block",
                  marginBottom: "2%",
                }}
              >
                #{keyword}
              </span>
            ))}
          </div>
        )}
      </>
    );
  };

  return (
    <div
      ref={contentRef}
      className="meeting-content"
      style={{
        height: "100%",
        maxHeight: "100%",
        overflowY: "auto",
        overflowX: "hidden",
        scrollbarWidth: "thin",
        scrollbarColor: `${color.GrayScale[3]} transparent`,
      }}
    >
      <div
        className="meeting-content-main"
        style={{
          padding: "5%",
          backgroundColor: color.White,
          minHeight: "90%",
        }}
      >
        {renderContent()}
      </div>
    </div>
  );
};

export default MeetingContent;
