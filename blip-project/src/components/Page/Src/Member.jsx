import "../../CSS/Member.css";
import { color } from "../../../style/color";
import { typography } from "../../../fonts/fonts";
import { useContext, useState } from "react";
import { TeamDel } from "../Main/Main";
import { UseStateContext } from "../../../Router";
import { FindId } from "../Main/Main";
import MemberSVG from "../../../svg/member.svg";
import Setting from "../../../svg/setting.svg";
import Plus from "../../../svg/plus.svg";

const Member = ({ filterId }) => {
  const { itemId, image } = useContext(TeamDel) || {};
  const {
    setSetting,
    isAlarm,
    setIsAlarm,
    isLetter,
    setIsLetter,
    isFeedback,
    setIsFeedback,
    isKeyword,
    setIsKeyword,
  } = useContext(UseStateContext);
  const { targetId, setTargetId } = useContext(FindId);

  const onClickSetting = () => {
    setSetting((preState) => !preState);
    if (itemId !== targetId && image) setTargetId(null,"dafmiaubihsjkf") 
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

  return (
    <>
      <div className="member">
        <div className="member-header">
          {(itemId % 2 === 0 || filterId % 2 === 0) && itemId !== 0 ? (
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
                <img src={Plus} />
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
        <div className="member-name"></div>
      </div>
    </>
  );
};

export default Member;
