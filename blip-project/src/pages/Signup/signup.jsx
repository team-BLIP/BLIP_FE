import { Link, useNavigate } from "react-router-dom";
import { useState, useEffect, useRef, useCallback } from "react";
import Logo from "../../svg/logo.svg";
import { typography } from "../../fonts/fonts.jsx";
import * as S from "./signupStyle.jsx";
import Input from "../../components/SignUpLogin/input.jsx";
import backgroundImg from "../../svg/backgroundImg (5).svg";
import { color } from "../../style/color.jsx";
import { PassWord } from "../../components/SignUpLogin/password.jsx";
import { Email } from "../../components/SignUpLogin/email.jsx";
import Id from "../../components/SignUpLogin/id.jsx";
import { PasswordCheck } from "../../components/SignUpLogin/passwordCheck.jsx";
import modalX from "../../svg/modalX.svg";
import axios from "axios";
import apiSignUp from "../../apis/apiSignUp.jsx";
import sends from "../../svg/send.svg";
import Number from "../../components/SignUpLogin/number.jsx";
import background from "../../svg/background.svg";
import Timer from "../../components/SignUpLogin/timer.jsx";
import { instance } from "../../apis/instance.jsx";

const Signup = () => {
  const passwordRegEx = /^(?=.*[!@#$%^&*])(?=.{8,20}$).*/;

  const [inputs, setInputs] = useState({
    id: "",
    email: "",
    password: "",
    passwordCheck: "",
  });

  const onValidMail = useCallback(
    (e) => {
      e.preventDefault();
      fetch(api.emailCheck, {
        method: "POST",
        headers: { "Content-Type": "application/json;charset=utf-8" },
        body: JSON.stringify({
          userEmail: inputs.email,
        }),
      }).then((res) => {
        if (res.status === 200) {
          setIsGetCode(true);
          setIsTimer(true);
          setCount(180);
        } else if (res.status === 401) {
          alert("이미 존재하는 이메일입니다.");
        } else if (res.status === 402) {
          alert("이미 인증이 진행중입니다.");
        }
      });
    },
    [inputs.email]
  );

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
  /* const SignUpNavClick = () => {
    const navigate = useNavigate();
    navigate("/signup");
  }; */
  const [count, setCount] = useState(180);
  const [isTimerVisible, setIsTimerVisible] = useState(false);
  const [isTimerRunning, setIsTimerRunning] = useState(false);

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
      alert(`회원가입 실패: ${error}`);
    }
  };

  /*  const handleSendEmail = async () => {
    console.log("handleSendEmail 실행됨");
    alert("메일이 전송되었습니다.");
    try {
      console.log("fetch 요청 시작");

      const response = await fetch("http://3.34.188.88:8080/auth/send", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: inputs.email }),
      });

      console.log("fetch 실행됨");

      if (response.ok) {
        console.log("이메일 전송 성공!");
      } else {
        console.error("이메일 전송 실패:", response.status);
      }
    } catch (error) {
      console.error("fetch 요청 중 오류 발생:", error);
    }
  }; */

  const handleSendEmail = async () => {
    try {
      const data = { email: inputs.email };

      const response = await fetch("http://3.35.180.21:8080/auth/send", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        throw new Error("서버 응답 실패");
      }

      const result = await response.json();
      console.log(result);
    } catch (error) {
      console.error("fetch 요청 중 오류 발생:", error);
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

  const handleLogin = async () => {
    const userData = {
      id: inputs.id,
      email: inputs.email,
      password: inputs.password,
    };
    console.log(inputs);
    try {
      const accessToken = localStorage.getItem("accessToken");
      const response = await instance.post("/users/signup", userData, {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${accessToken}`,
        },
      });
      return response.data;
    } catch (error) {
      console.error("Signup request failed:", error);
      throw error.response?.data || error;
    }
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
                value={id}
                onChange={onChange}
                name="id"
                placeholder="아이디를 입력하세요."
              />
              <button
                type="button"
                onClick={() => {
                  handleStartTimer();
                  handleSendEmail();
                }}
                style={{
                  position: "absolute",
                  right: "6px",
                  top: "50%",
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
              </button>
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
              <Number placeholder={"인증번호를 입력해주세요."} />
              {isTimerVisible && <Timer count={count} setCount={setCount} />}
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

          <S.LoginButton onClick={handleLogin}>로그인</S.LoginButton>
        </S.Main>
        <S.Link style={typography.Button0}>
          계정이 없다면?{" "}
          <span
            onClick={() => navigate("/users/signup")}
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
