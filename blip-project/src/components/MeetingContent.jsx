import "./CSS/MeetingContent.css";
import { typography } from "../fonts/fonts";
import { color } from "../style/color";

const MeetingContent = () => {
  return (
    <div className="meeting-content">
      <div className="meeting-content-main" style={typography.Header3}>
        아직 기록된 회의 내용이 없어요
      </div>
    </div>
  );
};

export default MeetingContent;
