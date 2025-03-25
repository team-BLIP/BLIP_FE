import { useState } from "react";
import styled from "styled-components";
import Input from "./input";
import eyeOpen from "../../svg/eyeOpen.svg";
import eyeOff from "../../svg/eyeOff.svg";

export const PassWord = ({
  value,
  onChange,
  showEye = "none",
  placeholder,
  ...props
}) => {
  const [showPswd, setShowPswd] = useState(false);

  const toggleShowPswd = () => {
    setShowPswd((prev) => !prev);
  };

  return (
    <PassWordAll>
      <FakePassWordDiv>
        <Input
          type={showPswd ? "text" : "password"}
          value={value}
          onChange={onChange}
          maxLength="20"
          placeholder={placeholder}
          {...props}
        />
        {value && showEye === "visible" && (
          <PassWordEyes onClick={toggleShowPswd}>
            <img src={showPswd ? eyeOpen : eyeOff} alt="비밀번호 보기" />
          </PassWordEyes>
        )}
      </FakePassWordDiv>
    </PassWordAll>
  );
};
const PassWordAll = styled.div``;

const FakePassWordDiv = styled.div`
  position: relative; 
`;

const PassWordEyes = styled.div`
  cursor: pointer;
  position: absolute;
  right: 15px;
  top: 50%;
  transform: translateY(-50%);
`;
