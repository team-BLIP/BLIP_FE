import { Link, useNavigate } from "react-router-dom";
import { useState, useEffect, useRef, useCallback } from "react";
import Logo from "../../../svg/logo.svg";
import { typography } from "../../../fonts/fonts.jsx";
import * as S from "./signupStyle.jsx";
import Input from "../SignUpLoginComponent/input.jsx";
import { color } from "../../../style/color.jsx";
import { PassWord } from "../SignUpLoginComponent/password.jsx";
import { Email } from "../SignUpLoginComponent/email.jsx";
import Id from "../SignUpLoginComponent/id.jsx";
import { PasswordCheck } from "../SignUpLoginComponent/passwordCheck.jsx";
import modalX from "../../../svg/modalX.svg";
import axios from "axios";
import sends from "../../../svg/send.svg";
import Number from "../SignUpLoginComponent/number.jsx";
import background from "../../../svg/background.svg";
import Timer from "../SignUpLoginComponent/timer.jsx";
import { instance } from "../../../apis/instance.jsx";
import colorCheck from "../../../svg/colorCheck.png";

const Signup = (props) => {
  const passwordRegEx = /^(?=.*[!@#$%^&*])(?=.{8,20}$).*/;

  const [inputs, setInputs] = useState({
    account_id: "",
    email: "",
    password: "",
    passwordCheck: "",
    code: "",
  });

  const apiSignUp = async () => {
    try {
      console.log(
        "회원가입 인증 시작 : ",
        inputs.account_id,
        inputs.email,
        inputs.password
      );

      const data = {
        account_id: inputs.id,
        password: inputs.password,
        email: inputs.email,
      };

      const response = await instance.post("/users/signup", data, {
        headers: {
          "Content-Type": "application/json",
        },
      });
      console.log("회원가입 성공:", response.data);
      navigate("/success");

      return response.data;
    } catch (error) {
      console.error("Signup request failed:", error);
      if (error.response) {
        console.log("Server responded with:", error.response.data);
      } else {
        console.log("Error occured : ", error.message);
      }
      throw error.response?.data || error;
    }
  };

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
  const [count, setCount] = useState(180);
  const [isTimerVisible, setIsTimerVisible] = useState(false);
  const [isTimerRunning, setIsTimerRunning] = useState(false);
  const [verificationCode, setVerificationCode] = useState("");
  const [isVerified, setIsVerified] = useState(false);
  const [verificationError, setVerificationError] = useState("");
  const [serverCode, setServerCode] = useState(null);
  const [isGetCode, setIsGetCode] = useState(false);
  const [isTimer, setIsTimer] = useState(false);

  const handleVerifyCode = async () => {
    try {
      console.log("인증 코드 검증 시작:", inputs.email, inputs.code);

      if (!inputs.email || !inputs.code) {
        alert("이메일과 인증번호를 모두 입력해주세요.");
        return;
      }

      const data = {
        email: inputs.email,
        code: inputs.code,
      };

      const response = await instance.post("/auth/verify", data, {
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
      });
      console.log("인증 응답:", response);

      if (response.status === 200) {
        alert("인증 성공!");
        setIsVerified(true);
      } else {
        alert("인증 실패! 올바른 이메일과 인증번호를 입력해주세요.");
      }
    } catch (error) {
      console.error("axios 요청 중 오류 발생:", error);
      if (error.response) {
        console.log("오류 상태:", error.response.status);
        console.log("오류 데이터:", error.response.data);

        if (error.response.status === 403) {
          alert("인증 권한이 없습니다. 다시 인증번호를 요청해주세요.");
        } else if (error.response.status === 401) {
          alert("인증번호가 일치하지 않습니다. 다시 확인해주세요.");
        } else {
          alert(
            `인증 실패: ${error.response.data.message || "알 수 없는 오류"}`
          );
        }
      } else {
        alert("서버와 연결할 수 없습니다. 나중에 다시 시도해주세요.");
      }
    }
  };

  const handleStartTimer = () => {
    setIsTimerVisible(true);
    setIsTimerRunning(true);
    setCount(180);
  };

  useEffect(() => {
    if (isTimerRunning && count > 0) {
      const timer = setInterval(() => {
        setCount((prev) => {
          if (prev === 1) {
            clearInterval(timer);
            setIsTimerRunning(false);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);

      return () => clearInterval(timer);
    }
  }, [isTimerRunning, count]);

  const handleResend = () => {
    setCount(180);
    setCode(["", "", "", "", "", ""]);
    setIsCodeValid(true);
  };

  useEffect(() => {
    if (count === 0) return;

    const timer = setInterval(() => {
      setCount((prev) => {
        if (prev === 1) {
          clearInterval(timer);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [count]);

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

  /*  const handleResend = () => {
    setTimeLeft(180);
    setCode(["", "", "", "", "", ""]);
    setIsCodeValid(true);
  }; */

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
      console.error("회원가입 실패:", error);
    }
  };

  const handleSendEmail = async () => {
    try {
      const data = { email: inputs.email };

      const response = await instance.post("/auth/send", data, {
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
      });

      if (response.status === 200) {
        console.log(response.data);
        alert("이메일 전송 성공!");
      } else {
        alert("이메일 전송 실패");
      }
    } catch (error) {
      console.error("axios 요청 중 오류 발생:", error);
      alert("서버와 연결할 수 없습니다. 나중에 다시 시도해주세요.");
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

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setCode(["", "", "", "", "", ""]);
    setIsCodeValid(true);
  };

  const [passwordError, setPasswordError] = useState("");
  const passwordChecking = (password) => {
    if (!password.match(passwordRegEx)) {
      console.log("비밀번호 형식을 확인해주세요");
      setPasswordError("비밀번호 형식을 확인해주세요");
      return;
    }
    console.log("비밀번호 형식이 맞습니다");
    setPasswordError("");
  };

  const SignUpNavClick = () => {
    navigate("/signup");
  };

  return (
    <>
      <S.Container>
        <img
          src={background}
          style={{
            width: "950px",
            height: "850px",
          }}
        />
        <S.LogoContainer>
          <img src={Logo} alt="Logo" />
          <span style={typography.Label1}>BLIP</span>
        </S.LogoContainer>
        <S.Texts style={typography.Title1}>계정 생성</S.Texts>
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
            <S.InputContainer>
              <Id
                type="text"
                value={id ?? ""}
                onChange={onChange}
                maxLength="8"
                minLength="3"
                {...props}
                name="id"
                placeholder="아이디를 입력하세요."
              />
              <S.EmailButton
                type="button"
                onClick={() => {
                  handleStartTimer();
                  handleSendEmail();
                }}
                style={{
                  position: "absolute",
                  right: "6px",
                  top: "-150%",
                  transform: "translateY(522%)",
                  padding: "5px 10px",
                  backgroundColor: color.Main[4],
                  color: "white",
                  border: "none",
                  cursor: "pointer",
                  zIndex: "1",
                  width: "45px",
                  height: "30px",
                }}
              >
                <img src={sends} style={{ width: "20px", height: "20px" }} />
              </S.EmailButton>
            </S.InputContainer>
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

          <div style={{ position: "relative" }}>
            {!isVerified && (
              <S.verificationButton
                style={{
                  position: "absolute",
                  left: "152px",
                  top: "50px",
                  padding: "5px 10px",
                  backgroundColor: color.Main[4],
                  color: "white",
                  border: "none",
                  cursor: "pointer",
                  zIndex: "1",
                  width: "45px",
                  height: "30px",
                  fontSize: "12px",
                }}
                onClick={handleVerifyCode}
              >
                확인
              </S.verificationButton>
            )}
            {verificationError && <p>{verificationError}</p>}
          </div>

          <div>
            <p
              style={{
                ...typography.Body1,
                color: emailErrorMessage ? color.Error[0] : color.GrayScale[5],
              }}
            >
              인증번호
            </p>
            <div
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                gap: "10px",
              }}
            >
              <Number
                placeholder={"인증번호를 입력해주세요."}
                onChange={(e) =>
                  setInputs((prev) => ({ ...prev, code: e.target.value }))
                }
                value={inputs.code}
                type="number"
                isVerified={isVerified}
              />
              {!isVerified && isTimerVisible && (
                <Timer count={count} setCount={setCount} />
              )}
            </div>
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
              showEye="none"
              placeholder="비밀번호를 입력하세요."
            />
            {passwordError && (
              <p style={{ color: "red", fontSize: "12px" }}>{passwordError}</p>
            )}
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

          <S.SignupButton onClick={apiSignUp}>회원가입</S.SignupButton>
        </S.Main>
        <S.Link style={typography.Button0}>
          계정이 없다면?{" "}
          <span
            onClick={() => navigate("/users/login")}
            style={{
              ...typography.Button0,
              color: color.Main[4],
              cursor: "pointer",
            }}
          >
            가입하기
          </span>
        </S.Link>
      </S.Container>
    </>
  );
};

export default Signup;
