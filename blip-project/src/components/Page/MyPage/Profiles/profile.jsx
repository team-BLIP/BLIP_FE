import * as S from "../Profiles/profileStyle";
import { typography } from "../../../../fonts/fonts";
import { color } from "../../../../style/color";
import { useState } from "react";
import LogoutModal from "../Modals/logoutModal";
import KillModal from "../Modals/killModal";
import EmailChangeModal from "../Modals/emailChangeModal";
import IdChangeModal from "../Modals/idChangeModal";
import PasswordChangeModal from "../Modals/passwordChangeModal";
import ImageChangeModal from "../Modals/imageEditModal";
import profileDefault from "../../../../svg/profileDefault.svg";

const Profiles = () => {
  const [showLogoutModal, setShowLogoutModal] = useState(false);
  const [showKillModal, setShowKillModal] = useState(false);
  const [showEmailModal, setEmailChangeModal] = useState(false);
  const [showIdModal, setIdChangemModal] = useState(false);
  const [showPasswordModal, setPasswordChangeModal] = useState(false);
  const [showImageModal, setImageChangeModal] = useState(false);

  const handleLogout = () => {
    console.log("로그아웃 완료");
    setShowLogoutModal(false);
  };
  const handleKill = () => {
    console.log("회원탈퇴 완료");
    setShowKillModal(false);
  };
  const handleChangeEmail = () => {
    console.log("인증번호~~");
    setEmailChangeModal(false);
  };
  const handleChangeId = () => {
    console.log("아이디 바꾸기용용");
  };
  const handleChangePassword = () => {
    console.log("비밀번호 바꾸기용용용");
  };
  const handleChangeImage = () => {
    console.log("이미지 바뀌깅~~");
  };

  return (
    <>
      <S.Line>
        <S.ProfileContainer>
          <S.Profile
            style={{
              backgroundImage: `url(${profileDefault})`,
            }}
          />
          <S.TextWithButtonContainer>
            <S.Id>kimchijonmattang11</S.Id>
            <S.ProfileChangeButton onClick={() => setImageChangeModal(true)}>
              프로필 사진 변경
            </S.ProfileChangeButton>
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
            <S.EmailChangeButton onClick={() => setEmailChangeModal(true)}>
              수정
            </S.EmailChangeButton>
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
            <S.IdChangeButton onClick={() => setIdChangemModal(true)}>
              수정
            </S.IdChangeButton>
          </S.InfoItem>
        </S.InfoLine>

        <S.ChangeLine>
          <S.ChangeItem style={{ marginRight: "580px", marginLeft: "24px" }}>
            <S.ChangePassword style={typography.Body3Bold}>
              비밀번호 변경하기
            </S.ChangePassword>
            <S.PasswordChangeButton
              onClick={() => setPasswordChangeModal(true)}
            >
              변경하기
            </S.PasswordChangeButton>
          </S.ChangeItem>
          <S.ChangeItem style={{ marginRight: "24px" }}>
            <S.Logout style={typography.Body3Bold}>로그아웃</S.Logout>
            <S.LogoutButton onClick={() => setShowLogoutModal(true)}>
              로그아웃
            </S.LogoutButton>
          </S.ChangeItem>
          <S.ChangeItem>
            <S.Kill style={typography.Body3Bold}>회원탈퇴</S.Kill>
            <S.KillButton onClick={() => setShowKillModal(true)}>
              회원탈퇴
            </S.KillButton>
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
      {showKillModal && (
        <KillModal
          message="정말 회원탈퇴 하실건가요?"
          onConfirm={handleKill}
          onCancel={() => setShowKillModal(false)}
        />
      )}

      {showEmailModal && (
        <EmailChangeModal
          message="인증번호"
          onConfirm={handleChangeEmail}
          onCancel={() => setEmailChangeModal(false)}
        />
      )}

      {showIdModal && (
        <IdChangeModal
          message="아이디 변경"
          onConfirm={handleChangeId}
          onCancel={() => setIdChangemModal(false)}
        />
      )}

      {showPasswordModal && (
        <PasswordChangeModal
          message="비밀번호 변경"
          onConfirm={handleChangePassword}
          onCancel={() => setPasswordChangeModal(false)}
        />
      )}

      {showImageModal && (
        <ImageChangeModal
          message="이미지 편집하기"
          onConfirm={handleChangeImage}
          onCancel={() => setImageChangeModal(false)}
        />
      )}
    </>
  );
};

export default Profiles;
