import "../../../CSS/Discord.css";
import { typography } from "../../../../fonts/fonts";
import { color } from "../../../../style/color";
import DisAlarm from "../../../../svg/DisAlarm.svg";
import NoMike from "../../../../svg/NoMike.svg";
import NoCamera from "../../../../svg/NoCamera.svg";
import Mike from "../../../../svg/Mike.svg";
import Camera from "../../../../svg/DisCamera.svg";
import Fullscreen from "../../../../svg/FullScreen.svg";
import X from "../../../../svg/X.svg";
import MettingStop from "../../../../svg/MettingStop.svg";
import MettingStart from "../../../../svg/MettingStart.svg";
import ModalStop from "../../Modal/ModalStop";
import ModalStart from "../../Modal/ModalStart";
import JitsiMeetMain from "../function/jitsiMeetMain";
import { useContext, useEffect, useState, useRef } from "react";
import { TeamDel } from "../../Main/Main";
import { UseStateContext } from "../../../../Router";
import { DiscordContext, Call } from "../../../../Router";
import { FindId } from "../../Main/Main";
import RecordingService from "../function/RecordingService";
import { handleMeetingEnd } from "../api/MeetingEndApi";
import axios from "axios";

const Discord = () => {
  const { itemId } = useContext(TeamDel);
  const [isMettingStop, setIsMettingStop] = useState(false);

  const { targetId, createTeamId, itemBackendId } = useContext(FindId);

  const {
    isMike,
    setIsMike,
    isCamera,
    setIsCamera,
    setFullScreen,
    setDiscord,
    meetingEnd,
    setMeetingEnd,
  } = useContext(UseStateContext);

  const { videoRef, stream, setStream, isListening, setIsListening } =
    useContext(DiscordContext);
  const { setRecordedChunks } = useContext(Call); // recordedChunks setter 추가

  // 녹음 서비스 참조 추가
  const recordingServiceRef = useRef(null);
  const [isRecording, setIsRecording] = useState(false);

  // 유효한 팀 ID 가져오기
  const getValidTeamId = () => {
    const id = itemBackendId || createTeamId || itemId || 1;
    // create- 접두사가 있으면 제거
    if (typeof id === "string" && id.includes("create-")) {
      const match = id.match(/create-(\d+)/);
      return match && match[1] ? match[1] : id;
    }
    return id;
  };

  // 컴포넌트 마운트 시 녹음 서비스 초기화
  useEffect(() => {
    // 녹음 서비스 인스턴스 생성
    recordingServiceRef.current = new RecordingService();
    console.log("녹음 서비스 초기화됨");

    // 글로벌 객체에 참조 저장 (디버깅용)
    window.recordingService = recordingServiceRef.current;

    // 컴포넌트 언마운트 시 정리
    return () => {
      const teamId = getValidTeamId();

      if (recordingServiceRef.current) {
        if (isRecording) {
          try {
            const stopRecordingPromise =
              recordingServiceRef.current.stopRecording(teamId);
            stopRecordingPromise
              .then((recordingBlob) => {
                if (recordingBlob && recordingBlob.size > 0) {
                  console.log(
                    "언마운트 시 녹음 중지, 녹음 데이터 크기:",
                    recordingBlob.size
                  );
                  setRecordedChunks((prev) => [...prev, recordingBlob]);
                }
              })
              .catch((error) => {
                console.error("녹음 중지 프로미스 오류:", error);
              });
          } catch (error) {
            console.error("녹음 중지 오류:", error);
          }
        }

        recordingServiceRef.current.dispose(teamId);
        console.log("녹음 서비스 정리됨");
      }
    };
  }, []);

  // 로컬 비디오 테스트용 로컬 참조
  const localVideoRef = useRef(null);

  // 컴포넌트 마운트 시 로컬 비디오 설정
  useEffect(() => {
    async function setupLocalVideo() {
      try {
        console.log("로컬 비디오 설정 시도...", { isCamera });
        // 카메라와 마이크 접근 요청
        const localStream = await navigator.mediaDevices.getUserMedia({
          video: true,
          audio: true,
        });

        console.log(
          "미디어 장치 접근 성공:",
          localStream
            .getTracks()
            .map((t) => `${t.kind}:${t.label}:${t.enabled}`)
        );

        // 비디오 트랙을 현재 카메라 상태에 맞게 설정
        const videoTracks = localStream.getVideoTracks();
        videoTracks.forEach((track) => {
          track.enabled = isCamera;
          console.log(
            `초기 비디오 트랙 ${track.label} ${
              isCamera ? "활성화" : "비활성화"
            }`
          );
        });

        // 로컬 비디오 요소에 스트림 설정
        if (localVideoRef.current) {
          localVideoRef.current.srcObject = localStream;
          console.log("로컬 비디오 요소에 스트림 설정됨");

          // 비디오 로드 확인을 위한 이벤트 리스너
          localVideoRef.current.onloadedmetadata = () => {
            console.log("비디오 메타데이터 로드됨");
            localVideoRef.current
              .play()
              .then(() => console.log("비디오 재생 시작됨"))
              .catch((err) => console.error("비디오 재생 실패:", err));
          };
        } else {
          console.warn("localVideoRef.current가 없음");
        }

        // 글로벌 비디오 참조에도 설정
        if (videoRef && videoRef.current) {
          videoRef.current.srcObject = localStream;
          console.log("글로벌 비디오 요소에 스트림 설정됨");
        }

        if (typeof setStream === "function") {
          setStream(localStream);
          console.log("글로벌 스트림 상태 업데이트됨");
        }

        // RecordingService 설정 (추가된 부분)
        const teamId = getValidTeamId();
        if (recordingServiceRef.current) {
          const setupResult = await recordingServiceRef.current.setupRecording(
            teamId,
            localStream
          );
          console.log("녹음 서비스 설정 결과:", setupResult);

          // 리스너 추가하여 녹음 상태 모니터링
          recordingServiceRef.current.addListener(
            teamId,
            (event, data, state) => {
              if (event === "dataavailable" && data) {
                console.log("녹음 데이터 수집됨:", data.size, "bytes");
              } else if (event === "start") {
                console.log("녹음 시작됨, 상태:", state);
              } else if (event === "stop") {
                console.log("녹음 중지됨, 상태:", state);
              }
            }
          );
        }
      } catch (error) {
        console.error("로컬 비디오 설정 오류:", error);

        if (
          error.name === "NotAllowedError" ||
          error.name === "PermissionDeniedError"
        ) {
          alert(
            "카메라와 마이크 접근 권한이 필요합니다. 브라우저 설정에서 권한을 허용해주세요."
          );
        } else {
          alert("카메라 설정 중 오류가 발생했습니다: " + error.message);
        }
      }
    }

    setupLocalVideo();

    // 컴포넌트 언마운트 시 정리
    return () => {
      if (localVideoRef.current && localVideoRef.current.srcObject) {
        const tracks = localVideoRef.current.srcObject.getTracks();
        tracks.forEach((track) => track.stop());
        console.log("로컬 비디오 트랙 정리됨");
      }
    };
  }, []);

  // 카메라 상태 변경 감지
  useEffect(() => {
    if (localVideoRef.current && localVideoRef.current.srcObject) {
      const videoTracks = localVideoRef.current.srcObject.getVideoTracks();

      videoTracks.forEach((track) => {
        track.enabled = isCamera;
        console.log(
          `비디오 트랙 ${track.label} ${track.enabled ? "활성화" : "비활성화"}`
        );
      });
    }
  }, [isCamera]);

  const onClickMike = async () => {
    const teamId = getValidTeamId();

    if (!isMike) {
      // 마이크 켜기 시도
      if (recordingServiceRef.current && stream) {
        try {
          // 스트림 로깅
          console.log("현재 스트림 상태:", {
            audioTracks: stream.getAudioTracks().map((track) => ({
              label: track.label,
              readyState: track.readyState,
              muted: track.muted,
              enabled: track.enabled,
            })),
            videoTracks: stream.getVideoTracks().map((track) => ({
              label: track.label,
              readyState: track.readyState,
              muted: track.muted,
              enabled: track.enabled,
            })),
          });

          // 녹음 서비스 설정
          const setupResult = await recordingServiceRef.current.setupRecording(
            teamId,
            stream
          );
          console.log("녹음 서비스 설정 결과:", setupResult);

          if (setupResult) {
            // 녹음 시작
            const startResult =
              recordingServiceRef.current.startRecording(teamId);
            console.log("녹음 시작 결과:", startResult);

            // 더미 MP3 생성
            const dummyMp3 = await recordingServiceRef.current.createDummyMp3();
            setRecordedChunks([dummyMp3]);
            setIsRecording(true);
          }
        } catch (error) {
          console.error("마이크 켜기 실패:", error);
        }
      }
    } else {
      // 마이크 끄기 로직 (이전과 동일)
    }

    // UI 상태 변경
    setIsMike((prev) => !prev);
    setIsListening((prev) => !prev);
  };

  const onClickCamera = () => {
    setIsCamera((preState) => !preState);
  };

  const onClickFull = () => {
    setFullScreen((preState) => !preState);
  };

  const onClickEnd = async () => {
    const teamId = getValidTeamId();

    if (recordingServiceRef.current && isRecording) {
      try {
        // 녹음 중지 및 MP3 변환
        const recordingBlob = await recordingServiceRef.current.stopRecording(
          teamId
        );

        // 회의 종료 처리 함수 호출
        const result = await handleMeetingEnd(
          null, // meetingId
          teamId,
          null, // setMeetingId
          createTeamId,
          itemBackendId,
          recordingBlob
        );

        if (result.success) {
          // 성공적으로 회의 종료
          setMeetingEnd(true);
        } else {
          // 오류 처리
          console.error("회의 종료 실패:", result.error);
          alert(result.error);
        }
      } catch (error) {
        console.error("회의 종료 처리 중 오류:", error);
      }
    } else {
      // 녹음 중이 아닌 경우 바로 회의 종료
      setMeetingEnd(true);
      setDiscord(false);
    }
  };

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isModalStart, setIsModalStart] = useState(false);

  const openModalStop = () => setIsModalOpen(true);
  const closeModal = () => setIsModalOpen(false);

  const openModalStart = () => setIsModalStart(true);
  const IsCloseModal = () => setIsModalStart(false);

  // 녹음 상태 디버깅 UI
  const RecordingStatus = () => (
    <div
      style={{
        position: "absolute",
        bottom: "50px",
        right: "10px",
        zIndex: 1000,
        backgroundColor: "rgba(0,0,0,0.7)",
        color: "white",
        padding: "8px",
        fontSize: "12px",
        borderRadius: "4px",
      }}
    >
      <div>녹음 상태: {isRecording ? "녹음 중" : "중지됨"}</div>
      <div>마이크: {isMike ? "켜짐" : "꺼짐"}</div>
      {isRecording && (
        <div
          style={{
            width: "10px",
            height: "10px",
            borderRadius: "50%",
            backgroundColor: "red",
            display: "inline-block",
            marginRight: "5px",
          }}
        ></div>
      )}
    </div>
  );

  return (
    <>
      {meetingEnd ? (
        <div className="discord">
          <div
            className="discord-end"
            style={{ backgroundColor: color.GrayScale[8] }}
          >
            <div className="discord-end-x">
              <img src={X} onClick={onClickEnd} style={{ width: "3%" }} />
            </div>
            <div className="discord-end-fnot" style={{ color: color.White }}>
              <div style={typography.Title1}>회의가 종료되었어요.</div>
              <p style={typography.Title3}>
                BLIP이 회의를 요약해서 알려드릴게요!
              </p>
            </div>
          </div>
        </div>
      ) : (
        <>
          <div className="discord">
            <div
              className="discord-body"
              style={{ backgroundColor: color.GrayScale[8] }}
            >
              <JitsiMeetMain setIsMettingStop={setIsMettingStop} />

              {/* 로컬 비디오 테스트 */}
              <video
                ref={localVideoRef}
                autoPlay
                playsInline
                muted
                style={{
                  position: "absolute",
                  top: "2.5%",
                  left: "2.5%",
                  width: "95%",
                  height: "95%",
                  objectFit: "cover",
                  zIndex: 5,
                  transform: "scaleX(-1)",
                  display: isCamera ? "block" : "none",
                  borderRadius: "8px",
                }}
              />

              {/* 디버깅 정보 표시 */}
              <div
                style={{
                  position: "absolute",
                  bottom: "10px",
                  left: "10px",
                  zIndex: 1000,
                  backgroundColor: "rgba(0,0,0,0.5)",
                  color: "white",
                  padding: "5px",
                  fontSize: "12px",
                  display: isCamera ? "block" : "none",
                }}
              >
                카메라 상태: {isCamera ? "켜짐" : "꺼짐"} | 비디오 참조:{" "}
                {localVideoRef.current ? "있음" : "없음"} | 스트림:{" "}
                {localVideoRef.current?.srcObject ? "있음" : "없음"}
              </div>

              {/* 녹음 상태 표시 */}
              <RecordingStatus />

              {/* 카메라가 꺼져 있을 때 screen 클래스 표시 */}
              {!isCamera && (
                <div
                  className="screen"
                  style={{
                    position: "absolute",
                    top: "2.5%",
                    left: "2.5%",
                    width: "95%",
                    height: "95%",
                    zIndex: 5,
                    backgroundColor: "#8C6EFF", // 보라색 배경
                    display: "flex",
                    justifyContent: "center",
                    alignItems: "center",
                    borderRadius: "8px", // 약간의 모서리 둥글기 추가
                  }}
                >
                  <div
                    style={{
                      width: "80px",
                      height: "80px",
                      borderRadius: "50%",
                      backgroundColor: "#EF5DA8", // 분홍색 원
                      display: "flex",
                      justifyContent: "center",
                      alignItems: "center",
                      color: "white",
                      fontSize: "18px",
                    }}
                  >
                    정영우
                  </div>
                </div>
              )}
            </div>
            <div
              className="discord-foot"
              style={{ backgroundColor: color.GrayScale[0] }}
            >
              <>
                <div className="discord-foot-Metting">
                  <img
                    src={isMettingStop ? MettingStop : MettingStart}
                    //녹음을 끊는다면 주는 값을 다르게 주어 녹음을 끊었다는것을 알아야한다
                    onClick={isMettingStop ? openModalStart : openModalStop}
                    style={{ width: "50%" }}
                  />
                  <img src={DisAlarm} style={{ width: "50%" }} />
                </div>
              </>
              <div className="discord-foot-Src">
                <div className="discord-foot-NoSrc">
                  <img
                    src={isMike ? Mike : NoMike}
                    onClick={onClickMike}
                    style={{ width: "30%" }}
                  />
                  <img
                    src={isCamera ? Camera : NoCamera}
                    onClick={onClickCamera}
                    style={{ width: "30%" }}
                  />
                </div>
                <img
                  src={Fullscreen}
                  onClick={onClickFull}
                  style={{ width: "15%" }}
                />
              </div>
            </div>
            {isModalStart && (
              <ModalStart
                onClose={IsCloseModal}
                setIsMettingStop={setIsMettingStop}
              />
            )}
            {isModalOpen && (
              <ModalStop
                onClose={closeModal}
                setIsMettingStop={setIsMettingStop}
              />
            )}
          </div>
        </>
      )}
    </>
  );
};

export default Discord;
