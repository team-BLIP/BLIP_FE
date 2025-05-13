/**
 * 회의 종료 처리를 위한 React 훅
 * 녹음 데이터 저장, S3 업로드, 회의 종료 API 호출 처리
 */
import { useState, useCallback, useRef } from "react";
import handleMeetingEnd, {
  uploadRecordingFile,
  callEndMeetingApi,
  retryUploadWithDelay,
  cleanTeamId,
} from "./MeetingEndApi";

/**
 * 회의 종료 처리를 위한 커스텀 훅
 * @returns {Object} 회의 종료 관련 상태 및 함수
 */
export const useMeetingEnd = () => {
  // 상태 관리
  const [isProcessing, setIsProcessing] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);

  // 재시도 카운트 및 중복 실행 방지용 refs
  const retryCountRef = useRef(0);
  const processingRef = useRef(false);

  /**
   * 회의 종료 처리 함수
   * @param {Object} params - 회의 종료 파라미터
   * @param {string|number} params.teamId - 팀 ID
   * @param {Blob} params.recordingBlob - 녹음 파일
   * @param {boolean} params.skipApiOnError - API 호출 에러 발생 시 건너뛰기 (기본값: false)
   */
  const endMeeting = useCallback(
    async ({ teamId, recordingBlob, skipApiOnError = false }) => {
      // 이미 처리 중인 경우 예외 처리
      if (processingRef.current) {
        console.warn("회의 종료가 이미 진행 중입니다.");
        return;
      }

      processingRef.current = true;
      setIsProcessing(true);
      setError(null);
      setResult(null);
      retryCountRef.current = 0;

      try {
        console.log("회의 종료 처리 시작:", {
          teamId,
          hasRecording: !!recordingBlob && recordingBlob.size > 0,
          recordingSize: recordingBlob?.size || 0,
        });

        // 정제된 팀 ID 얻기
        const cleanedId = cleanTeamId(teamId);
        if (!cleanedId) {
          throw new Error("유효한 팀 ID가 필요합니다.");
        }

        // 녹음 파일 확인
        if (
          !recordingBlob ||
          !(recordingBlob instanceof Blob) ||
          recordingBlob.size === 0
        ) {
          throw new Error("유효한 녹음 파일이 필요합니다.");
        }

        // 1. 일반적인 업로드 및 회의 종료 시도
        try {
          const endResult = await handleMeetingEnd(cleanedId, recordingBlob);
          console.log("회의 종료 성공:", endResult);
          setResult(endResult);
          return endResult;
        } catch (firstError) {
          console.warn("첫 번째 시도 실패:", firstError);

          // 2. 실패 시 5초 대기 후 2단계 재시도 (업로드와 API 호출 분리)
          retryCountRef.current++;
          console.log(`재시도 (${retryCountRef.current}/3) 진행 중...`);

          try {
            const retryResult = await retryUploadWithDelay(
              recordingBlob,
              cleanedId
            );
            console.log("재시도 성공:", retryResult);
            setResult(retryResult);
            return retryResult;
          } catch (retryError) {
            console.error("재시도 실패:", retryError);

            // 3. skipApiOnError가 true이고 S3 업로드만 성공했다면 성공으로 처리
            if (skipApiOnError) {
              try {
                // S3 업로드만 수행
                const separateResult = await handleSeparateActions({
                  action: "upload",
                  teamId: cleanedId,
                  file: recordingBlob,
                });

                if (separateResult.success) {
                  const finalResult = {
                    success: true,
                    fileName: separateResult.fileName,
                    meetingEndSuccess: false,
                    meetingEndSkipped: true,
                    message:
                      "녹음 파일은 성공적으로 업로드되었습니다. 회의 종료 API 호출은 건너뛰었습니다.",
                  };

                  console.log(
                    "S3 업로드 성공 (회의 종료 API 건너뜀):",
                    finalResult
                  );
                  setResult(finalResult);
                  return finalResult;
                }
              } catch (separateError) {
                console.error("분리 업로드 실패:", separateError);
                throw new Error(`최종 시도 실패: ${separateError.message}`);
              }
            }

            throw new Error(`재시도 실패: ${retryError.message}`);
          }
        }
      } catch (error) {
        console.error("회의 종료 처리 오류:", error);
        setError(error);
        throw error;
      } finally {
        processingRef.current = false;
        setIsProcessing(false);
      }
    },
    []
  );

  /**
   * 회의 종료 단계 분리 처리 함수
   * 회의 종료 API만 호출할 때 사용
   */
  const endMeetingApiOnly = useCallback(async (teamId) => {
    // 이미 처리 중인 경우 예외 처리
    if (processingRef.current) {
      console.warn("회의 종료가 이미 진행 중입니다.");
      return;
    }

    processingRef.current = true;
    setIsProcessing(true);
    setError(null);

    try {
      const cleanedId = cleanTeamId(teamId);
      if (!cleanedId) {
        throw new Error("유효한 팀 ID가 필요합니다.");
      }

      const apiResult = await callEndMeetingApi(cleanedId);
      setResult(apiResult);
      return apiResult;
    } catch (error) {
      console.error("회의 종료 API 호출 오류:", error);
      setError(error);
      throw error;
    } finally {
      processingRef.current = false;
      setIsProcessing(false);
    }
  }, []);

  /**
   * S3 업로드만 수행하는 함수
   */
  const uploadToS3Only = useCallback(async (teamId, recordingBlob) => {
    // 이미 처리 중인 경우 예외 처리
    if (processingRef.current) {
      console.warn("업로드가 이미 진행 중입니다.");
      return;
    }

    processingRef.current = true;
    setIsProcessing(true);
    setError(null);

    try {
      const cleanedId = cleanTeamId(teamId);
      if (!cleanedId) {
        throw new Error("유효한 팀 ID가 필요합니다.");
      }

      // 녹음 파일 확인
      if (
        !recordingBlob ||
        !(recordingBlob instanceof Blob) ||
        recordingBlob.size === 0
      ) {
        throw new Error("유효한 녹음 파일이 필요합니다.");
      }

      // S3 업로드만 수행
      const uploadResult = await handleSeparateActions({
        action: "upload",
        teamId: cleanedId,
        file: recordingBlob,
      });

      setResult(uploadResult);
      return uploadResult;
    } catch (error) {
      console.error("S3 업로드 오류:", error);
      setError(error);
      throw error;
    } finally {
      processingRef.current = false;
      setIsProcessing(false);
    }
  }, []);

  // 회의 종료 상태 및 함수 반환
  return {
    isProcessing,
    result,
    error,
    endMeeting,
    endMeetingApiOnly,
    uploadToS3Only,
    reset: useCallback(() => {
      setResult(null);
      setError(null);
      retryCountRef.current = 0;
    }, []),
  };
};

// MeetingEndAPI에서 handleSeparateActions 함수 가져오기 (생략된 부분)
const handleSeparateActions = async ({ action, teamId, file }) => {
  // MeetingEndApi.js에서 구현한 함수를 임포트해서 사용
  // 상단에 import { handleSeparateActions } from './MeetingEndApi'; 추가 필요
  if (typeof window.MeetingEndApi?.handleSeparateActions === "function") {
    return window.MeetingEndApi.handleSeparateActions({ action, teamId, file });
  }

  throw new Error("handleSeparateActions 함수를 찾을 수 없습니다.");
};

export default useMeetingEnd;
  