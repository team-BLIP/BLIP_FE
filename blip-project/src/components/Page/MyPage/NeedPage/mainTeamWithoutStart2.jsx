import "../../../CSS/MainTeam.css";
import DateTeam from "../../Src/DateTeam";
import HeaderTeam from "../../Src/page/HeaderTeam";
import SidebarTeam from "../../Src/sidebarTeam";
import MeetingTeam from "../../Src/MeetingTeam";
import Profiles2 from "../Profiles/profile2";
import Feedback from "../../Src/page/Feedback";
import { color } from "../../../../style/color";
import { typography } from "../../../../fonts/fonts";

const MainTeamWithoutStart2 = () => {
  return (
    <>
      <HeaderTeam />
      <div className="Main-Team">
        <SidebarTeam />
        <div className="Line">
          <Profiles2 />
          <div className="NoFeedBack">
            <p
              className="FeedBackTitle"
              style={{ ...typography.Body2, color: color.GrayScale[6] }}
            >
              회의 피드백
            </p>
            <Feedback />
          </div>
        </div>
        <div className="Main-Team-Date">
          <DateTeam />
          <MeetingTeam />
        </div>
      </div>
    </>
  );
};

export default MainTeamWithoutStart2;
