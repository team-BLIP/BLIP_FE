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
          padding: "32px",
          borderRadius: "12px",
          textAlign: "center",
          minWidth: "300px",
          width: "560px",
          height: "300px",
        }}
      >
        <img src={ESC} onClick={onCancel} />
        <p style={{ ...typography.Title1, color: color.GrayScale[8] }}>
          {message}
        </p>
        <p style={{ ...typography.Body2, color: color.GrayScale[6] }}>
          언제든지 다시 로그인할 수 있습니다!
        </p>
        <div style={{ display: "flex", justifyContent: "center", gap: "16px" }}>
          <button onClick={onConfirm}>확인</button>
        </div>
      </div>
    </div>
  );
};

export default LogoutModal;
