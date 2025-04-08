import { useContext, useEffect } from "react";
import { TeamDel } from "../../Main/Main";
import { typography } from "../../../../fonts/fonts";
import { color } from "../../../../style/color";
import styled from "styled-components";

const MemberAdd = () => {
  const { userName } = useContext(TeamDel);

  useEffect(() => {
    console.log("MemberAdd에서의 userName:", userName);
  }, [userName]);

  return (
    <MemberContainer>
      {Array.isArray(userName) && userName.length > 0
        ? userName.map((name, index) => (
            <MemberItem key={index}>
              <MemberImg></MemberImg>
              <MemberName style={typography.Body2}>{name}</MemberName>
            </MemberItem>
          ))
        : ""}
    </MemberContainer>
  );
};

export default MemberAdd;

const MemberContainer = styled.div`
  display: flex;
  flex-direction: column;
  display: flex;
  border-radius: 8px;
  width: 100%;
  height: 100%;
`;

const MemberItem = styled.div`
  display: flex;
  align-items: center;
  padding-left: 10%;
  padding-top: 10%;
  gap: 10%;
  padding-bottom: 5%;
`;

const MemberImg = styled.img`
  width: 15%;
  aspect-ratio: 1/1;
  border-radius: 50%;
  background-color: aqua;
  border: none;
`;

const MemberName = styled.span`
  color: ${color.GrayScale[8]};
  flex: 1;
`;
