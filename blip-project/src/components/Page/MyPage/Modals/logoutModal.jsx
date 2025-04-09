import { color } from "../../../../style/color";
import { typography } from "../../../../fonts/fonts";
import ESC from "../../../../svg/ESC.svg";
const LogoutModal = ({ message, onConfirm, onCancel }) => {
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
          height: "300px",
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
          }}
        >
          언제든지 다시 로그인할 수 있습니다!
        </p>
        <div
          style={{
            marginTop: "64px",
            marginLeft: "24px",
          }}
        >
          <button
            style={{
              width: "512px",
              height: "68px",
              borderRadius: "12px",
              border: "none",
              backgroundColor: color.Main[4],
              color: color.White,
              font: typography.Button0,
              marginTop: "24px",
            }}
            onClick={onConfirm} //API 연동하깅, 연동 성공하면 다른 화면 뜨게 하기
          >
            로그아웃
          </button>
        </div>
      </div>
    </div>
  );
};

export default LogoutModal;
