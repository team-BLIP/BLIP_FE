import { color } from "../../../../style/color";
import { typography } from "../../../../fonts/fonts";
import ESC from "../../../../svg/ESC.svg";
import Id from "../../../SignUpLogin/id";
import { useState } from "react";

const EmailChangeModal2 = ({ message, onConfirm, onCancel, onChange }) => {
  const [email, setEmail] = useState("");
  const handleChange = (value) => {
    setEmail(value);
    onChange(value);
  };
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
            marginTop: "40px",
            marginBottom: "8px",
          }}
        >
          {message}
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
                marginTop: "2px",
              }}
            >
              이메일
            </p>
            <input
              type="email"
              placeholder="이메일 주소를 입력하세요."
              onChange={(e) => handleChange(e.target.value)}
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
              backgroundColor: color.Main[2],
              color: color.White,
              font: typography.Button0,
              marginTop: "280px",
            }}
            onClick={onConfirm} //API 연동하깅, 연동 성공하면 ~가 성공했어요~!! 다른 화면 뜨게 하기
          >
            변경하기
          </button>
        </div>
      </div>
    </div>
  );
};

export default EmailChangeModal2;
