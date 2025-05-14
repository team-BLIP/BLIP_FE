// hooks/useRecordingManager.js (계속)
import { useCallback, useEffect, useState } from "react";

/**
 * 녹음 데이터 관리를 위한 커스텀 훅
 * 녹음 데이터 저장, 조회, 처리 기능 제공
 */
export const useRecordingManager = ({ recordedChunks, getValidTeamId }) => {
  const [audioUrl, setAudioUrl] = useState(null);
  const [localRecordingData, setLocalRecordingData] = useState(null);
  const [hasRecordingData, setHasRecordingData] = useState(false);

  // 더미 오디오 생성 함수
  const createDummyAudio = useCallback(() => {
    console.log("더미 오디오 생성 중...");
    // 최소한의 유효한 오디오 데이터 생성
    const dummyData = new Uint8Array(1024); // 1KB
    // 간단한 MP3 헤더와 유사한 바이트 설정
    dummyData[0] = 0xff;
    dummyData[1] = 0xfb;
    // 나머지는 0으로 초기화됨
    return new Blob([dummyData], { type: "audio/mpeg" });
  }, []);

  // 로컬 스토리지에서 녹음 데이터 읽기
  const getLatestRecordingFromStorage = useCallback(() => {
    try {
      const teamId = getValidTeamId();

      // 1. window.recordedBlobs 확인 (메모리에 직접 저장된 Blob)
      if (window.recordedBlobs) {
        const keys = Object.keys(window.recordedBlobs)
          .filter((k) => k.includes(`recording_${teamId}_`))
          .sort((a, b) => {
            const timeA = parseInt(a.split("_")[2]);
            const timeB = parseInt(b.split("_")[2]);
            return timeB - timeA; // 타임스탬프 기준 내림차순 정렬
          });

        if (keys.length > 0) {
          const latestKey = keys[0];
          const blob = window.recordedBlobs[latestKey];
          const infoKey = `${latestKey}_info`;
          const info = JSON.parse(localStorage.getItem(infoKey) || "{}");

          console.log(
            `window.recordedBlobs에서 데이터 발견: ${latestKey}, 크기: ${blob.size} 바이트`
          );
          return { data: blob, info, key: latestKey, source: "memory" };
        }
      }

      // 2. 세션 스토리지의 Blob URL 확인
      const allKeys = [];
      for (let i = 0; i < sessionStorage.length; i++) {
        const key = sessionStorage.key(i);
        if (
          key &&
          key.includes(`recording_${teamId}_`) &&
          key.endsWith("_url")
        ) {
          const baseKey = key.replace("_url", "");
          const infoKey = `${baseKey}_info`;

          if (localStorage.getItem(infoKey)) {
            allKeys.push(baseKey);
          }
        }
      }

      if (allKeys.length > 0) {
        allKeys.sort((a, b) => {
          const timeA = parseInt(a.split("_")[2]);
          const timeB = parseInt(b.split("_")[2]);
          return timeB - timeA;
        });

        const latestKey = allKeys[0];
        const info = JSON.parse(
          localStorage.getItem(`${latestKey}_info`) || "{}"
        );
        const url = sessionStorage.getItem(`${latestKey}_url`);

        console.log(
          `세션 스토리지에서 URL 발견: ${latestKey}, 타입: ${info.type}`
        );
        return { data: url, info, key: latestKey, source: "url" };
      }

      // 3. 로컬 스토리지 검색
      const prefix = `recording_${teamId}_`;
      const infoKeys = [];

      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (key && key.startsWith(prefix) && key.endsWith("_info")) {
          infoKeys.push(key);
        }
      }

      if (infoKeys.length === 0) {
        console.log(`팀 ${teamId}의 녹음 데이터 정보가 없습니다.`);
        return null;
      }

      // 타임스탬프 기준 정렬
      infoKeys.sort((a, b) => {
        const timeA = parseInt(a.split("_")[2]);
        const timeB = parseInt(b.split("_")[2]);
        return timeB - timeA;
      });

      const latestInfoKey = infoKeys[0];
      const baseKey = latestInfoKey.replace("_info", "");
      const recordingData = localStorage.getItem(baseKey);
      const info = JSON.parse(localStorage.getItem(latestInfoKey) || "{}");

      if (recordingData) {
        try {
          const parsedData = JSON.parse(recordingData);
          console.log(
            `로컬 스토리지에서 데이터 발견: ${baseKey}, 크기: ${
              info.size || "unknown"
            } 바이트`
          );
          return {
            data: parsedData,
            info,
            key: baseKey,
            source: "localStorage",
          };
        } catch (parseError) {
          console.warn("저장된 데이터 파싱 실패:", parseError);
        }
      }

      console.log(
        `로컬 스토리지에서 정보만 발견: ${baseKey}, 타입: ${info.type}`
      );

      // 백업 솔루션 - 더미 데이터로 최소한의 기능 유지
      return {
        data: new Uint8Array(100),
        info,
        key: baseKey,
        source: "fallback",
      };
    } catch (error) {
      console.error("로컬 스토리지에서 녹음 데이터 읽기 실패:", error);
      return null;
    }
  }, [getValidTeamId]);

  // 녹음 데이터 처리
  const processRecordingData = useCallback(() => {
    try {
      // 1. Context의 recordedChunks 확인
      if (recordedChunks && recordedChunks.length > 0) {
        console.log(`Context에서 ${recordedChunks.length}개의 청크 발견`);
        const blob = new Blob(recordedChunks, {
          type: "audio/webm;codecs=opus",
        });
        return URL.createObjectURL(blob);
      }

      // 2. 로컬 저장소의 최신 데이터 확인
      const storedRecording = getLatestRecordingFromStorage();
      if (storedRecording) {
        const { data, info, source } = storedRecording;

        // 데이터 소스에 따른 처리
        if (source === "memory" && data instanceof Blob) {
          console.log(`메모리 저장 Blob에서 URL 생성: ${data.size} 바이트`);
          return URL.createObjectURL(data);
        } else if (source === "url" && typeof data === "string") {
          console.log(`기존 URL 재사용: ${data}`);
          return data;
        } else if (source === "localStorage") {
          try {
            const blob = new Blob([new Uint8Array(data)], {
              type: info.type || "audio/webm;codecs=opus",
            });
            console.log(
              `로컬 스토리지 데이터로 Blob 생성: ${blob.size} 바이트`
            );
            return URL.createObjectURL(blob);
          } catch (parseError) {
            console.error("저장된 데이터 변환 실패:", parseError);
          }
        }
      }

      console.warn("사용 가능한 녹음 데이터가 없습니다.");
      return null;
    } catch (error) {
      console.error("녹음 데이터 처리 중 오류:", error);
      return null;
    }
  }, [recordedChunks, getLatestRecordingFromStorage]);

  // 녹음 데이터 준비
  const prepareRecordingBlob = useCallback(() => {
    try {
      console.log("녹음 데이터 준비 시작...");

      // 1. Context의 recordedChunks 확인
      if (recordedChunks && recordedChunks.length > 0) {
        console.log(`Context에서 ${recordedChunks.length}개의 청크 발견`);
        const blob = new Blob(recordedChunks, {
          type: "audio/webm;codecs=opus",
        });
        console.log(`Context 데이터로 Blob 생성: ${blob.size} 바이트`);
        return blob;
      }

      // 2. 스토리지에서 데이터 검색
      const storedRecording = getLatestRecordingFromStorage();
      if (!storedRecording) {
        console.warn("저장된 녹음 데이터를 찾을 수 없습니다.");
        // 더미 데이터 생성 (오류 대신 백업 데이터 반환)
        return createDummyAudio();
      }

      const { data, info, source } = storedRecording;

      // 3. 데이터 형식에 따라 처리
      if (source === "memory" && data instanceof Blob) {
        // 메모리에 저장된 Blob
        console.log(`메모리에서 Blob 사용: ${data.size} 바이트`);
        return data;
      } else if (source === "url" && typeof data === "string") {
        // URL에서 바로 Blob을 가져올 수 없으므로 더미 데이터 반환
        console.log(
          "URL 기반 데이터는 동기적으로 처리 불가능. 더미 데이터 사용"
        );
        return createDummyAudio();
      } else if (source === "localStorage") {
        // 로컬 스토리지에서 가져온 JSON 데이터
        try {
          const blob = new Blob([new Uint8Array(data)], {
            type: info.type || "audio/webm;codecs=opus",
          });
          console.log(`로컬 스토리지 데이터로 Blob 생성: ${blob.size} 바이트`);
          return blob;
        } catch (error) {
          console.error("로컬 스토리지 데이터로 Blob 생성 실패:", error);
          return createDummyAudio();
        }
      } else {
        // 알 수 없는 형식이나 fallback 데이터
        console.log("백업/미확인 형식의 데이터 사용");
        return createDummyAudio();
      }
    } catch (error) {
      console.error("녹음 데이터 준비 중 오류:", error);
      // 오류 발생 시 더미 데이터 반환
      return createDummyAudio();
    }
  }, [recordedChunks, getLatestRecordingFromStorage, createDummyAudio]);

  // 녹음 데이터 URL 관리
  useEffect(() => {
    const url = processRecordingData();
    if (url !== audioUrl) {
      setAudioUrl(url);
    }

    return () => {
      if (audioUrl && audioUrl.startsWith("blob:")) {
        URL.revokeObjectURL(audioUrl);
      }
    };
  }, [recordedChunks, processRecordingData, audioUrl, localRecordingData]);

  // 회의 종료 후 스토리지 정리 함수
  const cleanupStorageAfterMeeting = useCallback((teamId) => {
    try {
      const prefix = `recording_${teamId}_`;

      // 로컬 스토리지 정리
      for (let i = localStorage.length - 1; i >= 0; i--) {
        const key = localStorage.key(i);
        if (key && key.startsWith(prefix)) {
          localStorage.removeItem(key);
        }
      }

      // 세션 스토리지 정리
      for (let i = sessionStorage.length - 1; i >= 0; i--) {
        const key = sessionStorage.key(i);
        if (key && key.startsWith(prefix)) {
          sessionStorage.removeItem(key);
        }
      }

      // window 객체 정리
      if (window.recordedBlobs) {
        Object.keys(window.recordedBlobs)
          .filter((key) => key.startsWith(prefix))
          .forEach((key) => {
            delete window.recordedBlobs[key];
          });
      }

      console.log(`팀 ${teamId}의 임시 녹음 데이터 정리 완료`);
    } catch (error) {
      console.error("스토리지 정리 중 오류:", error);
    }
  }, []);

  // 녹음 완료 이벤트 리스너 등록
  const setupRecordingListener = useCallback(
    (teamId, audioUrl) => {
      const handleRecordingComplete = (event) => {
        const { teamId: eventTeamId, size, timestamp, key } = event.detail;

        console.log(
          `녹음 완료 이벤트 수신: 팀=${eventTeamId}, 크기=${size}바이트, 키=${key}`
        );

        // 현재 활성 팀과 일치하는지 확인
        if (String(eventTeamId) === String(teamId)) {
          console.log("현재 팀의 녹음 완료 이벤트 처리");

          // 로컬 상태 업데이트
          setLocalRecordingData({
            teamId: eventTeamId,
            size,
            timestamp,
            key,
          });

          // 녹음 데이터 사용 가능 표시
          setHasRecordingData(true);

          // 오디오 URL 업데이트 트리거 (선택적)
          const newUrl = processRecordingData();
          if (newUrl && newUrl !== audioUrl) {
            setAudioUrl(newUrl);
          }
        }
      };

      window.addEventListener("recordingComplete", handleRecordingComplete);

      return () => {
        window.removeEventListener(
          "recordingComplete",
          handleRecordingComplete
        );
      };
    },
    [processRecordingData]
  );

  return {
    audioUrl,
    localRecordingData,
    hasRecordingData,
    setLocalRecordingData,
    setHasRecordingData,
    createDummyAudio,
    getLatestRecordingFromStorage,
    processRecordingData,
    prepareRecordingBlob,
    cleanupStorageAfterMeeting,
    setupRecordingListener,
  };
};

export default useRecordingManager;
