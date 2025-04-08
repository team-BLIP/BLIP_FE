import { color } from "../../../../style/color";
import { typography } from "../../../../fonts/fonts";
import ESC from "../../../../svg/ESC.svg";
import { useState } from "react";
import Timer from "../../../SignUpLogin/timer";
const EmailChangeModal = ({ message, onConfirm, onCancel, onChange }) => {
  const [email, setEmail] = useState("");
  const [count, setCount] = useState(180);
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
          borderRadius: "24px",
          textAlign: "left",
          width: "672px",
          height: "808px",
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
            marginTop: "76px",
            marginBottom: "8px",
            textAlign: "center",
          }}
        >
          {message}
        </p>
        <p
          style={{
            ...typography.Body2,
            color: color.GrayScale[7],
            marginLeft: "24px",
            marginBottom: "40px",
            textAlign: "center",
            marginTop: "32px",
          }}
        >
          보안을 위해 이메일로 발송된 6자리 인증 번호를 입력해 주세요. <br />
          3분 내로 입력하지 않으면 만료될 수 있으니 유의하시기 바랍니다.
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
                marginLeft: "60px",
              }}
            >
              인증번호
            </p>
            <input
              type="number"
              placeholder="인증번호를 입력하세요."
              onChange={(e) => handleChange(e.target.value)}
              style={{
                borderRadius: "12px",
                width: "512px",
                height: "50px",
                textIndent: "20px",
                marginLeft: "60px",
              }}
            />
          </div>
          <Timer count={count} setCount={setCount} />
          <button
            style={{
              width: "512px",
              height: "68px",
              borderRadius: "12px",
              border: "none",
              backgroundColor: color.Main[2],
              color: color.White,
              font: typography.Button0,
              marginTop: "300px",
              marginLeft: "60px",
            }}
            onClick={onConfirm} //API 연동하깅, 연동 성공하면 다른 화면 뜨게 하기
          >
            확인
          </button>
        </div>
      </div>
    </div>
  );
};

export default EmailChangeModal;
