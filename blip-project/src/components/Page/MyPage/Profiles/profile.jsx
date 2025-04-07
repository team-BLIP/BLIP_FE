import * as S from "../Profiles/profileStyle";
import { typography } from "../../../../fonts/fonts";
import { color } from "../../../../style/color";
import { useState } from "react";
import LogoutModal from "../Modals/logoutModal";

const Profiles = () => {
  const [showLogoutModal, setShowLogoutModal] = useState(false);
  const handleLogout = () => {
    console.log("로그아웃 완료");
    setShowLogoutModal(false);
  };

  return (
    <>
      <S.Line>
        <S.ProfileContainer>
          <S.Profile />
          <S.TextWithButtonContainer>
            <S.Id>kimchijonmattang11</S.Id>
            <S.ProfileChangeButton>프로필 사진 변경</S.ProfileChangeButton>
          </S.TextWithButtonContainer>
        </S.ProfileContainer>

        <S.InfoLine>
          <S.InfoItem>
            <S.TextBlock>
              <p style={{ ...typography.Body3Bold, color: color.GrayScale[6] }}>
                이메일
              </p>
              <S.Email
                style={{ ...typography.Body1, color: color.GrayScale[8] }}
              >
                aaaaaaaaaaaa@gmail.com
              </S.Email>
            </S.TextBlock>
            <S.EmailChangeButton>수정</S.EmailChangeButton>
          </S.InfoItem>

          <S.InfoItem>
            <S.TextBlock>
              <p style={{ ...typography.Body3Bold, color: color.GrayScale[6] }}>
                아이디
              </p>
              <S.SmallId
                style={{ ...typography.Body1, color: color.GrayScale[8] }}
              >
                kimchijonmattang11
              </S.SmallId>
            </S.TextBlock>
            <S.IdChangeButton>수정</S.IdChangeButton>
          </S.InfoItem>
        </S.InfoLine>

        <S.ChangeLine>
          <S.ChangeItem style={{ marginRight: "580px", marginLeft: "24px" }}>
            <S.ChangePassword style={typography.Body3Bold}>
              비밀번호 변경하기
            </S.ChangePassword>
            <S.PasswordChangeButton>변경하기</S.PasswordChangeButton>
          </S.ChangeItem>
          <S.ChangeItem style={{ marginRight: "24px" }}>
            <S.Logout style={typography.Body3Bold}>로그아웃</S.Logout>
            <S.LogoutButton onClick={() => setShowLogoutModal(true)}>
              로그아웃
            </S.LogoutButton>
          </S.ChangeItem>
          <S.ChangeItem>
            <S.Kill style={typography.Body3Bold}>회원탈퇴</S.Kill>
            <S.KillButton>회원탈퇴</S.KillButton>
          </S.ChangeItem>
        </S.ChangeLine>
      </S.Line>

      {showLogoutModal && (
        <LogoutModal
          message="정말 로그아웃 하실 건가요?"
          onConfirm={handleLogout}
          onCancel={() => setShowLogoutModal(false)}
        />
      )}
    </>
  );
};

export default Profiles;
