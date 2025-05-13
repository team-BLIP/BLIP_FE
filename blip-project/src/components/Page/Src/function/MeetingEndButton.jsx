import React, { useEffect, useState, useCallback } from "react";
import handleMeetingEnd, { cleanTeamId } from "../../services/MeetingEndApi";
import { useMeetingEnd } from "../../hooks/useMeetingEnd";

/**
 * 회의 종료 버튼 컴포넌트
 * 녹음 파일을 업로드하고 회의를 종료하는 버튼
 */
const MeetingEndButton = ({
  teamId,
  recordingBlob,
  onSuccess,
  onError,
  onProcessing,
  className = "",
  buttonText = "회의 종료",
  processingText = "종료 중...",
  disabled = false,
}) => {
  // 회의 종료 훅 사용
  const { isProcessing, result, error, endMeeting, reset } = useMeetingEnd();

  // 기본 상태 관리
  const [statusMessage, setStatusMessage] = useState("");

  // 회의 종료 처리 성공/실패 이펙트
  useEffect(() => {
    if (result) {
      setStatusMessage(
        result.meetingEndSuccess
          ? "회의가 성공적으로 종료되었습니다."
          : "녹음 파일은 업로드되었지만, 회의 종료 처리 중 오류가 발생했습니다."
      );

      if (typeof onSuccess === "function") {
        onSuccess(result);
      }
    } else if (error) {
      setStatusMessage(`회의 종료 중 오류가 발생했습니다: ${error.message}`);

      if (typeof onError === "function") {
        onError(error);
      }
    }
  }, [result, error, onSuccess, onError]);

  // 처리 중 상태 이펙트
  useEffect(() => {
    if (typeof onProcessing === "function") {
      onProcessing(isProcessing);
    }

    if (isProcessing) {
      setStatusMessage("회의 종료 처리 중입니다...");
    }
  }, [isProcessing, onProcessing]);

  // 회의 종료 핸들러
  const handleEndClick = useCallback(async () => {
    if (isProcessing || disabled) return;

    setStatusMessage("");
    reset();

    try {
      // 팀 ID 확인
      const cleanedTeamId = cleanTeamId(teamId);
      if (!cleanedTeamId) {
        setStatusMessage("유효한 팀 ID가 필요합니다.");
        return;
      }

      // 녹음 파일 확인
      if (
        !recordingBlob ||
        !(recordingBlob instanceof Blob) ||
        recordingBlob.size === 0
      ) {
        setStatusMessage("녹음 파일이 없어 회의를 종료할 수 없습니다.");
        return;
      }

      // 회의 종료 처리
      await endMeeting({
        teamId: cleanedTeamId,
        recordingBlob,
        skipApiOnError: true, // API 호출 실패해도 S3 업로드만 성공하면 성공으로 처리
      });
    } catch (err) {
      console.error("회의 종료 처리 오류:", err);
      setStatusMessage(`회의 종료 처리 중 오류가 발생했습니다: ${err.message}`);
    }
  }, [teamId, recordingBlob, isProcessing, disabled, endMeeting, reset]);

  return (
    <div className="meeting-end-button-container">
      <button
        className={`meeting-end-button ${className} ${
          isProcessing ? "processing" : ""
        }`}
        onClick={handleEndClick}
        disabled={isProcessing || disabled}
      >
        {isProcessing ? processingText : buttonText}
      </button>

      {statusMessage && (
        <div
          className={`status-message ${
            error ? "error" : result ? "success" : ""
          }`}
        >
          {statusMessage}
        </div>
      )}
    </div>
  );
};

export default MeetingEndButton;
