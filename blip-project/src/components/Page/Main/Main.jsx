import MainTeam from "./MainTeam";
import MainTeamOwner from "./MainTeamOwner";
import MTeamJoinNo from "./MainTeamJoinNo";
import FullScreenPage from "./FullScreen";
import { useLocation } from "react-router-dom";
import { SidebarContext } from "../../../Router";
import { UseStateContext } from "../../../Router";
import { useMemo, createContext, useState, useContext, useEffect } from "react";

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
  } = location.state || {};
  const { todos } = useContext(SidebarContext);
  const [filteredItem, setFilteredItem] = useState(null);
  const { FullScreen, targetId, setTargetId } = useContext(UseStateContext);
  const [Owner, setOwner] = useState(null);
  const [join, setJoin] = useState(null);
  const [image, setImage] = useState(null);
  const [teamImages, setTeamImages] = useState({});
  const [isTopic, setIsTopic] = useState("");
  const [userName, setUserName] = useState([]);

  const AddMember = (name) => {
    console.log("멤버 추가", name);
    setUserName((prevName) => [...prevName, name]);
  };

  const matchingItem = useMemo(() => {
    todos.find((item) => item.id === targetId);
  }, [targetId, todos]);

  useEffect(() => {
    const newtargetId = matchingItem ? `${targetId}` : null;
    if (typeof setTargetId === "function") {
      setTargetId((preV) => (preV !== newtargetId ? newtargetId : preV));
    } else {
      console.log("이건 아니야");
    }
  }, [matchingItem, targetId]);

  return (
    <>
      <FindId.Provider
        value={{
          filteredItem,
          teamImages,
          setTeamImages,
          createTeamId,
          content,
          createTeamUrl,
        }}
      >
        <TeamDel.Provider
          value={{
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
          }}
        >
          {FullScreen ? (
            <FullScreenPage />
          ) : (
            <>
              {Owner ? (
                <MainTeamOwner />
              ) : join ? (
                <MTeamJoinNo />
              ) : (
                <MainTeam />
              )}
            </>
          )}
        </TeamDel.Provider>
      </FindId.Provider>
    </>
  );
};

export default Main;
