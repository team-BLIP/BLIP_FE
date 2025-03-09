import "../../../CSS/Keyword.css";
import { typography } from "../../../../fonts/fonts";
import { color } from "../../../../style/color";

const Keyword = () => {
  return (
    <>
      <div className="keyword-p-font">
        <p style={{ ...typography.Header3, color: color.GrayScale[4] }}>
          아직 받은 회의 일정 및 키워드 요약이 없어요
        </p>
      </div>
    </>
  );
};

export default Keyword;
