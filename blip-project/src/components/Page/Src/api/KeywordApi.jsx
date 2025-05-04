import axios from "axios";

//팀의 회의 요약 정보를 가져오는 API 호출 함수
const KeywordApi = async (targetId, meetingId = null) => {
  const apiUrl = import.meta.env.VITE_API_URL_BASE;

  // 로컬 스토리지에서 lastMeetingTeamId 가져오기
  const lastTeamId = localStorage.getItem("lastMeetingTeamId");

  // targetId가 유효하지 않으면 lastMeetingTeamId 사용
  const effectiveTeamId = lastTeamId || targetId;

  const keywordUrl = `${apiUrl}teams/${effectiveTeamId}`;

  // 로컬 스토리지에서 토큰 가져오기
  const accessToken = import.meta.env.VITE_API_URL_URL_KEY;

  console.log("회의 요약 API 호출 정보:", {
    originalTargetId: targetId,
    lastMeetingTeamId: lastTeamId,
    effectiveTeamId: effectiveTeamId,
    requestedMeetingId: meetingId,
    url: keywordUrl,
  });

  try {
    const response = await axios.get(keywordUrl, {
      headers: {
        "Content-Type": "application/json",
        Authorization: accessToken ? `Bearer ${accessToken.trim()}` : "",
      },
    });

    console.log("회의 요약 API 응답 성공:", response.data);

    // API 응답 구조 처리
    const responseData = response.data;
    let meetingsData = [];

    if (responseData?.meetings && Array.isArray(responseData.meetings)) {
      // 현재 시간을 endTime으로 설정
      const currentTime = new Date().toISOString();

      // meetings 배열에서 요약 데이터 추출하고 메타데이터 추가
      meetingsData = responseData.meetings.map((meeting) => ({
        meeting_id: meeting.meeting_id,
        summary: meeting.summary,
        team_id: responseData.team_id,
        team_name: responseData.team_name,
        endTime: meeting.endTime || currentTime,
        created_at: meeting.created_at || currentTime,
      }));
      console.log("meetingsData", meetingsData);

      // 특정 회의 ID가 요청된 경우 필터링
      if (meetingId) {
        meetingsData = meetingsData.filter(
          (meeting) => Number(meeting.meeting_id) === Number(meetingId)
        );
      }
    }
    console.log("meetingsData", meetingsData);
    
    return meetingsData;
  } catch (error) {
    console.error(
      "회의 요약 API 요청 실패:",
      error.response?.data || error.message
    );
    return []; // 오류 발생 시 빈 배열 반환
  }
};

export default KeywordApi;
