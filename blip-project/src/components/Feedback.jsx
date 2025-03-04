import "./CSS/Feedback.css";
import { typography } from "../fonts/fonts";
import { color } from "../style/color";

const Feedback = () => {
  return (
    <>
      <div className="Feedback-p-font">
        <p style={{ ...typography.Header3, color: color.GrayScale[4] }}>
          아직 받은 피드백이 없어요
        </p>
      </div>
    </>
  );
};
export default Feedback;
