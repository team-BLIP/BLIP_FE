import "../../CSS/MeetingTeam.css";
import { color } from "../../../style/color";
import { typography } from "../../../fonts/fonts";
import { useState, useContext } from "react";
import { UseStateContext } from "../../../Router";
import { TeamDel } from "../Main/Main";
import { SidebarContext } from "../../../Router";
import { Call } from "../../../Router";
import ModalMeeting from "../Modal/ModalMeeting";
import MettingContent from "./page/MeetingContent";

const MeetingTeam = () => {
  const { discord, meetingEnd, setMeetingEnd } = useContext(UseStateContext);

  const { todos } = useContext(SidebarContext);

  const { Owner, itemId, join } = useContext(TeamDel);

  const { recordedChunks, setIsUploading } = useContext(Call);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const modalOpen = () => setIsModalOpen(true);
  const modalClose = () => setIsModalOpen(false);

  const uploadRecording = async () => {
    if (!meetingEnd) {
      setMeetingEnd((preState) => !preState);
      console.log("시발련련");
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

  const handleLeveMeeting = () => {
    if (Owner) {
      uploadRecording();
    }
    setMeetingEnd(true);
    console.log("회의 종료");
  };

  return (
    <>
      <div
        className="MeetingTeams"
        style={{
          "--gray-50": color.GrayScale[0],
          "--gray-400": color.GrayScale[4],
          "--black": color.Black,
        }}
      >
        <div className="MeetingTFont" style={{ ...typography.Body2 }}>
          지난 회의 내용 요약
        </div>
        <MettingContent />
      </div>
      {discord ? (
        <button
          className="MeetingTButton"
          onClick={handleLeveMeeting}
          style={{
            ...(meetingEnd
              ? {
                  ...typography.Title1,
                  backgroundColor: color.GrayScale[0],
                  color: color.GrayScale[4],
                }
              : {
                  ...typography.Title1,
                  backgroundColor: color.Main[4],
                  color: color.White,
                }),
          }}
        >
          {meetingEnd ? "회의 시작하기" : "회의 나가기"}
        </button>
      ) : !Owner && todos.length > 1 && !join && itemId != 0 ? (
        <button
          className="MeetingTButton"
          onClick={modalOpen}
          style={{
            ...typography.Title1,
            backgroundColor: color.Main[4],
            color: color.White,
          }}
        >
          회의 시작하기
        </button>
      ) : (
        <button
          className="MeetingTButton"
          style={{ ...typography.Title1, "--gray-50": color.GrayScale[0] }}
        >
          회의 참가하기
        </button>
      )}
      {isModalOpen && <ModalMeeting onClose={modalClose} />}
    </>
  );
};

export default MeetingTeam;
