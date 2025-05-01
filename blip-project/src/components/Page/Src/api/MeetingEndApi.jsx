import axios from "axios";

// 팀 ID를 정제하는 함수 추가
const cleanTeamId = (teamId) => {
  console.log("teamId", teamId);
  if (typeof teamId === "string" && teamId.includes("create-")) {
    const match = teamId.match(/create-(\d+)/);
    return match && match[1] ? match[1] : teamId;
  }
  return teamId;
};

const cleanMeetingId = (meetingId) => {
  console.log(meetingId);
  if (typeof meetingId === "object" && meetingId !== null) {
    console.log(
      "meetingId가 객체로 전달되었습니다. 이를 숫자 또는 문자열로 변환합니다."
    );
    return String(meetingId?.id || meetingId?.teamId || meetingId); // 기본 값이나 필요한 ID로 변환
  }
  return meetingId;
};

const handleMeetingEnd = async (
  teamId,
  meetingId,
  setMeetingId,
  createTeamId,
  itemBackendId,
  recordingBlob,
  endTime,
  setEndTime
) => {
  console.log("meetingId", meetingId);
  try {
    const cleanedMeetingId = cleanMeetingId(meetingId);
    console.log("정제된 meetingId:", meetingId);

    // 녹음 파일 검증 (이미 인자로 받은 recordingBlob 사용)
    if (!recordingBlob || recordingBlob.size === 0) {
      console.error("녹음 파일이 없어 회의를 종료할 수 없습니다.");
      return {
        success: false,
        error: "녹음 파일이 없어 회의를 종료할 수 없습니다.",
      };
    }

    console.log("회의 종료 시 녹음 Blob:", {
      blobExists: !!recordingBlob,
      blobSize: recordingBlob?.size,
      blobType: recordingBlob?.type,
    });

    // 유효한 팀 ID 결정
    const validTeamId = cleanTeamId(
      itemBackendId || createTeamId || teamId || 1
    );

    // 1. Presigned URL 요청
    const numericMeetingId = parseInt(meetingId, 10); // 10진수로 변환
    const fileName = `blip/audio/meeting_${numericMeetingId}.mp3`;
    const presignedUrl = await getPresignedUrl(fileName);
    console.log("meetingId", typeof meetingId);
    console.log("numericMeetingId", typeof numericMeetingId);

    // 2. S3에 파일 업로드
    await uploadFileToS3(presignedUrl, recordingBlob);
    // 3. 회의 종료 API 호출 (S3 URL 포함)
    const response = await callEndMeetingApi(cleanedMeetingId);
    console.log("회의 종료 성공", response);
    // 종료 시각을 props로 부모 컴포넌트로 전달
    setEndTime(new Date().toISOString()); // ISO 형식으로 저장

    return { success: true };
  } catch (error) {
    console.error("회의 종료 처리 중 오류:", error);
    return {
      success: false,
      error: error.message || "회의 종료 처리 중 오류가 발생했습니다.",
    };
  }
};

export { handleMeetingEnd };

// Presigned URL 요청 함수
const getPresignedUrl = async (fileName) => {
  console.log("fileName", fileName);
  try {
    const baseUrl = import.meta.env.VITE_API_URL_BASE.endsWith("/")
      ? import.meta.env.VITE_API_URL_BASE.slice(0, -1)
      : import.meta.env.VITE_API_URL_BASE;

    const accessToken = import.meta.env.VITE_API_URL_URL_KEY;

    const apiUrl = `${baseUrl}/files/presigned-url`;
    console.log("Presigned URL 요청 URL:", apiUrl);
    console.log("요청 파일명:", fileName);

    const response = await axios.get(apiUrl, {
      params: { fileName },
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    });

    console.log("Presigned URL 응답:", response.data);

    // 응답 형식에 따라 다르게 처리
    const presignedUrl = response.data.presignedUrl || response.data;

    if (!presignedUrl) {
      throw new Error("서버에서 유효한 Presigned URL을 반환하지 않았습니다.");
    }

    return presignedUrl;
  } catch (error) {
    console.error("Presigned URL 요청 상세 오류:", {
      message: error.message,
      response: error.response?.data,
      status: error.response?.status,
    });
    throw new Error("Presigned URL 요청에 실패했습니다.");
  }
};
// S3 업로드 함수
const uploadFileToS3 = async (presignedUrl, file) => {
  try {
    // Presigned URL 검증
    console.log("Presigned URL:", presignedUrl);
    console.log("File 정보:", {
      type: file.type,
      size: file.size,
    });

    // URL이 undefined나 null인 경우 체크
    if (!presignedUrl) {
      throw new Error("유효하지 않은 Presigned URL입니다.");
    }

    const response = await axios.put(presignedUrl, file, {
      headers: {
        "Content-Type": file.type || "audio/mpeg",
      },
    });

    console.log("S3 업로드 응답:", response);
    return response;
  } catch (error) {
    console.error("S3 업로드 상세 오류:", {
      message: error.message,
      response: error.response?.data,
      status: error.response?.status,
      url: error.config?.url,
    });
    throw new Error("S3 업로드에 실패했습니다.");
  }
};

const callEndMeetingApi = async (cleanedMeetingId, data = {}) => {
  console.log("cleanedMeetingId", typeof cleanedMeetingId);
  try {
    const apiUrl = `${
      import.meta.env.VITE_API_URL_URL_MEETINGS_END
    }${cleanedMeetingId}`;
    const accessToken = import.meta.env.VITE_API_URL_URL_KEY;

    console.log("회의 종료 API 호출 상세 정보:", {
      url: apiUrl,
      meetingId: cleanedMeetingId,
    });

    // 빈 객체({}) 대신 additionalData 사용
    const response = await axios.post(apiUrl, data, {
      headers: {
        Authorization: `Bearer ${accessToken}`,
        "Content-Type": "application/json",
      },
    });

    return response.data;
  } catch (error) {
    console.error("회의 종료 API 호출 상세 오류:", {
      message: error.message,
      response: error.response?.data,
      status: error.response?.status,
      config: {
        data: error.config?.data,
        headers: error.config?.headers,
      },
    });

    // 서버에서 반환된 구체적인 오류 메시지 활용
    const errorMessage =
      error.response?.data?.message ||
      error.response?.data?.error ||
      error.message ||
      "회의 종료 API 호출에 실패했습니다.";

    throw new Error(errorMessage);
  }
};

export default handleMeetingEnd;
