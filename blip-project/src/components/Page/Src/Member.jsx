import "../../CSS/Member.css";
import { color } from "../../../style/color";
import { typography } from "../../../fonts/fonts";
import { useContext, useState } from "react";
import { TeamDel } from "../Main/Main";
import { FindId } from "../Main/Main";
import { useAppState } from "../../../contexts/AppContext";
import ModalMember from "../Modal/modalMember";
import MemberSVG from "../../../svg/member.svg";
import Setting from "../../../svg/setting.svg";
import Plus from "../../../svg/plus.svg";
import MemberAdd from "./function/MemberAdd";

const Member = () => {
  const { itemId, image } = useContext(TeamDel) || {};
  const {
    setSetting,
    setting,
    isAlarm,
    setIsAlarm,
    isLetter,
    setIsLetter,
    isFeedback,
    setIsFeedback,
    isKeyword,
    setIsKeyword,
    basic,
    discord,
    join,
  } = useAppState();

  console.log("dasdadsaasd",{
    setSetting,
    setting,
    isAlarm,
    setIsAlarm,
    isLetter,
    setIsLetter,
    isFeedback,
    setIsFeedback,
    isKeyword,
    setIsKeyword,
    basic,
    discord,
    join,
  });

  const { targetId, setTargetId, createTeamId } = useContext(FindId);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const openModal = () => setIsModalOpen(true);
  const closeModal = () => setIsModalOpen(false);

  const onClickSetting = () => {
    setSetting((preState) => !preState);
    if (itemId !== targetId && image) setTargetId(null, "dafmiaubihsjkf");
    console.log(targetId);
    if (isAlarm === true) {
      setIsAlarm((preState) => !preState);
    } else if (isLetter === true) {
      setIsLetter((preState) => !preState);
    } else if (isFeedback === true) {
      setIsFeedback((preState) => !preState);
    } else if (isKeyword === true) {
      setIsKeyword((preState) => !preState);
    }
  };

  // StartTeamJoinNo가 아니면서 동시에 팀 ID에 'create-'가 붙어있을 때만 Setting 이미지 표시
  // StartTeamJoinNo는 setting, isAlarm, isLetter, discord, basic, join이 모두 false일 때 표시됨
  const isStartTeamJoinNo =
    !setting && !isAlarm && !isLetter && !discord && !basic && !join;
  const showSettingIcon =
    !isStartTeamJoinNo && createTeamId && createTeamId.startsWith("create-");

  return (
    <>
      <div className="member">
        <div className="member-header">
          {showSettingIcon ? (
            <>
              <div
                className="member-header-TeamName-owner"
                style={{ ...typography.Title3, "--main-400": color.Main[4] }}
              >
                Team Blip
                <img src={Setting} onClick={onClickSetting} />
              </div>
              <div className="member-header-member-owner">
                <img src={MemberSVG} />
                <img src={Plus} onClick={openModal} />
              </div>
            </>
          ) : (
            <>
              <div
                className="member-header-TeamName"
                style={{ ...typography.Title3, "--main-400": color.Main[4] }}
              >
                Team Blip
              </div>
              <div className="member-header-member">
                <img src={MemberSVG} />
              </div>
            </>
          )}
        </div>
        {/* StartTeamJoinNo 페이지일 때는 멤버 이름 목록을 표시하지 않음 */}
        {!isStartTeamJoinNo && (
          <div className="member-name">
            <MemberAdd />
          </div>
        )}
      </div>
      {isModalOpen && <ModalMember onClose={closeModal} />}
    </>
  );
};

export default Member;
