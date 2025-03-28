import { Call } from "../../../../Router";
import { useContext } from "react";

const FromData = async () => {
  const { recordedChunks, setIsUploading } = useContext(Call);

  if (!meetingEnd) {
    setMeetingEnd((preState) => !preState);
  }

  if (!Owner) return;

  if (recordedChunks.length === 0) return;

  const blob = new Blob(recordedChunks, { type: "audio/webm" });
  const formData = new FormData();
  formData.append("file", blob, "recording.webm");

  try {
    setIsUploading(true);
    const response = await fetch("링크", {
      method: "post",
      body: formData,
    });

    if (response.ok) {
      console.log("파일 업로드 성공");
    } else {
      console.error("업로드 실패", response.statusText);
    }
  } catch (error) {
    console.log("업로드 중 에러");
  } finally {
    setIsUploading(false);
  }
};

export default FromData;
