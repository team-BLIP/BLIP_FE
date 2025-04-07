import styled from "styled-components";
import { color } from "../../../../style/color";
import { typography } from "../../../../fonts/fonts";

export const Line = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  border: 1px solid ${color.GrayScale[2]};
  width: 1114px;
  height: 526px;
  border-radius: 12px;
  position: relative;
`;

export const Profile = styled.div`
  width: 140px;
  height: 140px;
  border-radius: 100px;
  border: 0.5px solid ${color.GrayScale[1]};
  position: relative;
`;

/* export const Name = styled.p`
  position: relative;
  font: ${typography.Header2};
`; */

export const Id = styled.p`
  position: relative;
  font: ${typography.Header2};
  color: ${color.GrayScale[8]};
  margin-left: 36px;
`;

export const ProfileChangeButton = styled.button`
  width: 111px;
  height: 34px;
  border-radius: 12px;
  border: none;
  background-color: ${color.Main[4]};
  color: ${color.White};
  font: ${typography.Button3};
  margin-left: 430px;
`;

export const InfoLine = styled.div`
  width: 1066px;
  height: 212px;
  border: 1px solid ${color.GrayScale[2]};
  position: relative;
  border-radius: 12px;
  margin-top: 16px;
`;

export const Email = styled.p``;

export const EmailChangeButton = styled.button`
  width: 69px;
  height: 34px;
  border-radius: 12px;
  background-color: ${color.Main[4]};
  font: ${typography.Button3};
  border: none;
  color: ${color.White};
  margin-right: 36px;
`;

export const IdChangeButton = styled.button`
  width: 69px;
  height: 34px;
  border-radius: 12px;
  background-color: ${color.Main[4]};
  font: ${typography.Button3};
  border: none;
  color: ${color.White};
  margin-right: 36px;
`;

export const ChangeLine = styled.div`
  display: flex;
  justify-content: start;
  align-items: center;
  width: 1066px;
  height: 80px;
  border: 1px solid ${color.GrayScale[2]};
  position: relative;
  border-radius: 12px;
  margin-top: 16px;
`;

export const ProfileContainer = styled.div`
  /*  display: flex;
  align-items: center;
  gap: 24px; */
  display: flex;
  align-items: center;
  justify-content: start;
  gap: 24px;
  width: 1066px;
  margin-top: 44px;
`;

export const PasswordChangeButton = styled.button`
  width: 134px;
  height: 34px;
  border-radius: 12px;
  color: ${color.White};
  background-color: ${color.Main[4]};
  border: none;
`;

export const LogoutButton = styled.button`
  width: 134px;
  height: 34px;
  border-radius: 12px;
  color: ${color.White};
  background-color: ${color.Main[4]};
  border: none;
`;

export const KillButton = styled.button`
  width: 134px;
  height: 34px;
  border-radius: 12px;
  color: ${color.White};
  background-color: ${color.Main[4]};
  border: none;
`;

export const SmallId = styled.p`
  position: relative;
`;

export const TextWithButtonContainer = styled.div`
  display: flex;
  align-items: center;
  gap: 12px;
`;

export const InfoItem = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  width: 100%;
  margin-top: 16px;
`;

export const TextBlock = styled.div`
  display: flex;
  flex-direction: column;
  gap: 8px;
  transform: translateX(24px);
`;

export const ChangePassword = styled.p`
  margin-bottom: 3px;
`;

export const Logout = styled.p`
  margin-bottom: 3px;
`;

export const Kill = styled.p`
  margin-bottom: 3px;
`;

export const ChangeItem = styled.div`
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  gap: 8px;
`;
