import styled from "styled-components";
import Button from "../../components/SignUpLogin/button";

export const Container = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
  position: absolute;
  top: 45%;
  left: 50%;
  transform: translate(-50%, -50%);
`;

export const Image = styled.img`
  margin-bottom: 100px;
  margin-top: -120px;
`;

export const SuccessButton = styled(Button)``;

export const Texts = styled.p`
  margin-bottom: 180px;
`;
