import { useNavigate } from "react-router-dom";
import { useState } from "react";
import Logo from "../../../svg/logo.svg";
import { typography } from "../../../fonts/fonts";
import * as S from "./loginStyle.jsx";
import Input from "../SignUpLoginComponent/input.jsx";
import background from "../../../svg/background.svg";
import { color } from "../../../style/color.jsx";
import { PassWord } from "../SignUpLoginComponent/password.jsx";
import Email from "../SignUpLoginComponent/email.jsx";
import { instance } from "../../../apis/instance.jsx";

const Login = () => {
  const passwordRegEx = /^(?=.*[!@#$%^&*])(?=.{8,20}$).*/;
  const navigate = useNavigate();

  const passwordChecking = (password) => {
    if (!password.match(passwordRegEx)) {
      console.log("비밀번호 형식을 확인해주세요");
      return;
    }
    console.log("비밀번호 형식이 맞습니다");
  };

  const SignUpNavClick = () => {
    const navigate = useNavigate();
    navigate("/signup");
  };

  const [inputs, setInputs] = useState({
    email: "",
    password: "",
  });

  const { email, password } = inputs;

  const onChange = (e) => {
    const { value, name } = e.target;
    setInputs({
      ...inputs,
      [name]: value,
    });

    if (name === "password") {
      passwordChecking(value);
    }
  };

  const apiLogIn = async () => {
    try {
      console.log("로그인 요청 시작:", email, password);

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
        navigate("/"); //ㅁㅇ님 페이지로 이동~~
      } else {
        console.error("accessToken 없음, 응답 확인 필요:", response.data);
      }
    } catch (error) {
      console.error("로그인 실패:", error);
      if (error.response) {
        console.log("서버 응답:", error.response.data);
      } else {
        console.log("오류 발생:", error.message);
      }
    }
  };

  console.log(inputs);

  return (
    <>
      <S.Container>
        <img src={background} />
        <S.LogoContainer>
          <img src={Logo} alt="Logo" />
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
