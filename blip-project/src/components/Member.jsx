import "./CSS/Member.css";
import { color } from "../style/color";
import { typography } from "../fonts/fonts";
import MemberSVG from "../svg/member.svg";

const Member = () => {
  return (
    <div className="member">
      <div className="member-header">
        <div
          className="member-header-TeamName"
          style={{ ...typography.Title3, "--main-400": color.Main[4] }}
        >
          Team Blip
        </div>
        <div className="member-header-member">
          <img src={MemberSVG}/>
        </div>
      </div>
      <div className="member-name"></div>
    </div>
  );
};

export default Member;
