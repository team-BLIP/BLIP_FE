import "../../CSS/ModalMeeting.css";
import { typography } from "../../../fonts/fonts";
import { color } from "../../../style/color";
import { useState, useContext, useEffect } from "react";
import ESC from "../../../svg/ESC.svg";
import { UseStateContext } from "../../../Router";
import { TeamDel } from "../Main/Main";
import { FindId } from "../Main/Main";
import MeetingStartApi from "../Src/api/MeetingStartApi";

const ModalMeeting = ({ onClose }) => {
  const [isCheckMike, setIsCheckMike] = useState(false);
  const [isCheckCamera, setIsCheckCamera] = useState(false);

  const {
    setIsMike,
    setIsCamera,
    discord,
    setting,
    setSetting,
    isAlarm,
    setIsAlarm,
    isLetter,
    setIsLetter,
    isFeedback,
    setIsFeedback,
    isKeyword,
    setIsKeyword,
    setDiscord,
    basic,
    setBasic,
  } = useContext(UseStateContext);

  const {
    itemId,
    Owner,
    setOwner,
    join,
    setJoin,
    isTopic,
    setIsTopic,
    userName,
  } = useContext(TeamDel);

  const { content, TeamId } = useContext(FindId);

  useEffect(() => {
    console.log("discord 상태 변경:", discord);
  }, [discord]);

  const onChageTopic = (e) => {
    setIsTopic(e.target.value);
    console.log(e.target.value);
  };

  const onChnageCheckMike = () => {
    setIsCheckMike(!isCheckMike);
    setIsMike((prev) => !prev);
  };
  const onChnageCheckCamera = () => {
    setIsCheckCamera(!isCheckCamera);
    setIsCamera((prev) => !prev);
  };

  // setDiscord((perState) => !perState);
  // onClose();
  // if (isLetter) {
  //   setIsLetter((preState) => !preState);
  // } else if (isAlarm) {
  //   setIsAlarm((preState) => !preState);
  // } else if (setting) {
  //   setSetting((preState) => !preState);
  // } else if (isFeedback) {
  //   setIsFeedback((preState) => !preState);
  // } else if (isKeyword) {
  //   setIsKeyword((preState) => !preState);
  // } else if (Owner) {
  //   setOwner((perState) => !perState);
  // } else if (join) {
  //   setJoin((perState) => !perState);
  // } else if (basic) {
  //   setBasic((perState) => !perState);
  // }

  return (
    <div className="modalMeeting-overlay">
      <div className="modalMeeting-content">
        <div className="modalMeeting-title">
          <div>
            <h2 style={{ ...typography.Label2_46 }}>회의 시작하기</h2>
            <p style={{ ...typography.Body1, color: color.GrayScale[6] }}>
              BLIP은 실시간 요약, 키워드 기록, 참여율 분석으로 더 스마트하고
              효율적인 회의를 제공합니다.
            </p>
          </div>
          <img src={ESC} onClick={onClose} style={{ width: "7%" }} />
        </div>
        <div className="modalMeeting-body">
          <div className="modalMeeting-body-Topic">
            <div style={{ ...typography.Title2, color: color.GrayScale[7] }}>
              회의 주제
            </div>
            <p style={{ ...typography.Button2, color: color.GrayScale[6] }}>
              회의 주제를 정해주세요!
            </p>
            <input
              style={{
                ...typography.Body2,
                "--gray-50": color.GrayScale[0],
                "--gray-200": color.GrayScale[2],
              }}
              type="text"
              minLength={5}
              value={isTopic}
              onChange={onChageTopic}
              placeholder="정기회의"
            />
          </div>
          <div className="modalMeeting-body-setting">
            <div>
              <div style={{ ...typography.Title2, color: color.GrayScale[7] }}>
                설정
              </div>
              <p style={{ ...typography.Button2, color: color.GrayScale[6] }}>
                무엇을 허용하고 입장하실건가요?
              </p>
            </div>
            <div
              className="modalMeeting-body-setting-call"
              style={{
                ...typography.Body3Regular,
                "--gray-600": color.GrayScale[6],
              }}
            >
              <div className="setting-call-mike">
                <p>마이크</p>
                <input
                  type="Checkbox"
                  checked={isCheckMike}
                  onChange={onChnageCheckMike}
                  style={{ display: "none" }}
                  id="Mike"
                />
                <label
                  htmlFor="Mike"
                  style={{ "--Main-400": color.Main[4] }}
                  className={`checkbox-label${isCheckMike ? "-checked" : ""}`}
                />
              </div>
              <div className="setting-call-camera">
                <p>카메라</p>
                <input
                  type="Checkbox"
                  checked={isCheckCamera}
                  onChange={onChnageCheckCamera}
                  style={{ display: "none" }}
                  id="camera"
                />
                <label
                  htmlFor="camera"
                  style={{ "--Main-400": color.Main[4] }}
                  className={`checkbox-label${isCheckCamera ? "-checked" : ""}`}
                />
              </div>
            </div>
          </div>
        </div>
        <div className="modalMeeting-button-main">
          {isTopic.length >= 5 || isCheckMike || isCheckCamera ? (
            <button
              className="modalMeeting-button"
              onClick={() => {
                if (typeof setDiscord === "function") {
                  MeetingStartApi(isTopic, content, userName, TeamId);
                } else {
                  console.log("Fdn");
                }
              }}
              style={{
                ...typography.Button0,
                backgroundColor: color.Main[4],
                color: color.White,
              }}
              key={itemId}
            >
              회의 시작하기
            </button>
          ) : (
            <button
              className="modalMeeting-button"
              style={{
                ...typography.Button0,
                backgroundColor: color.Main[2],
                color: color.White,
              }}
            >
              회의 시작하기
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default ModalMeeting;
