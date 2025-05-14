import { color } from "../../../style/color";
import { typography } from "../../../fonts/fonts";

const Timer = ({ count }) => {
  const formatTime = (time) => {
    const minutes = Math.floor(time / 60);
    const seconds = time % 60;
    return `${minutes}:${seconds < 10 ? `0${seconds}` : seconds}`;
  };

  return (
    <div
      style={{
        ...typography.Button1,
        color: color.Main[4],
        display: "flex",
        alignItems: "center",
        gap: "10px",
        marginRight: "-40px",
      }}
    >
      {count > 0 ? `${formatTime(count)}` : "시간 초과"}
    </div>
  );
};

export default Timer;
