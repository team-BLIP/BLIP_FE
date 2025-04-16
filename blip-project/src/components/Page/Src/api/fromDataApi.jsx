import { Call } from "../../../../Router";
import { useContext } from "react";

const FromData = async (recordedChunks, setIsUploading, meetingEnd, setMeetingEnd, Owner) => {
  console.log("===== FromData 함수 시작 =====", new Date().toISOString());
  console.log("매개변수 확인 - recordedChunks:", recordedChunks ? "있음" : "없음");
  console.log("매개변수 확인 - meetingEnd:", meetingEnd);
  console.log("매개변수 확인 - Owner:", Owner);

  try {
    // meetingEnd가 false인 경우 상태 변경
    if (meetingEnd === false && typeof setMeetingEnd === 'function') {
      setMeetingEnd(true);
      console.log("meetingEnd 상태를 true로 변경");
    }

    // Owner가 아니면 처리 중단
    if (!Owner) {
      console.log("Owner가 아니므로 처리 중단");
      return { success: false, message: "Owner 권한이 없습니다" };
    }

    // recordedChunks가 없거나 비어있으면 처리 중단
    if (!recordedChunks || recordedChunks.length === 0) {
      console.log("녹음된 데이터가 없어서 처리 중단");
      return { success: false, message: "녹음된 데이터가 없습니다" };
    }

    // FormData 생성
    const blob = new Blob(recordedChunks, { type: "audio/webm" });
    const formData = new FormData();
    formData.append("file", blob, "recording.webm");
    console.log("FormData 생성 완료");

    // 업로드 상태 설정
    if (typeof setIsUploading === 'function') {
      setIsUploading(true);
      console.log("업로드 상태를 true로 설정");
    }

    console.log("서버에 녹음 데이터 업로드 시작");
    // 개발 중이므로 실제 URL 대신 임시 URL 사용
    const apiUrl = "http://3.38.233.219:8080/meetings/upload";
    
    // 서버 요청
    const response = await fetch(apiUrl, {
      method: "post",
      body: formData,
    });

    if (response.ok) {
      const data = await response.json();
      console.log("파일 업로드 성공:", data);
      return { success: true, data };
    } else {
      console.error("업로드 실패:", response.status, response.statusText);
      return { success: false, message: `업로드 실패: ${response.statusText}` };
    }
  } catch (error) {
    console.error("업로드 중 오류:", error.message);
    return { success: false, message: `업로드 중 오류: ${error.message}` };
  } finally {
    // 업로드 상태 초기화
    if (typeof setIsUploading === 'function') {
      setIsUploading(false);
      console.log("업로드 상태를 false로 설정");
    }
    console.log("===== FromData 함수 완료 =====", new Date().toISOString());
  }
};

// 원래 방식의 함수 (MeetingTeam.jsx에서 호출 시 사용)
const FromDataWrapper = () => {
  // 이 함수는 컴포넌트 내부에서 호출되어야 함
  console.warn("FromDataWrapper: 이 함수는 컴포넌트 내부에서만 호출해야 합니다");
  
  try {
    // 컨텍스트에서 필요한 값들을 가져옴
    const { recordedChunks, setIsUploading } = useContext(Call);
    
    // 테스트용 더미 데이터 (실제로는 컨텍스트에서 가져와야 함)
    const dummyMeetingEnd = true;
    const dummySetMeetingEnd = () => console.log("더미 setMeetingEnd 호출");
    const dummyOwner = true;
    
    // 실제 함수 호출
    return FromData(
      recordedChunks || [], 
      setIsUploading, 
      dummyMeetingEnd, 
      dummySetMeetingEnd, 
      dummyOwner
    );
  } catch (error) {
    console.error("FromDataWrapper 오류:", error);
    return Promise.reject(error);
  }
};

export default FromDataWrapper;
