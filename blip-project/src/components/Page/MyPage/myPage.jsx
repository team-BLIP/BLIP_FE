import { useState } from "react";
import MTeamJoinNo from "../Main/MainTeamJoinNo";
import HeaderTeam from "../Src/page/HeaderTeam";
import Feedback from "../Src/page/Feedback";
import MeetingContent from "../Src/page/MeetingContent";
import SidebarTeam from "../Src/sidebarTeam";
import DateTeamJoinNo from "../Src/DateTeam";
import MainTeam from "../Main/MainTeam";
import { TeamDel } from "../Main/Main";

const MyPage = () => {
  const contextValue = {
    image: "someImageUrl",
    Owner: "someOwner",
  };

  return (
    <TeamDel.Provider value={contextValue}>
      <MainTeam>
        <MeetingContent />
      </MainTeam>
    </TeamDel.Provider>
  );
};

export default MyPage;
