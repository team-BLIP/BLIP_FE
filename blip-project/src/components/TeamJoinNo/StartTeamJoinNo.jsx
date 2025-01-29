import "./StartTeamJoinNo.css";
import Popup from "./Popup";
import { typography } from "../../fonts/fonts";
import { color } from "../../style/color";

const StartTeamJoinNo = () => {
  const onClickPopup = () =>{
    window.open(
      "Popup.jsx",
      "new",
      "width = 70%, height=300, top = 100, left = 100"
    );
  }
  return (
    <>
      <div className="StartTeamJoinNos">
        <div className="STJoinNoMain">
          <div className="STJoinNoLink">
            <div className="STJoinNoFont">
              <p style={typography.Header1}>팀을 꾸리거나 팀에 참여하세요!</p>
              <p style={typography.Header3}>초대받은 팀의 코드를 입력하세요!</p>
            </div>
            <input
              className="STJoinNoInput"
              style={{
                ...typography.Header3,
                "--gray-200": color.GrayScale[3],
              }}
              placeholder="링크 주소를 입력하세요."
            />
          </div>
          <button
            className="STJoinNoButton"
            onClick={onClickPopup}
            style={{
              ...typography.Button0,
              "--main-400": color.Main[4],
              "--white": color.White,
            }}
          >
            시작하기
          </button>
        </div>
      </div>
    </>
  );
};

export default StartTeamJoinNo;
