import "./CSS/MainTeamOwner.css";
import DateTeamJoinNo from "./DateTeam";
import HeaderTeam from "./HeaderTeam";
import SidebarTeam from "./sidebarTeam";
import StartTeam from "./StartTeam";
import MeetingTeamJoinNo from "./MeetingTeam";
import FullScreenPage from "./FullScreen";
import { useLocation } from "react-router-dom";
import { SidebarContext } from "../Router";
import { UseStateContext } from "../Router";
import { createContext, useState, useContext, useEffect } from "react";

export const TeamDel = createContext();
export const FindId = createContext();

const MainTeamOwner = () => {
  const location = useLocation();
  const { itemContent, itemId, image, itemImage } = location.state || {};
  const { todos } = useContext(SidebarContext);
  const [filteredItem, setFilteredItem] = useState(null);
  const { FullScreen } = useContext(UseStateContext);

  useEffect(() => {
    const matchingId = todos.find((item) => item.id === itemId);
    setFilteredItem(matchingId);
  }, [todos, itemId]);

  return (
    <>
      <FindId.Provider value={filteredItem}>
        <TeamDel.Provider value={{ itemContent, itemId, image, itemImage }}>
          {FullScreen ? (
            <FullScreenPage />
          ) : (
            <>
              <HeaderTeam />
              <div className="Main-Team-owner">
                <SidebarTeam />
                <StartTeam />
                <div className="Main-Team-Date-owner">
                  <DateTeamJoinNo />
                  <MeetingTeamJoinNo />
                </div>
              </div>
            </>
          )}
        </TeamDel.Provider>
      </FindId.Provider>
    </>
  );
};

export default MainTeamOwner;
