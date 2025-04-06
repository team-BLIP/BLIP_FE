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
import { useContext, useState } from "react";
import { TeamDel } from "../../Main/Main";
import { UseStateContext } from "../../../../Router";
import { DiscordContext } from "../../../../Router";
import { FindId } from "../../Main/Main";

const Discord = () => {
  const { itemId } = useContext(TeamDel);
  const [isMettingStop, setIsMettingStop] = useState(false);

  const { targetId } = useContext(FindId);

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

  const { setIsListening } = useContext(DiscordContext);

  const onClickMike = () => {
    setIsMike((preState) => !preState);
    setIsListening((preState) => !preState);
  };

  const onClickCamera = () => {
    setIsCamera((preState) => !preState);
  };

  const onClickFull = () => {
    setFullScreen((preState) => !preState);
  };

  const onClickEnd = () => {
    setMeetingEnd((preState) => !preState);
    setDiscord((preState) => !preState);
  };

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isModalStart, setIsModalStart] = useState(false);

  const openModalStop = () => setIsModalOpen(true);
  const closeModal = () => setIsModalOpen(false);

  const openModalStart = () => setIsModalStart(true);
  const IsCloseModal = () => setIsModalStart(false);

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
          {itemId === targetId ? (
            <div className="discord">
              <div
                className="discord-body"
                style={{ backgroundColor: color.GrayScale[8] }}
              >
                <JitsiMeetMain setIsMettingStop={setIsMettingStop} />
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
          ) : (
            ""
          )}
        </>
      )}
    </>
  );
};

export default Discord;
