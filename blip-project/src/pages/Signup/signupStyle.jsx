import styled from "styled-components";
import Button from "../../components/SignUp, Login/button";
import { color } from "../../style/color";
import { typography } from "../../fonts/fonts";

export const Main = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 5px;
  position: absolute;
  top: 55%;
  left: 50%;
  transform: translate(-50%, -50%);

  p {
    margin-bottom: 2px;
  }
`;

export const Container = styled.div`
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  height: 100vh;
  gap: 10px;
`;

export const LogoContainer = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
  position: absolute;
  top: 10%;
  left: 50%;
  transform: translate(-50%, -50%);
`;

export const Texts = styled.span`
  display: flex;
  align-items: center;
  gap: 8px;
  position: absolute;
  top: 21%;
  left: 50%;
  transform: translate(-50%, -50%);
`;

export const LoginButton = styled(Button)`
  margin-top: 40px;
`;

export const Link = styled.p`
  display: flex;
  align-items: center;
  gap: 8px;
  position: absolute;
  top: 89%;
  left: 50%;
  transform: translate(-50%, -50%);
`;

export const ModalContainer = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
`;

export const ModalContent = styled.div`
  background: white;
  width: 472px;
  height: 500px;
  padding: 40px;
  border-radius: 16px;
  text-align: center;
  box-shadow: 0px 4px 10px rgba(0, 0, 0, 0.2);
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  position: relative;

  /*   p:first-child {
    position: relative;
    top: -50px;
  }

  p:nth-child(2) {
    position: relative;
    top: -98px;
    margin-bottom: 10px;
  } */

  img {
    position: absolute;
    top: 16px;
    right: 16px;
    cursor: pointer;
  }

  span {
    position: absolute;
    top: 55px; 
    right: 20px;
    font: ${typography.Body1}
    color: ${color.GrayScale[6]};
  }
`;

export const CloseButton = styled(Button)`
  width: 500px;
  &:hover {
    background: ${color.Main[3]};
  }
`;

export const Inputs = styled.div`
  display: flex;
  gap: 8px;
  justify-content: center;
  flex-wrap: nowrap;
  width: 100%;

  input {
    width: 64px;
    height: 100px;
    text-align: center;
    font-size: 18px;
    padding: 0;
    text-indent: 0px;
    color: ${color.Black};
    font: ${typography.Label2_46};
  }
`;
