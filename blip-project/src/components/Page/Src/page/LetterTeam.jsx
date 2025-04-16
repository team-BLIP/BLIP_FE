import "../../../CSS/LetterTeam.css";
import { typography } from "../../../../fonts/fonts";
import { color } from "../../../../style/color";
import { useContext, useEffect, useState } from "react";
import { TeamDel } from "../../Main/Main";
import { getSummaryApi } from "../../Src/api/summaryApi";

const Letter = () => {
  const [summaryData, setSummaryData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const { itemId } = useContext(TeamDel); // 팀 ID 컨텍스트에서 가져오기

  useEffect(() => {
    const fetchSummaryData = async () => {
      // 팀 ID가 없으면 요청하지 않음
      if (!itemId) {
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        const data = await getSummaryApi(itemId);
        setSummaryData(data);
        setError(null);
      } catch (err) {
        console.error("회의 요약 불러오기 실패:", err);
        setError("회의 요약을 불러오는데 실패했습니다.");
      } finally {
        setLoading(false);
      }
    };

    fetchSummaryData();
  }, [itemId]);

  // 로딩 중 표시
  if (loading) {
    return (
      <div className="Letter-p">
        <p style={{ ...typography.Body1, color: color.GrayScale[4] }}>
          회의 요약을 불러오는 중...
        </p>
      </div>
    );
  }

  // 에러 표시
  if (error) {
    return (
      <div className="Letter-p">
        <p style={{ ...typography.Body1, color: color.Error }}>{error}</p>
      </div>
    );
  }

  // 데이터가 없는 경우
  if (
    !summaryData ||
    !summaryData.meetings ||
    summaryData.meetings.length === 0
  ) {
    return (
      <div className="Letter-p">
        <p style={{ ...typography.Header3, color: color.GrayScale[4] }}>
          아직 받은 회의 일정 및 키워드 요약이 없어요.
        </p>
      </div>
    );
  }

  // 회의 요약 목록 표시
  return (
    <div className="Letter-container">
      <h2 style={{ ...typography.Header2, color: color.Main[4] }}>회의 요약</h2>
      <div className="meeting-summaries">
        {summaryData.meetings.map((meeting) => (
          <div key={meeting.meeting_id} className="meeting-summary-item">
            <h3 style={{ ...typography.Body1 }}>회의 #{meeting.meeting_id}</h3>
            <div className="summary-content" style={{ ...typography.Body2 }}>
              {meeting.summary}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Letter;
