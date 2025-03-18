import styled from "styled-components";

export const Container = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  position: absolute;
  top: 45%;
  left: 50%;
  transform: translate(-50%, -50%);
  width: 100%;
  text-align: center;
`;

export const VoiceButtonWrapper = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  position: absolute;
  top: 180%;
  transform: translateY(-50%);
`;

export const VoiceButton = styled.img`
  cursor: pointer;
`;

export const VoiceText = styled.p`
  margin-top: 10px;
`;

export const IsSpeaking = styled.img`
  margin-top: 0px;
  display: flex;
  justify-content: center;
  align-items: center;
`;

export const LogoContainer = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  margin-top: -190px;
  margin-bottom: 20px;
`;

export const Description = styled.p`
  text-align: center;
  margin: -10px auto 0;
  max-width: 80%;
`;

export const Phrase = styled.p`
  margin-top: 80px;
`;
