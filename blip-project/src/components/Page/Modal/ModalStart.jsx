import styled from "styled-components";
import { typography } from "../../../fonts/fonts";
import { color } from "../../../style/color";
import ESC from "../../../svg/ESC.svg";

const ModalStart = ({ onClose, setIsMettingStop }) => {
  const onClickStart = () => {
    setIsMettingStop((prev) => !prev);
    onClose()
  };
  return (
    <ModalStop>
      <Main>
        <Header>
          <p style={{ ...typography.Title1, color: color.GrayScale[8] }}>
            회의를 재개하실건가요?
          </p>
          <img src={ESC} onClick={onClose} />
        </Header>
        <End>
          <EndButton
            onClick={onClickStart}
            style={{ ...typography.Button0, backgroundColor: color.Main[4] }}
          >
            재개
          </EndButton>
        </End>
      </Main>
    </ModalStop>
  );
};

export default ModalStart;

const ModalStop = styled.div`
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
  height: 30%;
  border-radius: 12px;
  z-index: 10000;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
`;

const Header = styled.div`
  width: 100%;
  height: 20%;
  display: flex;
  justify-content: space-around;
  align-items: center;
  padding-top: 5%;
  gap: 10%;
`;

const End = styled.div`
  width: 100%;
  height: 30%;
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
