import "../../CSS/sidebarTeam.css";
import { typography } from "../../../fonts/fonts";
import { color } from "../../../style/color";
import { useContext, useEffect } from "react";
import { SidebarContext } from "../../../Router";
import { UseStateContext } from "../../../Router";
import { TeamDel } from "../Main/Main";
import { FindId } from "../Main/Main";
import { useNavigate } from "react-router-dom";

const SidebarTeam = () => {
  const nav = useNavigate();
  const { todos } = useContext(SidebarContext);
  const { image, Owner, setOwner, join, setJoin } = useContext(TeamDel);
  const { basic, setBasic, discord } = useContext(UseStateContext);
  const { targetId, teamImages, TeamId, content, TeamUrl } = useContext(FindId);
  const {
    setting,
    setSetting,
    isAlarm,
    setIsAlarm,
    isLetter,
    setIsLetter,
    isFeedback,
    setIsFeedback,
    isKeyword,
    setIsKeyword,
  } = useContext(UseStateContext);

  const onClickEffect = (item) => {
    console.log(TeamId);
    console.log(content);
    console.log(item.id);
    console.log("targetid", targetId);
    console.log("ddadfs", todos);
    console.log("dddd", content);
    console.log("dsffsd", TeamUrl);
    if (item.isPlus) {
      if (basic) {
        setBasic((prev) => !prev);
      }
      if (join) {
        setJoin((preState) => !preState);
      }
      nav("/", { state: { TeamId, content } });
    } else {
      if (TeamId.startsWith("create-")) {
        if (Owner) {
          setOwner((preState) => !preState);
        }
        if (!basic) {
          setBasic((prev) => !prev);
        }
        if (join) {
          setJoin((preState) => !preState);
        }
        console.log(targetId);
      } else {
        if (!join) {
          setJoin((preState) => !preState);
        }
        if (!basic) {
          setBasic((prev) => !prev);
        }
        if (Owner) {
          setOwner((preState) => !preState);
        }
      }
      nav("/", { state: { TeamId, content } });
    }

    if (isLetter) setIsLetter(false);
    if (setting) setSetting(false);
    if (isAlarm) setIsAlarm(false);
    if (isKeyword) setIsKeyword(false);
    if (isFeedback) setIsFeedback(false);
  };

  return (
    <>
      <div className="MainSTJoinNo">
        {todos.length > 0 ? (
          todos.map((item, index) => (
            <div
              key={index}
              className={`content-item${
                item.isPlus
                  ? "-plus"
                  : item.id === targetId && image
                  ? "-image"
                  : ""
              }`}
              onClick={discord ? undefined : () => onClickEffect(item)}
              style={{
                ...typography.Header2,
                backgroundColor: item.isPlus
                  ? "transparent"
                  : color.GrayScale[1],
              }}
            >
              <span>
                {item.isPlus ? (
                  item.content
                ) : item.id === targetId && teamImages[targetId] ? (
                  <img
                    src={image}
                    style={{
                      width: "100%",
                      height: "100%",
                      objectFit: "contain",
                    }}
                    alt="Team Space"
                  />
                ) : (
                  content
                )}
              </span>
            </div>
          ))
        ) : (
          <p>기본값이 없다</p>
        )}
      </div>
    </>
  );
};

export default SidebarTeam;
