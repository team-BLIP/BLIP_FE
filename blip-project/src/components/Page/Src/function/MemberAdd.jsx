import { useContext, useEffect, useState } from "react";
import { TeamDel } from "../../Main/Main";
import { typography } from "../../../../fonts/fonts";
import { color } from "../../../../style/color";
import styled from "styled-components";
import { UseStateContext } from "../../../../contexts/AppContext";

const MemberAdd = () => {
  const { userName, itemId } = useContext(TeamDel);
  const { setting, isAlarm, isLetter, discord, basic, join } = useContext(UseStateContext);
  const [teamMembers, setTeamMembers] = useState([]);

  // StartTeamJoinNo 페이지인지 확인
  const isStartTeamJoinNo = !setting && !isAlarm && !isLetter && !discord && !basic && !join;

  useEffect(() => {
    // StartTeamJoinNo 페이지에서는 팀 멤버를 표시하지 않음
    if (isStartTeamJoinNo) {
      setTeamMembers([]);
      return;
    }
    
    // 현재 팀에 등록된 멤버 이름들을 불러옵니다
    if (itemId) {
      try {
        const savedTeamNames = JSON.parse(
          localStorage.getItem("teamNames") || "{}"
        );
        const teamMemberNames = [];

        // localStorage에서 현재 팀에 속한 모든 사용자 이름을 찾습니다
        Object.keys(savedTeamNames).forEach((key) => {
          // 정확히 현재 팀 ID로 시작하는 키만 처리 (다른 팀은 무시)
          // 예: '123_user1'은 팀 ID가 123인 경우에만 처리, '1234_user1'은 처리하지 않음
          if (key.startsWith(`${itemId}_`) && key.split('_')[0] === itemId) {
            teamMemberNames.push(savedTeamNames[key]);
          }
        });

        // 현재 컨텍스트의 userName 배열은 더 이상 사용하지 않음
        // 항상 localStorage의 데이터만 사용
        setTeamMembers(teamMemberNames);

        console.log(`팀 ID "${itemId}"에 등록된 멤버 이름:`, teamMemberNames);
      } catch (error) {
        console.error("팀 멤버 이름 불러오기 실패:", error);

        // 오류 발생 시에만 기존 userName 배열 사용
        if (Array.isArray(userName)) {
          setTeamMembers(userName);
        }
      }
    } else {
      // itemId가 없는 경우 빈 배열 설정
      setTeamMembers([]);
    }
  }, [userName, itemId, isStartTeamJoinNo, setting, isAlarm, isLetter, discord, basic, join]);

  // StartTeamJoinNo 페이지에서는 멤버 목록을 표시하지 않음
  if (isStartTeamJoinNo) {
    return null;
  }

  return (
    <MemberContainer>
      {teamMembers.length > 0 ? (
        teamMembers.map((name, index) => (
          <MemberItem key={index}>
            <MemberImg></MemberImg>
            <MemberName style={typography.Body2}>{name}</MemberName>
          </MemberItem>
        ))
      ) : (
        <EmptyMessage style={typography.Body3}>
          아직 팀에 등록된 멤버가 없습니다.
        </EmptyMessage>
      )}
    </MemberContainer>
  );
};

export default MemberAdd;

const MemberContainer = styled.div`
  display: flex;
  flex-direction: column;
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

const EmptyMessage = styled.div`
  padding: 10%;
  color: ${color.GrayScale[5]};
  text-align: center;
`;
