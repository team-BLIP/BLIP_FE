import MainTeam from "./MainTeam";
import MainTeamOwner from "./MainTeamOwner";
import MTeamJoinNo from "./MainTeamJoinNo";
import FullScreenPage from "./FullScreen";
import { useLocation } from "react-router-dom";
import { SidebarContext } from "../../../Router";
import { UseStateContext } from "../../../Router";
import { createContext, useState, useContext, useEffect } from "react";

export const TeamDel = createContext();
export const FindId = createContext({
  filteredItem: null,
  targetId: null,
  setTargetId: () => {},
});

const Main = () => {
  const location = useLocation();
  const { itemContent, itemId, itemImage, TeamId } = location.state || {};
  const { todos } = useContext(SidebarContext);
  const [filteredItem, setFilteredItem] = useState(null);
  const { FullScreen, targetId, setTargetId } = useContext(UseStateContext);
  const [Owner, setOwner] = useState(null);
  const [join, setJoin] = useState(null);
  const [image, setImage] = useState(null);
  const [teamImages, setTeamImages] = useState({});

  useEffect(() => {
    const matchingId = todos.find((item) => item.id === itemId);
    setFilteredItem(matchingId);
  }, [todos, itemId]);

  useEffect(() => {
    if (targetId === null) {
      const foodId = todos.find((item) => item.id === itemId)?.id || null;
      setTargetId(foodId);
      console.log(targetId);
    }
  }, [targetId, itemId, todos, setTargetId]);

  return (
    <>
      <FindId.Provider
        value={{
          filteredItem,
          targetId,
          setTargetId,
          teamImages,
          setTeamImages,
          TeamId,
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
            targetId,
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
