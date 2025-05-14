import styled from "styled-components";
import Button from "../SignUpLoginComponent/button";

export const Main = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 15px;
  position: absolute;
  top: 57%;
  left: 80%;
  transform: translate(-50%, -50%);

  p {
    margin-bottom: 4px;
  }
`;

export const Link = styled.p`
  display: flex;
  align-items: center;
  gap: 8px;
  position: absolute;
  top: 84%;
  left: 80%;
  transform: translate(-50%, -50%);
  white-space: nowrap;
`;

export const Container = styled.div`
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  height: 100vh;
  width: 100%;
  position: relative;
  overflow: hidden;
  margin: 0;
  padding: 0;
`;

export const LogoContainer = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
  position: absolute;
  top: 10%;
  left: 80%;
  transform: translate(-50%, -50%);
`;

export const Texts = styled.span`
  display: flex;
  align-items: center;
  gap: 8px;
  position: absolute;
  top: 25%;
  left: 80%;
  transform: translate(-50%, -50%);
  white-space: nowrap;
`;

export const LoginButton = styled(Button)`
  margin-top: 100px;
`;

export const BackgroundImage = styled.img`
  position: absolute;
  top: 0;
  left: 0;
  height: 120%;
  width: 75%;
  object-fit: cover;
  z-index: 0;
`;
