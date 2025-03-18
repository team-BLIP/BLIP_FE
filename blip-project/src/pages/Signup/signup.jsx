import { Link, useNavigate } from "react-router-dom";
import { useState, useEffect, useRef } from "react";
import Logo from "../../svg/logo.svg";
import { typography } from "../../fonts/fonts";
import * as S from "./signupStyle.jsx";
import Input from "../../components/SignUp, Login/input.jsx";
import backgroundImg from "../../svg/backgroundImg (5).svg";
import { color } from "../../style/color.jsx";
import { PassWord } from "../../components/SignUp, Login/password.jsx";
import { Email } from "../../components/SignUp, Login/email.jsx";
import Id from "../../components/SignUp, Login/id.jsx";
import { PasswordCheck } from "../../components/SignUp, Login/passwordCheck.jsx";
import modalX from "../../svg/modalX.svg";
import axios from "axios";
import apiSignUp from "../../apis/apiSignUp.jsx";

const Signup = () => {
  const passwordRegEx = /^(?=.*[!@#$%^&*])(?=.{8,20}$).*/;

  const [inputs, setInputs] = useState({
    id: "",
    email: "",
    password: "",
    passwordCheck: "",
  });

  const { id, email, password, passwordCheck } = inputs;
  const [timeLeft, setTimeLeft] = useState(180);
  const [code, setCode] = useState(["", "", "", "", "", ""]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const inputRefs = useRef([]);
  const [idErrorMessage, setIdErrorMessage] = useState("");
  const [emailErrorMessage, setEmailErrorMessage] = useState("");
  const [passwordErrorMessage, setPasswordErrorMessage] = useState("");

  const [isCodeValid, setIsCodeValid] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    if (!isModalOpen) {
      setTimeLeft(180);
      return;
    }

    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [isModalOpen]);

  useEffect(() => {
    if (password) {
      const hasKorean = /[ㄱ-ㅎ|ㅏ-ㅣ|가-힣]/.test(password);
      const isValid = passwordRegEx.test(password);

      if (hasKorean || !isValid) {
        setPasswordErrorMessage("비밀번호 - 유효하지 않은 비밀번호입니다.");
      } else {
        setPasswordErrorMessage("");
      }
    }
  }, [password]);

  const formatTime = (seconds) => {
    const minutes = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${minutes}:${secs < 10 ? `0${secs}` : secs}`;
  };

  const handleResend = () => {
    setTimeLeft(180);
    setCode(["", "", "", "", "", ""]);
    setIsCodeValid(true);
  };

  const handleInputChange = (index, value) => {
    if (!/^\d?$/.test(value)) return;
    const newCode = [...code];
    newCode[index] = value;
    setCode(newCode);

    if (value && index < inputRefs.current.length - 1) {
      inputRefs.current[index + 1].focus();
    }
  };

  const onChange = (e) => {
    const { value, name } = e.target;
    setInputs((prev) => ({ ...prev, [name]: value }));

    if (name === "id") {
      const hasKorean = /[ㄱ-ㅎ|ㅏ-ㅣ|가-힣]/.test(value);
      if (hasKorean) {
        setIdErrorMessage("아이디 - 유효하지 않은 아이디입니다.");
      } else {
        setIdErrorMessage("");
      }
    }

    if (name === "email") {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(value)) {
        setEmailErrorMessage("이메일 - 유효하지 않은 이메일입니다.");
      } else {
        setEmailErrorMessage("");
      }
    }
  };

  const handleSignup = async () => {
    try {
      const userData = { id, email, password };
      const result = await apiSignUp(userData);
      alert("회원가입 성공!");
      navigate("/login");
    } catch (error) {
      alert(`회원가입 실패: ${error}`);
    }
  };

  const handleLoginClick = () => {
    let isValid = true;

    if (!id || !email || !password || !passwordCheck) {
      if (!email) setEmailErrorMessage("이메일을 입력해주세요.");
      if (!id) setIdErrorMessage("아이디를 입력해주세요.");
      if (!password) setPasswordErrorMessage("비밀번호를 입력해주세요.");
      isValid = false;
    }

    if (passwordErrorMessage) {
      isValid = false;
    }

    if (passwordCheck && password !== passwordCheck) {
      isValid = false;
    }

    if (!isValid) return;

    handleSignup();
  };

  const handleVerification = () => {
    const correctCode = "123456";
    if (code.join("").trim() !== correctCode) {
      setIsCodeValid(false);
    } else {
      setIsCodeValid(true);
      navigate("/success");
    }
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setCode(["", "", "", "", "", ""]);
    setIsCodeValid(true);
  };

  return (
    <>
      <S.Container>
        <img src={backgroundImg} />
        <S.LogoContainer>
          <img src={Logo} alt="Logo" />
          <span style={typography.Label1}>BLIP</span>
        </S.LogoContainer>
        <S.Texts style={typography.Header1}>계정 생성</S.Texts>
        <S.Main>
          <div>
            <p
              style={{
                ...typography.Body1,
                color: idErrorMessage ? color.Error[0] : color.GrayScale[5],
              }}
            >
              {idErrorMessage || "아이디"}
            </p>
            <Id
              value={id}
              onChange={onChange}
              name="id"
              placeholder="아이디를 입력하세요."
            />
          </div>
          <div>
            <p
              style={{
                ...typography.Body1,
                color: emailErrorMessage ? color.Error[0] : color.GrayScale[5],
              }}
            >
              {emailErrorMessage || "이메일"}
            </p>
            <Email
              value={email}
              onChange={onChange}
              name="email"
              placeholder="이메일 주소를 입력하세요."
            />
          </div>
          <div>
            <p
              style={{
                ...typography.Body1,
                color: passwordErrorMessage
                  ? color.Error[0]
                  : color.GrayScale[5],
              }}
            >
              {passwordErrorMessage || "비밀번호"}
            </p>
            <PassWord
              value={password}
              onChange={onChange}
              name="password"
              showEye="visible"
              placeholder="비밀번호를 입력하세요."
            />
          </div>
          <div>
            <p
              style={{
                ...typography.Body1,
                color:
                  passwordCheck && password !== passwordCheck
                    ? color.Error[0]
                    : color.GrayScale[5],
              }}
            >
              {passwordCheck && password !== passwordCheck
                ? "비밀번호가 일치하지 않습니다."
                : "비밀번호 확인"}
            </p>
            <PasswordCheck
              value={passwordCheck}
              onChange={onChange}
              name="passwordCheck"
              password={password}
              showEye="visible"
              placeholder="비밀번호를 한번 더 입력하세요."
            />
          </div>

          <S.LoginButton onClick={handleLoginClick}>로그인</S.LoginButton>
        </S.Main>
        <S.Link style={typography.Button0}>
          계정이 있다면?{" "}
          <Link
            to="/login"
            style={{
              ...typography.Button0,
              color: timeLeft <= 60 ? color.Error[0] : color.Main[4],
            }}
          >
            로그인
          </Link>
        </S.Link>
      </S.Container>

      {isModalOpen && (
        <S.ModalContainer onClick={handleCloseModal}>
          <S.ModalContent onClick={(e) => e.stopPropagation()}>
            <img src={modalX} onClick={handleCloseModal} />
            <span>ESC</span>
            <p style={{ ...typography.Label2_46, color: color.Black }}>
              인증번호
            </p>
            <p style={{ ...typography.Body3Bold, color: color.GrayScale[7] }}>
              보안을 위해 이메일로 발송된 6자리 인증 번호를 입력해 주세요.{" "}
              <br />
              3분 내로 입력하지 않으면 만료될 수 있으니 유의하시기 바랍니다.
            </p>
            <S.Inputs>
              {code.map((digit, index) => (
                <Input
                  key={index}
                  ref={(el) => (inputRefs.current[index] = el)}
                  type="text"
                  maxLength="1"
                  value={digit}
                  onChange={(e) => handleInputChange(index, e.target.value)}
                  style={{
                    border: isCodeValid
                      ? `1px solid ${color.GrayScale[2]}`
                      : `1px solid ${color.Error[0]}`,
                  }}
                />
              ))}
            </S.Inputs>
            <p
              style={{
                color: timeLeft <= 60 ? color.Error[0] : color.Main[4],
                ...typography.Body1,
              }}
            >
              {formatTime(timeLeft)}
            </p>

            <p
              onClick={handleResend}
              style={{
                cursor: "pointer",
                color: !isCodeValid ? color.Error[0] : color.Main[4],
              }}
            >
              인증번호 재전송
            </p>
            <S.CloseButton onClick={handleVerification}>확인</S.CloseButton>
          </S.ModalContent>
        </S.ModalContainer>
      )}
    </>
  );
};

export default Signup;
