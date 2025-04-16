import axios from "axios";

// Presigned URL 요청 함수
const getPresignedUrl = async (fileName) => {
  try {
    const apiUrl = `${import.meta.env.VITE_API_URL_BASE}/generate-presigned-url`;
    const response = await axios.get(apiUrl, {
      params: {
        fileName, // 요청할 파일 이름
      },
      headers: {
        Authorization: `Bearer ${import.meta.env.VITE_API_URL_URL_KEY}`,
      },
    });

    // Presigned URL 반환
    return response.data.presignedUrl;
  } catch (error) {
    console.error("Presigned URL 요청 실패:", error);
    throw new Error("Presigned URL 요청에 실패했습니다.");
  }
};

// S3에 파일 업로드 함수
const uploadFileToS3 = async (presignedUrl, file) => {
  try {
    // S3 업로드 요청
    const response = await axios.put(presignedUrl, file, {
      headers: {
        "Content-Type": file.type, // 파일 타입 지정
      },
    });

    console.log("S3 업로드 성공:", response.status);
    return true;
  } catch (error) {
    console.error("S3 업로드 실패:", error);
    throw new Error("S3 업로드에 실패했습니다.");
  }
};

// 메인 함수: 파일 업로드 프로세스
const uploadRecordingFile = async (file) => {
  const fileName = `blip/audio/${file.name}`; // S3에 저장할 파일 경로 및 이름
  try {
    // 1. Presigned URL 요청
    const presignedUrl = await getPresignedUrl(fileName);
    console.log("Presigned URL:", presignedUrl);

    // 2. S3에 파일 업로드
    const uploadSuccess = await uploadFileToS3(presignedUrl, file);

    if (uploadSuccess) {
      console.log("파일 업로드 완료");
      return { success: true, fileName };
    }
  } catch (error) {
    console.error("파일 업로드 중 에러:", error);
    return { success: false, error: error.message };
  }
};

export default uploadRecordingFile;
