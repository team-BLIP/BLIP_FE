import { useState } from "react";
import styled from "styled-components";
import Input from "./input";
import eyeOpen from "../../../svg/eyeOpen.svg";
import eyeOff from "../../../svg/eyeOff.svg";

export const PasswordCheck = ({
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
            <img src={showPswd ? eyeOpen : eyeOff} alt="눈 아이콘" />
          </PassWordEyes>
        )}
      </FakePassWordDiv>
    </PassWordAll>
  );
};

const PassWordAll = styled.div`
  position: relative;
`;

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

const ErrorText = styled.p`
  color: red;
  font-size: 12px;
  margin-top: 5px;
`;
