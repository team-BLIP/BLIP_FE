import { useNavigate } from "react-router-dom";
import { useState } from "react";
import Logo from "../../svg/logo.svg";
import { typography } from "../../fonts/fonts";
import * as S from "./loginStyle.jsx";
import Input from "../../components/SignUp, Login/input.jsx";
import backgroundImg from "../../svg/backgroundImg (5).svg";
import { color } from "../../style/color.jsx";
import { PassWord } from "../../components/SignUp, Login/password.jsx";
import { Email } from "../../components/SignUp, Login/email.jsx";

const Login = () => {
  const passwordRegEx = /^(?=.*[!@#$%^&*])(?=.{8,20}$).*/;

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

  console.log(inputs);

  return (
    <>
      <S.Container>
        <img src={backgroundImg} />
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
          <S.LoginButton>로그인</S.LoginButton>
        </S.Main>
        <S.Link style={typography.Button0}>
          계정이 없다면?{" "}
          <a href="#" style={{ ...typography.Button0, color: color.Main[4] }}>
            가입하기
          </a>
        </S.Link>
      </S.Container>
    </>
  );
};

export default Login;
