import React, { useState, useRef, useEffect, useCallback } from "react";
import RecordingService from "../../../../services/RecordingService"; // 경로는 실제 프로젝트 구조에 맞게 조정

const AudioRecordingTest = () => {
  // 상태 관리
  const [isRecording, setIsRecording] = useState(false);
  const [recordingDuration, setRecordingDuration] = useState(0);
  const [recordingBlob, setRecordingBlob] = useState(null);
  const [audioUrl, setAudioUrl] = useState(null);
  const [logs, setLogs] = useState([]);
  const [uploadedAudio, setUploadedAudio] = useState(null);
  const [useUploadedAudio, setUseUploadedAudio] = useState(false);

  // Refs
  const recorderRef = useRef(null);
  const timerRef = useRef(null);
  const testTeamId = "test-team-123";
  const mediaStreamRef = useRef(null);
  const fileInputRef = useRef(null);

  // 로그 추가 함수
  const addLog = useCallback((message) => {
    const timestamp = new Date().toLocaleTimeString();
    setLogs((prev) => [`${timestamp}: ${message}`, ...prev]);
  }, []);

  // 초기화
  useEffect(() => {
    if (!recorderRef.current) {
      recorderRef.current = new RecordingService();
      addLog("녹음 서비스 초기화 완료");
    }

    // 컴포넌트 정리
    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }

      if (mediaStreamRef.current) {
        mediaStreamRef.current.getTracks().forEach((track) => track.stop());
      }

      if (recorderRef.current) {
        recorderRef.current.dispose(testTeamId);
      }

      // 오디오 URL 해제
      if (audioUrl) {
        URL.revokeObjectURL(audioUrl);
      }
    };
  }, [addLog]);

  // 녹음 시작
  const startRecording = async () => {
    try {
      addLog("녹음 시작 준비...");
      setIsRecording(true);
      setRecordingDuration(0);

      // 이미 녹음된 블롭 정리
      if (recordingBlob) {
        setRecordingBlob(null);
      }

      if (audioUrl) {
        URL.revokeObjectURL(audioUrl);
        setAudioUrl(null);
      }

      // 업로드된 오디오 사용 시
      if (useUploadedAudio && uploadedAudio) {
        addLog("업로드된 오디오 파일 사용");
        // 업로드된 오디오로 녹음 시뮬레이션
        simulateRecordingWithFile(uploadedAudio);
        return;
      }

      // 마이크를 통한 녹음
      addLog("마이크 액세스 요청...");
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      mediaStreamRef.current = stream;

      addLog("녹음 서비스 설정...");
      await recorderRef.current.setupRecording(testTeamId, stream);

      addLog("녹음 시작!");
      await recorderRef.current.startRecording(testTeamId);

      // 리스너 설정
      recorderRef.current.addListener(testTeamId, handleRecordingComplete);

      // 타이머 시작
      const startTime = Date.now();
      timerRef.current = setInterval(() => {
        const elapsed = Math.floor((Date.now() - startTime) / 1000);
        setRecordingDuration(elapsed);

        // 1분마다 상태 기록
        if (elapsed % 60 === 0 && elapsed > 0) {
          const minutes = Math.floor(elapsed / 60);
          addLog(`${minutes}분 경과 - 녹음 중...`);
        }
      }, 1000);
    } catch (error) {
      addLog(`오류: ${error.message}`);
      setIsRecording(false);
      console.error("녹음 시작 오류:", error);
    }
  };

  // 녹음 중지
  const stopRecording = async () => {
    try {
      addLog("녹음 중지 중...");

      // 타이머 정지
      if (timerRef.current) {
        clearInterval(timerRef.current);
        timerRef.current = null;
      }

      // 스트림 정지
      if (mediaStreamRef.current) {
        mediaStreamRef.current.getTracks().forEach((track) => track.stop());
        mediaStreamRef.current = null;
      }

      // 녹음 중지
      if (recorderRef.current) {
        const blob = await recorderRef.current.stopRecording(testTeamId);
        recorderRef.current.removeListener(testTeamId, handleRecordingComplete);

        handleRecordingComplete(blob);
      }

      setIsRecording(false);
    } catch (error) {
      addLog(`오류: ${error.message}`);
      setIsRecording(false);
      console.error("녹음 중지 오류:", error);
    }
  };

  // 녹음 완료 핸들러
  const handleRecordingComplete = useCallback(
    (blob) => {
      if (!blob || blob.size === 0) {
        addLog("녹음 데이터가 없습니다.");
        return;
      }

      try {
        addLog(`녹음 완료: ${blob.size} 바이트`);
        setRecordingBlob(blob);

        // 오디오 URL 생성
        const url = URL.createObjectURL(blob);
        setAudioUrl(url);

        // 녹음 상태 정보 출력
        if (recorderRef.current) {
          const state = recorderRef.current.getRecordingState(testTeamId);
          addLog(
            `청크 수: ${state.chunkCount}, 총 기간: ${Math.floor(
              state.duration / 1000
            )}초`
          );
        }
      } catch (error) {
        addLog(`녹음 처리 오류: ${error.message}`);
        console.error("녹음 처리 오류:", error);
      }
    },
    [addLog]
  );

  // 파일 업로드 처리
  const handleFileUpload = (event) => {
    const file = event.target.files[0];
    if (!file) return;

    // 오디오 파일 타입 확인
    if (!file.type.startsWith("audio/")) {
      addLog("오디오 파일만 업로드할 수 있습니다.");
      return;
    }

    setUploadedAudio(file);
    setRecordingBlob(file); // 업로드된 파일을 recordingBlob으로 직접 설정
    addLog(`파일 업로드됨: ${file.name} (${(file.size / 1024).toFixed(2)} KB)`);

    // 업로드된 파일 미리 듣기
    const url = URL.createObjectURL(file);
    setAudioUrl(url);
  };

  // 업로드된 파일로 녹음 시뮬레이션
  const simulateRecordingWithFile = async (file) => {
    try {
      addLog(`업로드된 파일로 녹음 시뮬레이션: ${file.name}`);

      // 파일을 즉시 녹음 결과로 설정
      setRecordingBlob(file);

      // 타이머 시작 (파일 길이를 알 수 없으므로 10초 시뮬레이션)
      const startTime = Date.now();
      const simulatedDuration = 10; // 10초

      timerRef.current = setInterval(() => {
        const elapsed = Math.floor((Date.now() - startTime) / 1000);
        setRecordingDuration(elapsed);

        // 시뮬레이션 종료
        if (elapsed >= simulatedDuration) {
          addLog("시뮬레이션 녹음 완료");
          clearInterval(timerRef.current);
          setIsRecording(false);

          // 파일을 녹음 결과로 설정 (이미 위에서 설정함)
          handleRecordingComplete(file);
        }
      }, 1000);
    } catch (error) {
      addLog(`파일 시뮬레이션 오류: ${error.message}`);
      setIsRecording(false);
    }
  };

  // 녹음 데이터 다운로드
  const downloadRecording = () => {
    if (!recordingBlob) {
      addLog("다운로드할 녹음 파일이 없습니다.");
      return;
    }

    try {
      const url = URL.createObjectURL(recordingBlob);
      const a = document.createElement("a");
      a.style.display = "none";
      a.href = url;

      // 확장자 결정 (MIME 타입 기반)
      let extension = "mp3";
      if (recordingBlob.type) {
        if (recordingBlob.type.includes("webm")) extension = "webm";
        else if (recordingBlob.type.includes("wav")) extension = "wav";
        else if (recordingBlob.type.includes("ogg")) extension = "ogg";
      }

      a.download = `recording-${new Date().toISOString()}.${extension}`;
      document.body.appendChild(a);
      a.click();

      // 정리
      setTimeout(() => {
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
      }, 100);

      addLog("녹음 파일 다운로드 시작");
    } catch (error) {
      addLog(`다운로드 오류: ${error.message}`);
    }
  };

  // 회의 종료 API 테스트
  const testMeetingEndApi = async () => {
    let blobToTest = recordingBlob;

    // 녹음된 Blob이 없는데 업로드된 파일이 있는 경우
    if (!blobToTest && uploadedAudio) {
      blobToTest = uploadedAudio;
      addLog("업로드된 파일을 사용하여 API 테스트");
    }

    if (!blobToTest) {
      addLog("API 테스트를 위한 녹음 파일이 없습니다.");
      return;
    }

    try {
      addLog("회의 종료 API 테스트 시작...");
      addLog(
        `파일 크기: ${(blobToTest.size / 1024).toFixed(2)} KB, 타입: ${
          blobToTest.type
        }`
      );

      // 여기에 실제 API 호출 로직을 추가하세요
      // const result = await apiHandleMeetingEnd(
      //   testTeamId,
      //   '123', // 가상 회의 ID
      //   () => {}, // setMeetingId 함수
      //   null, // createTeamId
      //   testTeamId, // itemBackendId
      //   blobToTest
      // );

      // API 응답 시뮬레이션
      await new Promise((resolve) => setTimeout(resolve, 1500));

      addLog("API 테스트 완료 (시뮬레이션)");
      addLog(
        '서버 응답: { "success": true, "message": "회의가 성공적으로 종료되었습니다." }'
      );
      
    } catch (error) {
      addLog(`API 테스트 오류: ${error.message}`);
    }
  };

  return (
    <div
      style={{
        maxWidth: "800px",
        margin: "0 auto",
        padding: "20px",
        fontFamily: "Arial, sans-serif",
      }}
    >
      <h1>오디오 녹음 테스트</h1>

      <div
        style={{
          display: "flex",
          flexDirection: "column",
          gap: "20px",
        }}
      >
        {/* 파일 업로드 섹션 */}
        <div
          style={{
            padding: "20px",
            borderRadius: "8px",
            backgroundColor: "#f0f7ff",
            boxShadow: "0 2px 4px rgba(0,0,0,0.1)",
          }}
        >
          <h2>오디오 파일 업로드</h2>
          <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
            <input
              type="file"
              accept="audio/*"
              onChange={handleFileUpload}
              ref={fileInputRef}
              style={{ flex: 1 }}
            />
            <button
              onClick={() => fileInputRef.current?.click()}
              style={{
                padding: "8px 15px",
                backgroundColor: "#2196F3",
                color: "white",
                border: "none",
                borderRadius: "4px",
                cursor: "pointer",
              }}
            >
              파일 선택
            </button>
          </div>
          {uploadedAudio && (
            <div
              style={{
                marginTop: "10px",
                padding: "10px",
                backgroundColor: "#e3f2fd",
                borderRadius: "4px",
              }}
            >
              <div>
                <strong>파일명:</strong> {uploadedAudio.name}
              </div>
              <div>
                <strong>크기:</strong> {(uploadedAudio.size / 1024).toFixed(2)}{" "}
                KB
              </div>
              <div>
                <strong>타입:</strong> {uploadedAudio.type}
              </div>
            </div>
          )}
        </div>

        {/* 녹음 컨트롤 섹션 */}
        <div
          style={{
            padding: "20px",
            borderRadius: "8px",
            backgroundColor: "#f5f5f5",
            boxShadow: "0 2px 4px rgba(0,0,0,0.1)",
          }}
        >
          <h2>
            마이크 녹음{" "}
            {isRecording && <span style={{ color: "red" }}>● 녹음 중</span>}
          </h2>

          <div style={{ marginBottom: "20px" }}>
            <div
              style={{
                fontSize: "24px",
                fontWeight: "bold",
                marginBottom: "10px",
              }}
            >
              {Math.floor(recordingDuration / 60)}:
              {String(recordingDuration % 60).padStart(2, "0")}
            </div>

            <button
              onClick={isRecording ? stopRecording : startRecording}
              style={{
                padding: "10px 20px",
                backgroundColor: isRecording ? "#f44336" : "#4CAF50",
                color: "white",
                border: "none",
                borderRadius: "4px",
                cursor: "pointer",
                fontSize: "16px",
                marginRight: "10px",
              }}
            >
              {isRecording ? "녹음 중지" : "마이크 녹음 시작"}
            </button>

            {useUploadedAudio && uploadedAudio && (
              <span style={{ marginLeft: "10px", color: "#0288d1" }}>
                업로드된 파일 사용 중
              </span>
            )}
          </div>

          <div style={{ marginTop: "10px" }}>
            <label
              style={{
                display: "flex",
                alignItems: "center",
                gap: "8px",
                userSelect: "none",
                cursor: uploadedAudio ? "pointer" : "not-allowed",
                opacity: uploadedAudio ? 1 : 0.5,
              }}
            >
              <input
                type="checkbox"
                checked={useUploadedAudio}
                onChange={(e) => setUseUploadedAudio(e.target.checked)}
                disabled={!uploadedAudio}
              />
              녹음 시 업로드된 파일 사용
            </label>
          </div>
        </div>

        {/* 오디오 플레이어 */}
        <div
          style={{
            padding: "20px",
            borderRadius: "8px",
            backgroundColor: "#f5f5f5",
            boxShadow: "0 2px 4px rgba(0,0,0,0.1)",
          }}
        >
          <h2>오디오 플레이어</h2>
          {audioUrl ? (
            <>
              <audio
                controls
                src={audioUrl}
                style={{
                  width: "100%",
                  marginTop: "10px",
                  marginBottom: "10px",
                }}
              >
                브라우저가 오디오 재생을 지원하지 않습니다.
              </audio>

              <div style={{ display: "flex", gap: "10px" }}>
                <button
                  onClick={downloadRecording}
                  style={{
                    padding: "10px 20px",
                    backgroundColor: "#2196F3",
                    color: "white",
                    border: "none",
                    borderRadius: "4px",
                    cursor: "pointer",
                    fontSize: "16px",
                  }}
                >
                  다운로드
                </button>

                <button
                  onClick={testMeetingEndApi}
                  style={{
                    padding: "10px 20px",
                    backgroundColor: "#673AB7",
                    color: "white",
                    border: "none",
                    borderRadius: "4px",
                    cursor: "pointer",
                    fontSize: "16px",
                  }}
                >
                  회의 종료 API 테스트
                </button>
              </div>
            </>
          ) : (
            <p>녹음된 오디오나 업로드된 파일이 없습니다.</p>
          )}
        </div>

        {/* 로그 표시 영역 */}
        <div
          style={{
            padding: "20px",
            borderRadius: "8px",
            backgroundColor: "#f5f5f5",
            boxShadow: "0 2px 4px rgba(0,0,0,0.1)",
          }}
        >
          <h2>테스트 로그</h2>
          <div
            style={{
              height: "300px",
              overflow: "auto",
              border: "1px solid #ddd",
              borderRadius: "4px",
              padding: "10px",
              backgroundColor: "#f8f8f8",
              fontFamily: "monospace",
              fontSize: "14px",
            }}
          >
            {logs.length === 0 ? (
              <div style={{ color: "#999", fontStyle: "italic" }}>
                아직 로그가 없습니다.
              </div>
            ) : (
              logs.map((log, index) => (
                <div key={index} style={{ marginBottom: "4px" }}>
                  {log}
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AudioRecordingTest;
