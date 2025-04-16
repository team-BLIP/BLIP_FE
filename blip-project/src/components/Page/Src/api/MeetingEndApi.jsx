import axios from "axios";

//팀 ID를 정제하는 함수 (create-X 형식 처리)
const cleanTeamId = (teamId) => {
  if (typeof teamId === "string" && teamId.includes("create-")) {
    const match = teamId.match(/create-(\d+)/);
    return match && match[1] ? match[1] : teamId;
  }
  return teamId;
};

//Presigned URL 요청 함수
const getPresignedUrl = async (fileName) => {
  const apiUrl = `${import.meta.env.VITE_API_URL_BASE}files/presigned-url`;

  // 토큰 가져오기
  // const token = localStorage.getItem("accessToken");
  const token = import.meta.env.VITE_API_URL_URL_KEY;

  if (!token) {
    console.error("인증 토큰이 없습니다. 로그인이 필요합니다.");
    throw new Error("인증 토큰이 없습니다. 다시 로그인해주세요.");
  }

  try {
    // 파일명을 쿼리 파라미터로 전달
    const response = await axios.get(apiUrl, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
      params: {
        fileName: fileName,
      },
    });

    console.log("Presigned URL 요청 성공:", response.data);

    // 응답에서 presignedUrl 추출
    if (!response.data.presignedUrl) {
      throw new Error("서버가 유효한 Presigned URL을 반환하지 않았습니다.");
    }

    return response.data.presignedUrl;
  } catch (error) {
    console.error("Presigned URL 요청 실패:", error);

    if (error.response) {
      console.error("서버 응답 상태:", error.response.status);
      console.error("서버 응답 데이터:", error.response.data);
    }

    throw new Error("Presigned URL 요청에 실패했습니다.");
  }
};

//S3에 파일 업로드하는 함수
const uploadFileToS3 = async (presignedUrl, file) => {
  if (!file || !(file instanceof Blob)) {
    console.error("유효한 파일이 아닙니다:", file);
    throw new Error("업로드할 유효한 파일이 없습니다.");
  }

  try {
    const response = await axios.put(presignedUrl, file, {
      headers: {
        "Content-Type": file.type || "audio/webm",
      },
    });
    console.log("S3 업로드 성공:", response.status);
    return true;
  } catch (error) {
    console.error("S3 업로드 실패:", error);
    throw new Error("S3 업로드에 실패했습니다.");
  }
};

//회의 종료 API 호출 함수
const callEndMeetingApi = async (teamId) => {
  // 팀 ID 정제
  const cleanedTeamId = cleanTeamId(teamId);

  if (!cleanedTeamId) {
    throw new Error("유효한 팀 ID가 제공되지 않았습니다.");
  }

  // 토큰 가져오기
  // const token = localStorage.getItem("accessToken");
  const token = import.meta.env.VITE_API_URL_URL_KEY;

  if (!token) {
    console.error("인증 토큰이 없습니다. 로그인이 필요합니다.");
    throw new Error("인증 토큰이 없습니다. 다시 로그인해주세요.");
  }

  const apiUrl = `${
    import.meta.env.VITE_API_URL_BASE || "http://3.38.233.219:8080/"
  }meetings/end/${cleanedTeamId}`;

  console.log("회의 종료 API 호출:", apiUrl);

  try {
    // 빈 객체로 POST 요청
    const response = await axios.post(
      apiUrl,
      {},
      {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      }
    );
    console.log("회의 종료 성공:", response.data);
    return response.data;
  } catch (error) {
    console.error("회의 종료 API 호출 실패:", error);

    if (error.response) {
      console.error("서버 응답 상태:", error.response.status);
      console.error("서버 응답 데이터:", error.response.data);
    }

    throw new Error("회의 종료 API 호출에 실패했습니다.");
  }
};

//전체 회의 종료 처리 함수
const handleMeetingEnd = async (
  meetingId,
  teamId,
  setMeetingId,
  createTeamId,
  itemBackendId,
  recordingBlob
) => {
  try {
    // 유효한 팀 ID 결정
    const validTeamId = cleanTeamId(
      itemBackendId || createTeamId || teamId || 1
    );

    console.log("처리 중인 팀 ID:", validTeamId);
    console.log("녹음 데이터 확인:", recordingBlob ? "있음" : "없음");

    let result = { success: true };

    // 녹음 파일이 있는 경우만 S3 업로드 처리
    if (recordingBlob && recordingBlob.size > 0) {
      const fileName = `blip/audio/${validTeamId}`;

      // 1. Presigned URL 요청
      console.log("Presigned URL 요청 중...");
      const presignedUrl = await getPresignedUrl(fileName);
      console.log("Presigned URL 획득 성공:", presignedUrl);

      // 2. S3에 녹음 파일 업로드
      console.log("S3 업로드 시작...");
      await uploadFileToS3(presignedUrl, recordingBlob);
      console.log("S3 업로드 성공");
    } else {
      console.log("업로드할 녹음 파일이 없습니다.");
    }

    // 3. 회의 종료 API 호출
    console.log("회의 종료 API 호출 중...");
    await callEndMeetingApi(validTeamId);
    console.log("회의 종료 API 호출 성공");

    // 4. 회의 ID 상태 업데이트 (필요한 경우)
    if (setMeetingId) {
      setMeetingId(null);
    }

    return result;
  } catch (error) {
    console.error("회의 종료 처리 중 오류 발생:", error);
    return {
      success: false,
      error: error.message || "회의 종료 처리 중 오류가 발생했습니다.",
    };
  }
};

// 이전 handleMeetingEnd 함수 별칭 (호환성 유지)
const apiHandleMeetingEnd = handleMeetingEnd;

// 함수 내보내기
export {
  getPresignedUrl,
  uploadFileToS3,
  callEndMeetingApi,
  handleMeetingEnd,
  apiHandleMeetingEnd,
};
