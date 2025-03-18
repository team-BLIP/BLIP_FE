import React from "react";
import styled from "styled-components";
import { color } from "../../style/color";

const StyledButton = styled.button`
  width: ${(props) => props.width || "518px"};
  height: ${(props) => props.height || "60px"};
  border-radius: ${(props) => props.borderRadius || "12px"};
  margin: ${(props) => props.margin || "0"};
  background-color: ${(props) => props.backgroundColor || color.Main[3]};
  color: white;
`;

const Button = (props) => {
  return <StyledButton {...props} />;
};

export default Button;
