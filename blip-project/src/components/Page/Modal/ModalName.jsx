import styled from "styled-components";
import { typography } from "../../../fonts/fonts";
import { color } from "../../../style/color";
import { useContext, useState, useEffect } from "react";
import { TeamDel } from "../Main/Main";

const ModalName = ({ onClose }) => {
  const { userName, setUserName, AddMember, setInputName } =
    useContext(TeamDel);
  const [localInputName, setLocalInputName] = useState("");

  const onClickStart = () => {
    if (localInputName.length >= 3) {
      setInputName(localInputName);
      if (typeof AddMember === "function") {
        AddMember(localInputName);
        onClose();
      } else {
        setUserName([...userName, localInputName]);
      }
    } else {
      alert("이름은 3글자 이상이어야 합니다.");
    }
  };
  const onInput = (e) => {
    setLocalInputName(e.target.value);
    console.log(e.target.value);
  };

  const handleKeyDown = (e) => {
    if (e.keyCode === 13) {
      onClickStart();
    }
  };

  useEffect(() => {
    console.log("현재 userName 상태:", userName);
    console.log("AddMember 함수 타입:", typeof AddMember);
  }, [userName, AddMember]);

  return (
    <Name>
      <Main>
        <Header>
          <p style={{ ...typography.Title1, color: color.GrayScale[8] }}>
            이름 입력
          </p>
        </Header>
        <Inputdiv>
          <p style={{ ...typography.Button1 }}>이름</p>
          <NameInput
            style={{
              ...typography.Header3,
            }}
            type="text"
            onChange={onInput}
            onKeyDown={handleKeyDown}
            placeholder="이름을 입력하세요"
          ></NameInput>
        </Inputdiv>
        <End>
          <EndButton
            onClick={onClickStart}
            style={{
              ...typography.Button0,
              backgroundColor:
                localInputName.length >= 3 ? color.Main[4] : color.Main[2],
            }}
          >
            확인
          </EndButton>
        </End>
      </Main>
    </Name>
  );
};

export default ModalName;

const Name = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-color: rgba(0, 0, 0, 0.25);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1000;
`;

const Main = styled.div`
  background-color: #ffff;
  width: 30%;
  height: 60%;
  border-radius: 12px;
  z-index: 10000;
  display: flex;
  flex-direction: column;
`;

const Header = styled.div`
  width: 100%;
  height: 15%;
  padding-top: 10%;
  padding-left: 5%;
`;

const Inputdiv = styled.div`
  width: 100%;
  height: 90%;
  display: flex;
  flex-direction: column;
  padding-left: 5%;
  gap: 5%;
`;

const NameInput = styled.input`
  width: 90%;
  height: 15%;
  border-radius: 12px;
  border: 1px solid #cacaca;
  ::placeholder {
    color: #cacaca;
  }
`;

const End = styled.div`
  width: 100%;
  height: 15%;
  display: flex;
  align-items: center;
  justify-content: center;
`;

const EndButton = styled.button`
  width: 90%;
  height: 80%;
  border: none;
  border-radius: 12px;
  color: #ffff;
`;
