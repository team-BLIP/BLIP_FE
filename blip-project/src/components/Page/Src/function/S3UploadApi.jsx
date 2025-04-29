import axios from "axios";

// Presigned URL 요청 함수 수정
const getPresignedUrl = async (fileName) => {
  try {
    const baseUrl = import.meta.env.VITE_API_URL_BASE.endsWith("/")
      ? import.meta.env.VITE_API_URL_BASE.slice(0, -1)
      : import.meta.env.VITE_API_URL_BASE;

    const apiUrl = `${baseUrl}/files/presigned-url`;
    const response = await axios.get(apiUrl, {
      params: {
        fileName, // 요청할 파일 이름
      },
      headers: {
        Authorization: `Bearer ${import.meta.env.VITE_API_URL_URL_KEY}`,
      },
    });

    console.log("Presigned URL 응답:", response.data);

    // 응답 구조 확인 및 처리
    if (typeof response.data === "string") {
      // 응답이 직접 URL 문자열인 경우
      return response.data;
    } else if (response.data && response.data.presignedUrl) {
      // 응답이 객체이고 presignedUrl 속성이 있는 경우
      return response.data.presignedUrl;
    } else {
      // 유효한 URL을 찾을 수 없는 경우
      throw new Error("서버 응답에서 유효한 Presigned URL을 찾을 수 없습니다.");
    }
  } catch (error) {
    console.error("Presigned URL 요청 실패:", error);
    throw new Error("Presigned URL 요청에 실패했습니다.");
  }
};

// S3에 파일 업로드 함수
const uploadFileToS3 = async (presignedUrl, file) => {
  try {
    console.log("S3 업로드 시작...");
    const response = await axios.put(presignedUrl, file, {
      headers: {
        "Content-Type": file.type || "audio/webm",
      },
    });
    console.log("S3 업로드 성공:", response.status);
    return true;
  } catch (error) {
    console.error("S3 업로드 실패:", error);
    if (error.response) {
      console.error("S3 응답 상태:", error.response.status);
      console.error("S3 응답 데이터:", error.response.data);
    }
    throw new Error("S3 업로드에 실패했습니다.");
  }
};

// 전체 업로드 프로세스 수정
const uploadRecordingFile = async (file, teamId) => {
  // 팀 ID 확인
  if (!teamId) {
    console.error("유효한 팀 ID가 필요합니다.");
    return { success: false, error: "유효한 팀 ID가 필요합니다." };
  }

  // 파일 확인
  if (!file || file.size === 0) {
    console.error("업로드할 유효한 녹음 파일이 필요합니다.");
    return {
      success: false,
      error:
        "업로드할 유효한 녹음 파일이 필요합니다. 녹음 파일 없이는 회의를 종료할 수 없습니다.",
    };
  }

  const fileName = `blip/audio/${teamId}`;

  try {
    console.log("파일 업로드 시작:", fileName);

    // 1. Presigned URL 요청
    const presignedUrl = await getPresignedUrl(fileName);
    console.log("Presigned URL 획득:", presignedUrl);

    // 2. S3에 파일 업로드
    await uploadFileToS3(presignedUrl, file);
    console.log("S3 업로드 완료");

    // 3. 파일 업로드 성공 후 회의 종료 API 호출
    try {
      const baseUrl = import.meta.env.VITE_API_URL_BASE.endsWith("/")
        ? import.meta.env.VITE_API_URL_BASE.slice(0, -1)
        : import.meta.env.VITE_API_URL_BASE;

      const meetingEndUrl = `${baseUrl}/meetings/end/${teamId}`;

      const response = await axios.post(
        meetingEndUrl,
        {},
        {
          headers: {
            Authorization: `Bearer ${import.meta.env.VITE_API_URL_URL_KEY}`,
            "Content-Type": "application/json",
          },
          timeout: 10000, // 10초 타임아웃 설정
        }
      );

      console.log("회의 종료 API 호출 성공", response.data);
      return { success: true, fileName, meetingEndSuccess: true };
    } catch (endError) {
      console.error("회의 종료 API 호출 실패:", endError);
      // 파일 업로드는 성공했지만 회의 종료 API가 실패한 경우
      return {
        success: true,
        fileName,
        meetingEndSuccess: false,
        meetingEndError: endError.message,
      };
    }
  } catch (error) {
    console.error("파일 업로드 프로세스 실패:", error);
    return { success: false, error: error.message };
  }
};

// 파일 유효성 검사 헬퍼 함수
const isValidRecordingFile = (file) => {
  return (
    file &&
    file instanceof Blob &&
    file.size > 0 &&
    (file.type === "audio/webm" ||
      file.type === "audio/mpeg" ||
      file.type.startsWith("audio/"))
  );
};

export {
  getPresignedUrl,
  uploadFileToS3,
  uploadRecordingFile,
  isValidRecordingFile,
};
