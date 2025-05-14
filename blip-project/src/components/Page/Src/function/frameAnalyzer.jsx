import { useState, useRef, useCallback, useEffect } from "react";
import DiscordApi from "../api/discordApi";

//비디오 프레임 분석을 위한 커스텀 훅
export const useFrameAnalyzer = ({
  videoRef,
  isActive = false,
  teamId,
  accessToken,
  analysisInterval = 10000,
}) => {
  const [isAlarmActive, setIsAlarmActive] = useState(false);
  const [lastAnalysisTime, setLastAnalysisTime] = useState(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analyzerError, setAnalyzerError] = useState(null);
  const [isConnected, setIsConnected] = useState(false);
  const analyzerIntervalRef = useRef(null);
  const alarmTimeoutRef = useRef(null);
  const consecutiveErrorsRef = useRef(0);
  const maxConsecutiveErrors = 3;
  const analyzingTimeoutRef = useRef(null);

  // 분석 간격 동적 관리 (오류 발생 시 늘리고, 성공 시 원래대로)
  const currentIntervalRef = useRef(analysisInterval);
  const processingRef = useRef(false); // 진행 중인 분석 요청 추적

  // WebSocket 연결 설정
  useEffect(() => {
    // WebSocket 콜백 설정
    DiscordApi.setCallbacks({
      onOpen: () => {
        console.log("WebSocket 연결 수립됨");
        setIsConnected(true);
        setAnalyzerError(null);
        consecutiveErrorsRef.current = 0;
      },
      onClose: () => {
        console.log("WebSocket 연결 종료됨");
        setIsConnected(false);
      },
      onError: (error) => {
        console.error("WebSocket 에러:", error);
        setAnalyzerError(new Error("WebSocket 연결 오류"));
        setIsConnected(false);
      },
      onMessage: (data) => {
        // 전역 메시지 핸들러
        console.log("WebSocket 메시지 수신:", data);
      },
    });

    // 초기 연결 시도
    if (isActive) {
      DiscordApi.setupWebSocket()
        .then((connected) => {
          setIsConnected(connected);
          if (!connected) {
            setAnalyzerError(new Error("초기 WebSocket 연결 실패"));
          }
        })
        .catch((error) => {
          console.error("WebSocket 초기화 오류:", error);
          setAnalyzerError(error);
        });
    }

    // 컴포넌트 언마운트 시 연결 종료
    return () => {
      DiscordApi.closeWebSocket();
      if (analyzerIntervalRef.current) {
        clearInterval(analyzerIntervalRef.current);
        analyzerIntervalRef.current = null;
      }
      if (alarmTimeoutRef.current) {
        clearTimeout(alarmTimeoutRef.current);
        alarmTimeoutRef.current = null;
      }
      if (analyzingTimeoutRef.current) {
        clearTimeout(analyzingTimeoutRef.current);
        analyzingTimeoutRef.current = null;
      }
    };
  }, [isActive]);

  // 알람 자동 해제 타이머 설정
  const setupAlarmTimer = useCallback(
    (duration = 10000) => {
      // 기존 타이머 제거
      if (alarmTimeoutRef.current) {
        clearTimeout(alarmTimeoutRef.current);
      }

      // 새 타이머 설정
      alarmTimeoutRef.current = setTimeout(() => {
        if (isAlarmActive) {
          console.log(`${duration / 1000}초 후 알람 자동 해제`);
          setIsAlarmActive(false);
        }
      }, duration);
    },
    [isAlarmActive]
  );

  // 자동 재시도 로직
  const retryAfterDelay = useCallback(
    (lastError) => {
      consecutiveErrorsRef.current++;

      // 연속 오류 횟수에 따라 지수 백오프로 지연 증가
      const delay = Math.min(
        1000 * Math.pow(1.5, consecutiveErrorsRef.current),
        10000
      );

      console.log(
        `${delay}ms 후 프레임 분석 재시도 예정 (오류 ${consecutiveErrorsRef.current}/${maxConsecutiveErrors})`
      );

      // 분석 간격 증가 (최대 10초까지)
      currentIntervalRef.current = Math.min(analysisInterval * 1.5, 10000);

      // 분석 상태 재설정
      processingRef.current = false;
      setIsAnalyzing(false);

      // 최대 오류 횟수 초과 시 분석 중지
      if (consecutiveErrorsRef.current >= maxConsecutiveErrors) {
        console.error(`연속 ${maxConsecutiveErrors}회 오류 발생. 분석 중지`);
        stopAnalysis();
        setAnalyzerError(
          new Error(
            `연속 ${maxConsecutiveErrors}회 오류로 분석이 중지되었습니다`
          )
        );
        return;
      }

      // 지정된 지연 후 WebSocket 재연결 및 분석 재시도
      setTimeout(() => {
        if (isActive) {
          DiscordApi.setupWebSocket().then(() => {
            // 연속 오류가 없으면 간격 초기화
            if (consecutiveErrorsRef.current === 0) {
              currentIntervalRef.current = analysisInterval;
            }
          });
        }
      }, delay);
    },
    [isActive, analysisInterval]
  );

  // 비디오 프레임 분석 함수
  const analyzeCurrentFrame = useCallback(async () => {
    // 분석 조건 확인
    if (!isActive || !videoRef.current || !videoRef.current.srcObject) {
      return { result: false };
    }

    // 이미 분석 중인 경우 건너뜀
    if (processingRef.current) {
      console.log("이미 분석 중입니다. 요청 건너뜀");
      return { result: false };
    }

    // 분석 상태 설정
    processingRef.current = true;
    setIsAnalyzing(true);

    // 분석 타임아웃 설정 (안전장치)
    if (analyzingTimeoutRef.current) {
      clearTimeout(analyzingTimeoutRef.current);
    }

    // 7초 후에도 분석이 끝나지 않으면 강제로 상태 초기화
    analyzingTimeoutRef.current = setTimeout(() => {
      if (processingRef.current) {
        console.warn("분석 프로세스 타임아웃. 상태 초기화");
        processingRef.current = false;
        setIsAnalyzing(false);
      }
    }, 7000);

    try {
      // 웹소켓 연결 확인
      if (!isConnected) {
        const connected = await DiscordApi.setupWebSocket();
        if (!connected) {
          throw new Error("프레임 분석을 위한 WebSocket 연결 실패");
        }
        setIsConnected(true);
      }

      // 비디오 프레임 캡처
      const imageData = DiscordApi.captureVideoFrame(videoRef.current);
      if (!imageData) {
        console.warn("비디오 프레임 캡처 실패, 다음 시도에서 재시도합니다");
        processingRef.current = false;
        setIsAnalyzing(false);
        if (analyzingTimeoutRef.current) {
          clearTimeout(analyzingTimeoutRef.current);
          analyzingTimeoutRef.current = null;
        }
        return { result: false };
      }

      // API 요청 및 결과 처리
      const result = await DiscordApi.analyzeFrame(teamId, imageData);

      // 분석 결과 처리
      console.log("분석 결과:", result);
      setLastAnalysisTime(new Date());

      // 성공적인 분석 후 연속 오류 카운트 및 간격 초기화
      consecutiveErrorsRef.current = 0;
      currentIntervalRef.current = analysisInterval;

      // 알람 상태 업데이트
      if (result && result.result === true) {
        if (!isAlarmActive) {
          console.log("알람 활성화됨");
          setIsAlarmActive(true);
          setupAlarmTimer();
        }
      }

      setAnalyzerError(null);

      // 분석 상태 초기화
      processingRef.current = false;
      setIsAnalyzing(false);
      if (analyzingTimeoutRef.current) {
        clearTimeout(analyzingTimeoutRef.current);
        analyzingTimeoutRef.current = null;
      }

      return result;
    } catch (error) {
      console.error("프레임 분석 오류:", error);
      setAnalyzerError(error);

      // 분석 상태 초기화
      processingRef.current = false;
      setIsAnalyzing(false);
      if (analyzingTimeoutRef.current) {
        clearTimeout(analyzingTimeoutRef.current);
        analyzingTimeoutRef.current = null;
      }

      // 오류 후 재시도 로직
      retryAfterDelay(error);

      return { result: false };
    }
  }, [
    isActive,
    videoRef,
    teamId,
    isConnected,
    isAlarmActive,
    analysisInterval,
    setupAlarmTimer,
    retryAfterDelay,
  ]);

  // 분석 시작 함수
  const startAnalysis = useCallback(() => {
    // 이미 실행 중인 경우 중복 실행 방지
    if (analyzerIntervalRef.current) {
      console.log("이미 분석이 실행 중입니다");
      return;
    }

    // 기존 오류 및 상태 초기화
    consecutiveErrorsRef.current = 0;
    currentIntervalRef.current = analysisInterval;
    processingRef.current = false;
    setAnalyzerError(null);

    // WebSocket 연결 설정
    DiscordApi.setupWebSocket()
      .then((connected) => {
        if (connected) {
          setIsConnected(true);

          // 즉시 첫 분석 실행 (비동기)
          setTimeout(() => {
            if (!processingRef.current) {
              analyzeCurrentFrame().catch((error) => {
                console.error("초기 프레임 분석 오류:", error);
              });
            }
          }, 1000);

          // 정해진 간격마다 분석 실행
          analyzerIntervalRef.current = setInterval(() => {
            // 이미 분석 중이면 건너뜀
            if (!processingRef.current) {
              analyzeCurrentFrame().catch((error) => {
                console.error("주기적 프레임 분석 오류:", error);
              });
            } else {
              console.log("이전 분석이 아직 진행 중입니다. 건너뜀");
            }
          }, currentIntervalRef.current);

          console.log(
            `화면 분석 시작됨 (${currentIntervalRef.current / 5000}초 간격)`
          );
        } else {
          setAnalyzerError(new Error("분석 시작을 위한 WebSocket 연결 실패"));
        }
      })
      .catch((error) => {
        console.error("분석 시작 오류:", error);
        setAnalyzerError(error);
      });
  }, [analyzeCurrentFrame, analysisInterval]);

  // 분석 중지 함수
  const stopAnalysis = useCallback(() => {
    if (analyzerIntervalRef.current) {
      clearInterval(analyzerIntervalRef.current);
      analyzerIntervalRef.current = null;
      console.log("화면 분석 중지됨");
    }

    // 알람 타이머 정리
    if (alarmTimeoutRef.current) {
      clearTimeout(alarmTimeoutRef.current);
      alarmTimeoutRef.current = null;
    }

    // 분석 타임아웃 정리
    if (analyzingTimeoutRef.current) {
      clearTimeout(analyzingTimeoutRef.current);
      analyzingTimeoutRef.current = null;
    }

    // 상태 초기화
    processingRef.current = false;
    currentIntervalRef.current = analysisInterval;
    consecutiveErrorsRef.current = 0;
  }, [analysisInterval]);

  // 알람 상태 초기화 함수
  const resetAlarm = useCallback(() => {
    setIsAlarmActive(false);
    if (alarmTimeoutRef.current) {
      clearTimeout(alarmTimeoutRef.current);
      alarmTimeoutRef.current = null;
    }
  }, []);

  // 에러 초기화 함수
  const resetError = useCallback(() => {
    setAnalyzerError(null);
    consecutiveErrorsRef.current = 0;

    // 분석이 중단된 경우 재시작
    if (!analyzerIntervalRef.current && isActive) {
      startAnalysis();
    }
  }, [isActive, startAnalysis]);

  // isActive 변경 시 자동 시작/중지
  useEffect(() => {
    if (isActive) {
      startAnalysis();
    } else {
      stopAnalysis();
    }

    return () => {
      stopAnalysis();
    };
  }, [isActive, startAnalysis, stopAnalysis]);

  // 사용자 컴포넌트로 반환할 값들
  return {
    isAlarmActive,
    lastAnalysisTime,
    isAnalyzing,
    analyzerError,
    isConnected,
    startAnalysis,
    stopAnalysis,
    resetAlarm,
    resetError,
    analyzeCurrentFrame,
  };
};
