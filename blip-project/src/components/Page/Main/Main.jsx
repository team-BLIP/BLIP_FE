import MainTeam from "./MainTeam";
import MainTeamOwner from "./MainTeamOwner";
import MTeamJoinNo from "./MainTeamJoinNo";
import FullScreenPage from "./FullScreen";
import { useLocation } from "react-router-dom";
import { UseStateContext } from "../../../contexts/AppContext";
import {
  useMemo,
  createContext,
  useState,
  useContext,
  useEffect,
  useCallback,
} from "react";

export const TeamDel = createContext();
export const FindId = createContext({
  filteredItem: null,
  targetId: null,
  setTargetId: () => {},
});

const Main = () => {
  const location = useLocation();
  const {
    itemContent,
    itemId,
    itemImage,
    createTeamId,
    content,
    createTeamUrl,
    itemBackendId,
    newTeamId,
  } = location.state || {};

  const { FullScreen, targetId, setTargetId, discord } = useContext(UseStateContext);

  const [filteredItem, setFilteredItem] = useState(null);
  const [Owner, setOwner] = useState(null);
  const [join, setJoin] = useState(null);
  const [image, setImage] = useState(null);
  const [teamImages, setTeamImages] = useState(null);
  const [isTopic, setIsTopic] = useState("");
  const [userName, setUserName] = useState([]);
  const [inputName, setInputName] = useState("");
  const [meetingId, setMeetingId] = useState("");

  // ID 매핑 상태 - 철자 오류 수정 및 최적화
  const [idMappings, setIdMappings] = useState(() => {
    const savedMappings = localStorage.getItem("idMappings");
    return savedMappings ? JSON.parse(savedMappings) : {};
  });

  // useCallback을 사용하여 함수 재생성 방지
  const addIdMappings = useCallback((clientId, backendId) => {
    setIdMappings((prevMappings) => {
      const newMappings = {
        ...prevMappings,
        [clientId]: backendId,
      };
      localStorage.setItem("idMappings", JSON.stringify(newMappings));
      return newMappings;
    });
  }, []);

  // useCallback을 사용하여 함수 재생성 방지
  const AddMember = useCallback((name) => {
    console.log("멤버 추가", name);
    setUserName((prevName) => [...prevName, name]);
  }, []);

  // 팀 이미지 LocalStorage 저장 최적화
  useEffect(() => {
    localStorage.setItem("teamImages", JSON.stringify(teamImages));
  }, [teamImages]);

  // targetId 업데이트 로직 최적화
  useEffect(() => {
    const storedId = localStorage.getItem("currentTeamId");
    
    // 저장된 ID가 있고, 현재 targetId와 다른 경우에만 업데이트
    if (storedId && storedId !== targetId) {
      setTargetId(storedId);
    }
  }, []); // 마운트 시에만 실행

  // 팀 ID가 변경될 때 로컬 스토리지 업데이트
  useEffect(() => {
    if (targetId) {
      localStorage.setItem("currentTeamId", targetId);
    }
  }, [targetId]);

  // 메모이제이션된 Context 값
  const findIdValue = useMemo(
    () => ({
      filteredItem,
      teamImages,
      setTeamImages,
      createTeamId,
      content,
      createTeamUrl,
      idMappings,
      addIdMappings,
      targetId,
      itemBackendId,
      newTeamId,
    }),
    [
      filteredItem,
      teamImages,
      setTeamImages,
      createTeamId,
      content,
      createTeamUrl,
      idMappings,
      addIdMappings,
      targetId,
    ]
  );

  const teamDelValue = useMemo(
    () => ({
      itemContent,
      itemId,
      image,
      setImage,
      itemImage,
      Owner,
      setOwner,
      join,
      setJoin,
      isTopic,
      setIsTopic,
      userName,
      setUserName,
      AddMember,
      inputName,
      setInputName,
      meetingId,
      setMeetingId,
    }),
    [
      itemContent,
      itemId,
      image,
      setImage,
      itemImage,
      Owner,
      setOwner,
      join,
      setJoin,
      isTopic,
      setIsTopic,
      userName,
      setUserName,
      AddMember,
      meetingId,
      setMeetingId,
    ]
  );

  // 조건부 렌더링 최적화
  const renderContent = () => {
    if (FullScreen) {
      return <FullScreenPage />;
    }

    if (Owner) {
      return <MainTeamOwner />;
    }

    if (join) {
      return <MTeamJoinNo />;
    }

    return <MainTeam />;
  };

  return (
    <>
      <FindId.Provider value={findIdValue}>
        <TeamDel.Provider value={teamDelValue}>
          {renderContent()}
        </TeamDel.Provider>
      </FindId.Provider>
    </>
  );
};

export default Main;
