import "../../../CSS/Feedback.css";
import PropTypes from "prop-types";
import { typography } from "../../../../fonts/fonts";
import { color } from "../../../../style/color";

const Feedback = ({ message, isEmpty = true }) => {
  return (
    <>
      <div className="Feedback-p-font">
        <p style={{ ...typography.Header3, color: color.GrayScale[4] }}>
          {isEmpty ? message || "아직 받은 피드백이 없어요" : message}
        </p>
      </div>
    </>
  );
};

Feedback.prototype = {
  message: PropTypes.string,
  isEmpty: PropTypes.bool,
};

export default Feedback;
