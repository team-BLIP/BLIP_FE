import { color } from "../../../../style/color";
import { typography } from "../../../../fonts/fonts";
import ESC from "../../../../svg/ESC.svg";
const ImageChangeModal = ({ message, onConfirm, onCancel }) => {
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
          width: "1110px",
          height: "740px",
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
            ...typography.Label2_46,
            color: color.GrayScale[8],
            marginLeft: "24px",
            marginTop: "32px",
            marginBottom: "8px",
          }}
        >
          {message}
        </p>
        <div
          style={{
            width: "1040px",
            height: "400px",
            backgroundColor: color.GrayScale[0],
            margin: "0 auto",
            marginTop: "80px",
          }}
        ></div>

        <div
          style={{
            marginTop: "64px",
            marginLeft: "24px",
          }}
        >
          <button
            style={{
              width: "107px",
              height: "48px",
              borderRadius: "12px",
              border: "none",
              backgroundColor: color.Main[4],
              color: color.White,
              font: typography.Button0,
              marginTop: "24px",
              marginLeft: "940px",
            }}
            onClick={onConfirm} //API 연동하깅, 연동 성공하면 다른 화면 뜨게 하기
          >
            변경
          </button>
        </div>
      </div>
    </div>
  );
};

export default ImageChangeModal;
