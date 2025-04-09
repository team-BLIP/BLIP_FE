import { color } from "../../../../style/color";
import { typography } from "../../../../fonts/fonts";
import ESC from "../../../../svg/ESC.svg";
const KillModal = ({ message, onConfirm, onCancel }) => {
  return (
    <div
      style={{
        position: "fixed",
        top: 0,
        left: 0,
        width: "100vw",
        height: "100vh",
        backgroundColor: "rgba(0, 0, 0, 0.4)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        zIndex: 9999,
      }}
    >
      <div
        style={{
          background: "white",
          borderRadius: "12px",
          textAlign: "left",
          width: "560px",
          height: "578px",
          position: "relative",
        }}
      >
        <img
          src={ESC}
          onClick={onCancel}
          style={{
            position: "absolute",
            top: "32px",
            right: "32px",
            cursor: "pointer",
          }}
        />
        <p
          style={{
            ...typography.Title1,
            color: color.GrayScale[8],
            marginLeft: "24px",
            marginTop: "32px",
            marginBottom: "8px",
          }}
        >
          {message}
        </p>
        <p
          style={{
            ...typography.Body2,
            color: color.GrayScale[6],
            marginLeft: "24px",
            marginBottom: "12px",
          }}
        >
          탈퇴를 위해서는 비밀번호 입력이 필요해요!
        </p>
        <div
          style={{
            marginTop: "32px",
            marginLeft: "24px",
          }}
        >
          <div>
            <p
              style={{
                ...typography.Body1,
                color: color.GrayScale[5],
                marginBottom: "8px",
              }}
            >
              비밀번호
            </p>
            <input
              type="text"
              placeholder="비밀번호를 입력하세요."
              style={{
                borderRadius: "12px",
                width: "512px",
                height: "50px",
                textIndent: "20px",
              }}
            />
          </div>
          <button
            style={{
              width: "512px",
              height: "68px",
              borderRadius: "12px",
              border: "none",
              backgroundColor: color.Error[3],
              color: color.White,
              font: typography.Button0,
              marginTop: "260px",
            }}
            onClick={onConfirm} //API 연동하깅, 연동 성공하면 다른 화면 뜨게 하기
          >
            회원탈퇴
          </button>
        </div>
      </div>
    </div>
  );
};

export default KillModal;
