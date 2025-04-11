import styled from "styled-components";
import { typography } from "../../../fonts/fonts";
import { color } from "../../../style/color";
import { useContext, useState, useEffect } from "react";
import PropTypes from 'prop-types';
import { TeamDel } from "../Main/Main";

const ModalName = ({ onClose }) => {
  const { userName, AddMember, setInputName, itemId } =
    useContext(TeamDel);
  const [localInputName, setLocalInputName] = useState("");

  const onClickStart = () => {
    if (localInputName.length >= 3) {
      setInputName(localInputName);
      
      // 이름을 localStorage에 저장
      if (itemId) {
        try {
          // 사용자 고유 식별자 가져오기 (없으면 생성)
          let userId = localStorage.getItem('userId');
          if (!userId) {
            userId = 'user_' + Date.now();
            localStorage.setItem('userId', userId);
          }
          
          // 팀 ID와 사용자 ID를 조합한 고유 키 생성
          const teamUserKey = `${itemId}_${userId}`;
          
          // 기존 저장된 팀 데이터 가져오기
          const savedTeamNames = JSON.parse(localStorage.getItem('teamNames') || '{}');
          
          // 현재 팀과 사용자 조합에 이름 저장
          savedTeamNames[teamUserKey] = localInputName;
          
          // 업데이트된 데이터 저장
          localStorage.setItem('teamNames', JSON.stringify(savedTeamNames));
          console.log(`사용자 이름 "${localInputName}"이(가) 팀 ID "${itemId}"의 사용자 "${userId}"에 저장되었습니다.`);
        } catch (error) {
          console.error("사용자 이름 저장 실패:", error);
        }
      }
      
      // AddMember 함수가 존재하면 해당 함수만 호출하고 모달 닫기
      if (typeof AddMember === "function") {
        AddMember(localInputName);
        onClose();
      } else {
        // AddMember 함수가 없는 경우에만 수행 (기존 호환성)
        onClose();
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
    console.log("현재 팀 ID:", itemId);
    
    // 저장된 사용자 이름이 있으면 자동으로 불러옴
    if (itemId) {
      try {
        // 사용자 고유 식별자 가져오기
        const userId = localStorage.getItem('userId');
        if (!userId) {
          return; // 사용자 ID가 없으면 종료
        }
        
        const savedTeamNames = JSON.parse(localStorage.getItem('teamNames') || '{}');
        
        // 팀과 사용자 조합으로 된 키로만 이름 확인
        const teamUserKey = `${itemId}_${userId}`;
        const savedName = savedTeamNames[teamUserKey];
        
        if (savedName) {
          console.log(`팀 ID "${itemId}"의 사용자 "${userId}"에 저장된 이름 "${savedName}"을(를) 불러왔습니다.`);
          setLocalInputName(savedName);
        }
      } catch (error) {
        console.error("저장된 이름 불러오기 실패:", error);
      }
    }
  }, [userName, AddMember, itemId]);

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
            value={localInputName}
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

ModalName.propTypes = {
  onClose: PropTypes.func.isRequired
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
