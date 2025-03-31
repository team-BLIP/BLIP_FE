import { useNavigate } from "react-router-dom";
import GraCheck from "../../svg/graCheck.svg";

import { typography } from "../../fonts/fonts";
import { color } from "../../style/color";
import * as S from "../Signup/signupSuccessStyle";

const SignupSuccess = () => {
  const navigate = useNavigate();

  return (
    <S.Container>
      <S.Texts style={{ ...typography.Header1, color: color.GrayScale[6] }}>
        잘하셨어요!
        <br />
        이제 BLIP을 시작할 모든 준비가 끝났어요!
      </S.Texts>
      <S.Image
        src={GraCheck}
        alt="회원가입 성공"
        onClick={() => navigate("/signupVoice")}
        style={{ cursor: "pointer" }}
      />
      <S.SuccessButton
        style={typography.Button1}
        onClick={() => navigate("/users/login")}
      >
        시작하기
      </S.SuccessButton>
    </S.Container>
  );
};

export default SignupSuccess;
