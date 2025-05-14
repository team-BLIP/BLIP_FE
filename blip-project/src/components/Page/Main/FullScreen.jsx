import "../../CSS/FullScreen.css";
import { color } from "../../../style/color";
import { useContext, useState, useCallback, useMemo } from "react";
import { TeamDel } from "./Main";
import ModalStart from "../Modal/ModalStart";
import ModalStop from "../Modal/ModalStop";
import Exit from "../../../svg/Exit.svg";
import XFullScreen from "../../../svg/XFullScreen.svg";
import DisAlarm from "../../../svg/DisAlarm.svg";
import NoMike from "../../../svg/NoMike.svg";
import NoCamera from "../../../svg/NoCamera.svg"
import Mike from "../../../svg/Mike.svg";
import Camera from "../../../svg/DisCamera.svg";
import MettingStart from "../../../svg/MettingStart.svg";
import MettingStop from "../../../svg/MettingStop.svg";
import JitsiMeet from "../Src/function/jitsiMeetMain";
import { useAppState, useDiscord } from "../../../contexts/AppContext";

const FullScreenPage = () => {
  const { itemId } = useContext(TeamDel);
  const {
    isMike,
    setIsMike,
    isCamera,
    setIsCamera,
    meetingEnd,
    setMeetingEnd,
    setFullScreen,
  } = useAppState();
  
  const { setIsListening } = useDiscord();
  
  const [modalState, setModalState] = useState({
    isModalOpen: false,
    isModalStart: false,
  });
  const [isMettingStop, setIsMettingStop] = useState(false);

  // 모달 상태 업데이트 핸들러
  const updateModalState = useCallback((key, value) => {
    setModalState(prev => ({ ...prev, [key]: value }));
  }, []);

  // 미디어 제어 핸들러
  const mediaHandlers = useMemo(() => ({
    onClickMike: () => {
      setIsMike(prev => !prev);
      setIsListening(prev => !prev);
    },
    onClickCamera: () => setIsCamera(prev => !prev),
    onClickFull: () => setFullScreen(prev => !prev),
    onClickMeetingEnd: () => {
      if (!meetingEnd) {
        setMeetingEnd(true);
        setFullScreen(false);
      }
    }
  }), [setIsMike, setIsListening, setIsCamera, setFullScreen, setMeetingEnd, meetingEnd]);

  // 모달 제어 핸들러
  const modalHandlers = useMemo(() => ({
    openModalStop: () => updateModalState('isModalOpen', true),
    closeModal: () => updateModalState('isModalOpen', false),
    openModalStart: () => updateModalState('isModalStart', true),
    closeModalStart: () => updateModalState('isModalStart', false)
  }), [updateModalState]);

  return (
    <div className="FullScreen">
      <div
        className="FullScreen-main"
        style={{ backgroundColor: color.GrayScale[8] }}
      >
        <JitsiMeet setIsMettingStop={setIsMettingStop} />
      </div>
      <div
        className="FullScreen-foot"
        style={{ backgroundColor: color.GrayScale[0] }}
      >
        {itemId % 2 === 0 && (
            <div className="FullScreen-foot-Metting">
              <img
                src={isMettingStop ? MettingStop : MettingStart}
              onClick={isMettingStop ? modalHandlers.openModalStart : modalHandlers.openModalStop}
                style={{ width: "50%" }}
              />
              <img src={DisAlarm} style={{ width: "50%" }} />
            </div>
        )}
        <div className="FullScreen-foot-src-main">
          <div className="FullScreen-foot-src">
            <img src={isMike ? Mike : NoMike} onClick={mediaHandlers.onClickMike} />
            <img src={isCamera ? Camera : NoCamera} onClick={mediaHandlers.onClickCamera} />
            <img src={XFullScreen} onClick={mediaHandlers.onClickFull} />
          </div>
          <div className="FullScreen-foot-exit">
            <img src={Exit} onClick={mediaHandlers.onClickMeetingEnd} />
          </div>
        </div>
      </div>
      {modalState.isModalStart && (
        <ModalStart
          onClose={modalHandlers.closeModalStart}
          setIsMettingStop={setIsMettingStop}
        />
      )}
      {modalState.isModalOpen && (
        <ModalStop 
          onClose={modalHandlers.closeModal} 
          setIsMettingStop={setIsMettingStop} 
        />
      )}
    </div>
  );
};

export default FullScreenPage;
