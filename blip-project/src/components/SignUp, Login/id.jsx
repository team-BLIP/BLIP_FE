import Input from "./input";
import X from "../../svg/X.svg";
import styled from "styled-components";

export const Id = ({ value, onChange, placeholder, ...props }) => {
  const handleClear = () => {
    onChange({ target: { name: props.name, value: "" } });
  };

  return (
    <IdContainer>
      <Input
        type="text"
        placeholder={placeholder}
        value={value}
        onChange={onChange}
        maxLength="8"
        minLength="3"
        {...props}
      />
      {value && (
        <ClearIcon onClick={handleClear}>
          <img src={X} alt="삭제" />
        </ClearIcon>
      )}
    </IdContainer>
  );
};

const IdContainer = styled.div`
  position: relative;
`;

const ClearIcon = styled.div`
  cursor: pointer;
  position: absolute;
  right: 15px;
  top: 50%;
  transform: translateY(-50%);
`;

export default Id;
