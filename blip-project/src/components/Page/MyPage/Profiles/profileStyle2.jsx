import styled from "styled-components";
import { color } from "../../../../style/color";
import { typography } from "../../../../fonts/fonts";

export const Line = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  border: 1px solid ${color.GrayScale[2]};
  width: 956px;
  height: 526px;
  border-radius: 12px;
  position: relative;
`;

export const Profile = styled.div`
  width: 150px;
  height: 120px;
  border-radius: 50%;
  background-size: cover;
  background-position: center;
  background-repeat: no-repeat;
  border: 1px solid black;
  margin-left: 80px;
`;

export const Id = styled.p`
  position: relative;
  font: ${typography.Body1};
  color: ${color.GrayScale[8]};
  margin-left: 6px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  max-width: calc(100% - 150px);
`;

export const ProfileChangeButton = styled.button`
  position: absolute;
  right: 110px;
  width: 111px;
  height: 34px;
  border-radius: 12px;
  border: none;
  background-color: ${color.Main[4]};
  color: ${color.White};
  font: ${typography.Button3};
`;

export const InfoLine = styled.div`
  width: 908px;
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
  width: 908px;
  height: 80px;
  border: 1px solid ${color.GrayScale[2]};
  position: relative;
  border-radius: 12px;
  margin-top: 16px;
`;

export const ProfileContainer = styled.div`
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
  position: relative;
  width: 100%;
  display: flex;
  align-items: center;
  flex-direction: start;
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
  white-space: nowrap;
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

export const Name = styled.p`
  font: ${typography.Header2};
  color: ${color.GrayScale[8]};
`;
