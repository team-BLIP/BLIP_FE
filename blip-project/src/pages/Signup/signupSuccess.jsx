import { useNavigate } from "react-router-dom";
import GraCheck from "../../svg/graCheck.svg";
import { typography } from "../../fonts/fonts";
import { color } from "../../style/color";
import * as S from "../Signup/signupSuccessStyle";

const SignupSuccess = () => {
  const navigate = useNavigate();

  return (
    <S.Container>
      <S.Image
        src={GraCheck}
        alt="회원가입 성공"
        onClick={() => navigate("/signupVoice")}
        style={{ cursor: "pointer" }}
      />
      <S.FirstText style={{ ...typography.Label2_46, color: color.Black }}>
        회원가입 완료!
      </S.FirstText>
      <p style={{ ...typography.Body2, color: color.GrayScale[6] }}>
        이제 사용자님의 목소리가 필요해s요!
      </p>
    </S.Container>
  );
};

export default SignupSuccess;
