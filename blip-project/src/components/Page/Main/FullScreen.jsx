import "../../CSS/FullScreen.css";
import { color } from "../../../style/color";
import { useContext, useState } from "react";
import { TeamDel } from "./MainTeamOwner";
import { UseStateContext } from "../../../Router";
import { DiscordContext } from "../../../Router";
import ModalStart from "../Modal/ModalStart";
import ModalStop from "../Modal/ModalStop";
import Exit from "../../../svg/Exit.svg";
import XFullScreen from "../../../svg/XFullScreen.svg";
import DisAlarm from "../../../svg/DisAlarm.svg";
import NoMike from "../../../svg/NoMike.svg";
import NoCamera from "../../../svg/noCamera.svg";
import Mike from "../../../svg/Mike.svg";
import Camera from "../../../svg/DisCamera.svg";
import MettingStart from "../../../svg/MettingStart.svg";
import MettingStop from "../../../svg/MettingStop.svg";
import Grid from "../Src/function/Grid";

const FullScreenPage = () => {
  const { itemId } = useContext(TeamDel);

  const {
    isMike,
    setIsMike,
    isCamera,
    setIsCamera,
    FullScreen,
    setFullScreen,
    meetingEnd,
    setMeetingEnd,
  } = useContext(UseStateContext);

  const { setIsListening } = useContext(DiscordContext);

  const [peopleCount, setPeopleCount] = useState(0);

  const gridStyle = {
    display: "grid",
    placeItems: "center",
    gridTemplateColumns: `repeat(${peopleCount}, 1fr)`,
    gap: "10px",
  };

  const onClickFull = () => {
    if (FullScreen) setFullScreen((preState) => !preState);
  };

  const onClickMike = () => {
    console.log("ddd", isCamera);
    console.log("sss", isMike);
    if (!isCamera) {
      setIsMike((preState) => !preState);
    }
    setIsListening((preState) => !preState);
  };

  const onClickCamera = () => {
    setIsCamera((preState) => !preState);
    if (!isMike) {
      setIsMike((preState) => !preState);
    }
  };

  const onClickMeetingEnd = () => {
    if (!meetingEnd) {
      setMeetingEnd((preState) => !preState);
      setFullScreen((preState) => !preState);
    }
  };

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isModalStart, setIsModalStart] = useState(false);
  const [isMettingStop, setIsMettingStop] = useState(false);

  const openModalStop = () => setIsModalOpen(true);
  const closeModal = () => setIsModalOpen(false);

  const openModalStart = () => setIsModalStart(true);
  const IsCloseModal = () => setIsModalStart(false);

  return (
    <div className="FullScreen">
      <div
        className="FullScreen-main"
        style={{ backgroundColor: color.GrayScale[8], ...gridStyle }}
      >
        <Grid />
      </div>
      <div
        className="FullScreen-foot"
        style={{ backgroundColor: color.GrayScale[0] }}
      >
        {itemId % 2 === 0 ? (
          <>
            <div className="FullScreen-foot-Metting">
              <img
                src={isMettingStop ? MettingStop : MettingStart}
                //녹음을 끊는다면 주는 값을 다르게 주어 녹음을 끊었다는것을 알아야한다
                onClick={isMettingStop ? openModalStart : openModalStop}
                style={{ width: "50%" }}
              />
              <img src={DisAlarm} style={{ width: "50%" }} />
            </div>
          </>
        ) : (
          ""
        )}
        <div className="FullScreen-foot-src-main">
          <div className="FullScreen-foot-src">
            <img src={isMike ? Mike : NoMike} onClick={onClickMike} />
            <img src={isCamera ? Camera : NoCamera} onClick={onClickCamera} />
            <img src={XFullScreen} onClick={onClickFull} />
          </div>
          <div className="FullScreen-foot-exit">
            <img src={Exit} onClick={onClickMeetingEnd} />
          </div>
        </div>
      </div>
      {isModalStart && (
        <ModalStart
          onClose={IsCloseModal}
          setIsMettingStop={setIsMettingStop}
        />
      )}
      {isModalOpen && (
        <ModalStop onClose={closeModal} setIsMettingStop={setIsMettingStop} />
      )}
    </div>
  );
};

export default FullScreenPage;
