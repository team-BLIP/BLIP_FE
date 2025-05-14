import React, { forwardRef } from "react";
import styled from "styled-components";
import { color } from "../../../style/color";

const StyledInput = styled.input`
  width: ${(props) => props.width || "400px"};
  height: ${(props) => props.height || "38px"};
  border-radius: ${(props) => props.borderRadius || "12px"};
  border: 2px solid;
  border-color: ${(props) => props.borderColor || color.GrayScale[2]};
  background-image: ${(props) => props.backgroundImage || "none"};
  background-repeat: no-repeat;
  background-size: 30px 25px, 24px 24px;
  background-position: 20px center, calc(100% - 20px) center;
  margin: ${(props) => props.margin || "0"};
  text-indent: ${(props) => props.margin || "15px"};
  flex-wrap: wrap;
  input {
    min-width: 64px;
  }
`;

const Input = forwardRef((props, ref) => {
  return <StyledInput ref={ref} {...props} />;
});

export default Input;
