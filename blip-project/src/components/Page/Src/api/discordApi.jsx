import axios from "axios";

//프레임 분석을 위한 API 서비스
const DiscordApi = {
  // WebSocket 연결 상태 관리
  webSocket: null,
  isConnecting: false,
  reconnectAttempts: 0,
  maxReconnectAttempts: 5,
  reconnectTimeout: null,
  messageQueue: [], // 메시지 응답 대기열
  callbacks: {
    onMessage: null,
    onError: null,
    onClose: null,
    onOpen: null,
  },

  //WebSocket 연결을 설정합니다
  setupWebSocket: async () => {
    // 이미 연결 중이거나 연결되어 있는 경우
    if (
      DiscordApi.isConnecting ||
      (DiscordApi.webSocket &&
        DiscordApi.webSocket.readyState === WebSocket.OPEN)
    ) {
      return true;
    }

    DiscordApi.isConnecting = true;

    return new Promise((resolve) => {
      try {
        // WebSocket 서버 URL
        const wsUrl = "ws://3.35.180.21:8080/ws";
        DiscordApi.webSocket = new WebSocket(wsUrl);

        // 연결 타임아웃 설정 (5초)
        const connectionTimeout = setTimeout(() => {
          if (DiscordApi.webSocket.readyState !== WebSocket.OPEN) {
            console.error("WebSocket 연결 타임아웃");
            if (DiscordApi.webSocket) {
              DiscordApi.webSocket.close();
            }
            DiscordApi.isConnecting = false;
            resolve(false);
          }
        }, 5000);

        // 연결 이벤트 핸들러
        DiscordApi.webSocket.onopen = () => {
          console.log("WebSocket 연결 성공");
          clearTimeout(connectionTimeout);
          DiscordApi.isConnecting = false;
          DiscordApi.reconnectAttempts = 0;
          if (DiscordApi.callbacks.onOpen) DiscordApi.callbacks.onOpen();
          resolve(true);
        };

        // 메시지 수신 핸들러
        DiscordApi.webSocket.onmessage = (event) => {
          try {
            const response = JSON.parse(event.data);
            console.log("WebSocket 응답:", response);

            // 대기 중인 요청이 있는지 확인
            if (DiscordApi.messageQueue.length > 0) {
              const pendingRequest = DiscordApi.messageQueue[0];
              // 응답 처리 후 대기열에서 제거
              DiscordApi.messageQueue.shift();
              clearTimeout(pendingRequest.timeoutId);
              pendingRequest.resolve(response);
            }

            // 전역 메시지 핸들러 호출
            if (DiscordApi.callbacks.onMessage) {
              DiscordApi.callbacks.onMessage(response);
            }
          } catch (error) {
            console.error("WebSocket 메시지 파싱 오류:", error);

            // 대기 중인 요청이 있으면 오류 처리
            if (DiscordApi.messageQueue.length > 0) {
              const pendingRequest = DiscordApi.messageQueue.shift();
              clearTimeout(pendingRequest.timeoutId);
              pendingRequest.reject(error);
            }
          }
        };

        // 오류 핸들러
        DiscordApi.webSocket.onerror = (error) => {
          console.error("WebSocket 오류:", error);
          clearTimeout(connectionTimeout);

          // 모든 대기 중인 요청에 오류 전달
          while (DiscordApi.messageQueue.length > 0) {
            const pendingRequest = DiscordApi.messageQueue.shift();
            clearTimeout(pendingRequest.timeoutId);
            pendingRequest.reject(new Error("WebSocket 연결 오류"));
          }

          if (DiscordApi.callbacks.onError) DiscordApi.callbacks.onError(error);
          DiscordApi.isConnecting = false;
          resolve(false);
        };

        // 연결 종료 핸들러
        DiscordApi.webSocket.onclose = (event) => {
          console.log(`WebSocket 연결 종료: ${event.code} ${event.reason}`);
          clearTimeout(connectionTimeout);

          // 모든 대기 중인 요청에 연결 종료 오류 전달
          while (DiscordApi.messageQueue.length > 0) {
            const pendingRequest = DiscordApi.messageQueue.shift();
            clearTimeout(pendingRequest.timeoutId);
            pendingRequest.reject(new Error("WebSocket 연결 종료"));
          }

          if (DiscordApi.callbacks.onClose) DiscordApi.callbacks.onClose(event);
          DiscordApi.isConnecting = false;

          // 자동 재연결 (최대 시도 횟수 이내)
          if (DiscordApi.reconnectAttempts < DiscordApi.maxReconnectAttempts) {
            DiscordApi.reconnectAttempts++;
            const delay = Math.min(
              1000 * Math.pow(2, DiscordApi.reconnectAttempts),
              30000
            );
            console.log(
              `${delay}ms 후 WebSocket 재연결 시도 (${DiscordApi.reconnectAttempts}/${DiscordApi.maxReconnectAttempts})`
            );

            clearTimeout(DiscordApi.reconnectTimeout);
            DiscordApi.reconnectTimeout = setTimeout(() => {
              DiscordApi.setupWebSocket();
            }, delay);
          }

          resolve(false);
        };
      } catch (error) {
        console.error("WebSocket 설정 오류:", error);
        DiscordApi.isConnecting = false;
        resolve(false);
      }
    });
  },

  /**
   * WebSocket 연결을 종료합니다
   */
  closeWebSocket: () => {
    clearTimeout(DiscordApi.reconnectTimeout);

    // 모든 대기 중인 요청 취소
    while (DiscordApi.messageQueue.length > 0) {
      const pendingRequest = DiscordApi.messageQueue.shift();
      clearTimeout(pendingRequest.timeoutId);
      pendingRequest.reject(new Error("WebSocket 연결이 의도적으로 종료됨"));
    }

    if (DiscordApi.webSocket) {
      DiscordApi.webSocket.onclose = null; // 재연결 방지
      DiscordApi.webSocket.close(1000, "의도적인 연결 종료");
      DiscordApi.webSocket = null;
      console.log("WebSocket 연결 종료됨");
    }
  },

  //콜백 함수를 설정합니다
  setCallbacks: (callbacks) => {
    DiscordApi.callbacks = { ...DiscordApi.callbacks, ...callbacks };
  },

  //비디오 프레임을 분석하여 알람 상태를 확인합니다
  analyzeFrame: async (teamId, imageData) => {
    const base64Data = imageData.replace(
      /^data:image\/(png|jpeg|jpg);base64,/,
      ""
    );
    // 헤더 제거 후 base64 데이터 로깅
    console.log("헤더 제거 후 base64 데이터:");
    console.log("base64Data", base64Data); // 너무 길어서 앞부분만 표시
    console.log(
      "헤더 제거 후 base64 데이터 크기:",
      Math.floor(base64Data.length / 1024) + "KB"
    );

    try {
      console.log(
        `프레임 분석 시도: teamId=${teamId}, 이미지 크기=${Math.floor(
          base64Data.length / 1024
        )}KB`
      );

      // WebSocket 연결 확인 및 설정
      if (
        !DiscordApi.webSocket ||
        DiscordApi.webSocket.readyState !== WebSocket.OPEN
      ) {
        const connected = await DiscordApi.setupWebSocket();
        if (!connected) {
          throw new Error("WebSocket 연결에 실패했습니다");
        }
      }

      // 데이터 준비
      const data = {
        id: teamId,
        image: base64Data,
      };

      // 결과를 기다리는 Promise
      return new Promise((resolve, reject) => {
        // 타임아웃 설정 (5초로 줄임)
        const timeoutId = setTimeout(() => {
          // 대기열에서 이 요청 제거
          const index = DiscordApi.messageQueue.findIndex(
            (req) => req.timeoutId === timeoutId
          );
          if (index !== -1) {
            DiscordApi.messageQueue.splice(index, 1);
          }

          // 응답 없음 오류 발생
          reject(new Error("WebSocket 응답 시간 초과"));
        }, 10000); // 5초 타임아웃 (이전 10초에서 줄임)

        // 요청을 대기열에 추가
        DiscordApi.messageQueue.push({
          resolve,
          reject,
          timeoutId,
          sentAt: Date.now(),
        });

        // WebSocket으로 데이터 전송
        try {
          DiscordApi.webSocket.send(JSON.stringify(data));
          console.log("WebSocket으로 데이터 전송됨");
        } catch (sendError) {
          // 전송 실패 시 대기열에서 요청 제거
          clearTimeout(timeoutId);
          const index = DiscordApi.messageQueue.findIndex(
            (req) => req.timeoutId === timeoutId
          );
          if (index !== -1) {
            DiscordApi.messageQueue.splice(index, 1);
          }
          reject(sendError);
        }
      });
    } catch (error) {
      console.error("프레임 분석 API 오류:", error);

      // 연결 오류 시 재시도
      if (
        error.message.includes("WebSocket 연결") &&
        DiscordApi.reconnectAttempts < DiscordApi.maxReconnectAttempts
      ) {
        await DiscordApi.setupWebSocket();
      }

      // 오류가 있더라도 기본 false 반환하여 앱이 계속 작동하도록 함
      return { result: false };
    }
  },

  //캔버스에서 비디오 프레임을 캡처합니다
  captureVideoFrame: (videoElement) => {
    if (!videoElement) {
      throw new Error("비디오 요소가 없습니다");
    }

    try {
      // 비디오가 준비되지 않은 경우
      if (videoElement.readyState !== videoElement.HAVE_ENOUGH_DATA) {
        console.warn("비디오가 아직 준비되지 않았습니다. 다시 시도합니다.");
        return null;
      }

      // 비디오 크기 확인
      const width = videoElement.videoWidth;
      const height = videoElement.videoHeight;

      if (width === 0 || height === 0) {
        console.warn("비디오 크기가 유효하지 않습니다");
        return null;
      }

      const canvas = document.createElement("canvas");
      const context = canvas.getContext("2d");

      if (!context) {
        throw new Error("캔버스 컨텍스트를 생성할 수 없습니다");
      }

      // 캔버스 크기 설정 - 더 작은 크기로 조정하여 데이터 크기 줄임
      canvas.width = 320; // 원본에서 축소
      canvas.height = Math.floor(height * (320 / width));

      // 이미지 품질과 크기 최적화
      try {
        // 비디오 프레임 그리기 (좌우 반전 적용)
        context.translate(canvas.width, 0);
        context.scale(-1, 1);
        context.drawImage(videoElement, 0, 0, canvas.width, canvas.height);

        // 원래 변환 상태로 복원
        context.setTransform(1, 0, 0, 1, 0, 0);

        // 이미지 품질 조정 (낮은 품질)
        return canvas.toDataURL("image/jpeg", 0.5);
      } catch (error) {
        console.error("비디오 프레임 그리기 오류:", error);
        return null;
      }
    } catch (error) {
      console.error("비디오 프레임 캡처 오류:", error);
      return null;
    }
  },
};

export default DiscordApi;
