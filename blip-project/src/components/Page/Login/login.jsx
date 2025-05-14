import { useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import BlipLogo from "../../../svg/BlipLogo.svg";
import { typography } from "../../../fonts/fonts";
import * as S from "./loginStyle.jsx";
import background from "../../../svg/background.svg";
import { color } from "../../../style/color.jsx";
import { PassWord } from "../SignUpLoginComponent/password.jsx";
import Email from "../SignUpLoginComponent/email.jsx";
import { instance } from "../../../apis/instance.jsx";
import backgroundImg from "../../../svg/backrgroundImg.png";

const Login = () => {
  const passwordRegEx = /^(?=.*[!@#$%^&*])(?=.{8,20}$)/; // Fixed regex
  const navigate = useNavigate();

  /* useEffect(() => {
    if (import.meta.env.DEV) {
      console.log("환경 변수 확인 (useEffect 내부):", {
        VITE_USER_BASE_URL: import.meta.env.VITE_USER_BASE_URL,
      });
    }
  }, []); */

  const [errorMessage, setErrorMessage] = useState("");
  const [inputs, setInputs] = useState({
    email: "",
    password: "",
  });

  const { email, password } = inputs;

  const passwordChecking = (password) => {
    if (!password.match(passwordRegEx)) {
      setErrorMessage("비밀번호는 특수문자를 포함한 8~20자로 입력해주세요.");
      return false;
    }
    setErrorMessage("");
    return true;
  };

  const onChange = (e) => {
    const { value, name } = e.target;
    setInputs({
      ...inputs,
      [name]: value,
    });

    if (name === "password" && value) {
      passwordChecking(value);
    }
  };

  const apiLogIn = async () => {
    if (!email) {
      setErrorMessage("이메일을 입력해주세요.");
      return;
    }

    if (!password) {
      setErrorMessage("비밀번호를 입력해주세요.");
      return;
    }

    if (!passwordChecking(password)) {
      return;
    }

    try {
      console.log("로그인 요청 시작:", email);

      const data = { email, password };

      const response = await instance.post("/users/login", data, {
        headers: {
          "Content-Type": "application/json",
        },
      });

      console.log("로그인 성공:", response.data);

      const accessToken = response.data?.access_token;
      if (accessToken) {
        localStorage.setItem("accessToken", accessToken);
        console.log("accessToken 저장 완료:", accessToken);
        navigate("/");
      } else {
        setErrorMessage("로그인에 실패했습니다. 다시 시도해주세요.");
        console.error("accessToken 없음, 응답 확인 필요:", response.data);
      }
    } catch (error) {
      console.error("로그인 실패:", error);
      if (error.response) {
        const status = error.response.status;
        if (status === 404) {
          setErrorMessage(
            "API 경로를 찾을 수 없습니다. 서버 설정을 확인해주세요."
          );
        } else if (status === 401) {
          setErrorMessage("이메일 또는 비밀번호가 일치하지 않습니다.");
        } else {
          setErrorMessage("로그인에 실패했습니다. 다시 시도해주세요.");
        }
        console.log("서버 응답:", error.response.data);
      } else {
        setErrorMessage(
          "서버에 연결할 수 없습니다. 네트워크 상태를 확인해주세요."
        );
        console.log("오류 발생:", error.message);
      }
    }
  };

  return (
    <>
      <S.BackgroundImage src={backgroundImg} alt="Background" />
      <S.Container>
        <S.LogoContainer>
          <img src={BlipLogo} alt="Logo" />
          <span style={typography.Label1}>BLIP</span>
        </S.LogoContainer>
        <S.Texts style={typography.Header1}>
          효율적인 회의의 시작, <br />
          BLIP에 로그인하세요!
        </S.Texts>
        <S.Main>
          <div>
            <p style={{ ...typography.Body1, color: color.GrayScale[5] }}>
              이메일
            </p>
            <Email
              value={email}
              onChange={onChange}
              name="email"
              placeholder="이메일 주소를 입력하세요."
            />
          </div>
          <div>
            <p style={{ ...typography.Body1, color: color.GrayScale[5] }}>
              비밀번호
            </p>
            <PassWord
              value={password}
              onChange={onChange}
              name="password"
              showEye="none"
              placeholder="비밀번호를 입력하세요."
            />
          </div>
          {errorMessage && (
            <p
              style={{
                ...typography.Body2,
                color: "#FF4D4F",
                marginTop: "8px",
                marginBottom: "0",
              }}
            >
              {errorMessage}
            </p>
          )}
          <S.LoginButton onClick={apiLogIn}>로그인</S.LoginButton>
        </S.Main>
        <S.Link style={typography.Button0}>
          계정이 없다면?{" "}
          <span
            onClick={() => navigate("/users/signup")}
            style={{ ...typography.Button0, color: color.Main[4] }}
          >
            가입하기
          </span>
        </S.Link>
      </S.Container>
    </>
  );
};

export default Login;
