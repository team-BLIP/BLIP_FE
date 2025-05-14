import { useEffect, useState } from "react";
import MTeamJoinNo from "../Main/MainTeamJoinNo";
import HeaderTeam from "../Src/page/HeaderTeam";
import Feedback from "../Src/page/Feedback";
import MeetingContent from "../Src/page/MeetingContent";
import SidebarTeam from "../Src/sidebarTeam";
import DateTeamJoinNo from "../Src/DateTeam";
import MainTeam from "../Main/MainTeam";
import { TeamDel } from "../Main/Main";
import DateTeam from "../Src/DateTeam";
import MeetingTeam from "../Src/MeetingTeam";
import MainTeamWithoutStart from "./NeedPage/mainTeamWithoutStart";
import "../../CSS/myPage.css";
import { useParams } from "react-router-dom";
import { instance } from "../../../apis/instance";

const MyPageNoTeam = () => {
  const [image, setImage] = useState(null);
  const [Owner, setOwner] = useState(false);
  const [join, setJoin] = useState(false);
  const [itemId, setItemId] = useState(null);

  const teamId = itemId || "원하는팀ID";
  const accessToken = localStorage.getItem("accessToken");

  const { userId } = useParams();
  const [userInfo, setUserInfo] = useState(null);

  useEffect(() => {
    console.log("userId:", userId);
    console.log("accessToken:", accessToken);

    if (!userId || !accessToken) return;

    instance
      .get(`/users/${userId}/mypage`, {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      })
      .then((res) => {
        console.log("API 응답:", res.data);
        setUserInfo(res.data);
      })
      .catch((err) => {
        console.error("API 에러:", err);
      });
  }, [userId]);

  const teamDelContext = {
    image,
    setImage,
    itemId,
    Owner,
    setOwner,
    join,
    setJoin,
    userInfo,
  };

  return (
    <TeamDel.Provider value={teamDelContext}>
      <MainTeamWithoutStart />
    </TeamDel.Provider>
  );
};

export default MyPageNoTeam;
