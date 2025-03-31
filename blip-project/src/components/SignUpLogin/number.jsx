import { useState } from "react";
import styled from "styled-components";
import Input from "./input";
import colorCheck from "../../svg/colorCheck.png";

export const NumberInput = ({
  value,
  onChange,
  placeholder,
  isVerified,
  ...props
}) => {
  return (
    <NumberAll>
      <FakeNumberDiv>
        <Input
          type="text"
          placeholder={placeholder}
          value={value}
          onChange={onChange}
          {...props}
        />
        {isVerified && (
          <VerifiedIcon>
            <img
              src={colorCheck}
              alt="인증 성공"
              style={{
                width: "19px",
                height: "19px",
                marginTop: "5px",
              }}
            />
          </VerifiedIcon>
        )}
      </FakeNumberDiv>
    </NumberAll>
  );
};

const NumberAll = styled.div``;

const FakeNumberDiv = styled.div`
  position: relative;
`;

const VerifiedIcon = styled.div`
  position: absolute;
  right: 15px;
  top: 50%;
  transform: translateY(-50%);
`;

export default NumberInput;
