import "../../CSS/sidebarTeam.css";
import { typography } from "../../../fonts/fonts";
import { color } from "../../../style/color";
import { useContext, useEffect, useState } from "react";
import { SidebarContext } from "../../../Router";
import { UseStateContext } from "../../../Router";
import { TeamDel } from "../Main/MainTeamOwner";
import { useNavigate } from "react-router-dom";

const SidebarTeam = () => {
  const nav = useNavigate();
  const { todos } = useContext(SidebarContext);
  const { image = "", itemId = null } = useContext(TeamDel) || {};
  const { meetingEnd } = useContext(UseStateContext);
  // const [isFirstLoad, setIsFirstLoad] = useState(false);

  // const [targetId, setTargetId] = useState(null); // targetId 상태 추가

  // const todoIds = todos.map((todo) => todo.id).join(",");

  // useEffect(() => {
  //   if (!isFirstLoad && targetId !== null) {
  //     const targetItem = todos.find((item) => item.id === targetId);
  //     console.log("targetId",targetItem.id)
  //     if (targetItem) {
  //       if (targetItem.id % 2 === 0) {
  //         nav("/TeamOwner", {
  //           state: {
  //             itemContent:
  //               typeof targetItem.content === "string"
  //                 ? targetItem.content
  //                 : String(targetItem.content),
  //             itemId: targetItem.id,
  //             itemImage: typeof image === "string" ? image : "", // image가 문자열일 경우만 전달
  //           },
  //         });
  //         console.log(targetItem.id);
  //       } else {
  //         nav("/TeamJoin", { state: {} });
  //       }
  //     }
  //     setIsFirstLoad(true); // 네비게이션이 끝난 후 isFirstLoad를 true로 설정
  //   }
  // }, [targetId, todos, isFirstLoad, nav, image]); // targetId가 변경될 때만 실행

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
    // setTargetId(item.id)
    if (!meetingEnd) {
      return;
    } else {
      if (item.isPlus) {
        nav("/", { state: {} });
      } else {
        if (item.id % 2 == 0) {
          nav("/TeamOwner", {
            state: {
              itemContent: item.content,
              itemId: item.id,
              itemImage: image,
            },
          });
          console.log(item.id);
        } else if (item.id % 2 == 1) {
          nav("/TeamJoin", { state: {} });
        }
      }
      if (isLetter === true) {
        setIsLetter((preState) => !preState);
      } else if (setting === true) {
        setSetting((preState) => !preState);
      } else if (isAlarm === true) {
        setIsAlarm((preState) => !preState);
      } else if (isKeyword === true) {
        setIsKeyword((preState) => !preState);
      } else if (isFeedback === true) {
        setIsFeedback((preState) => !preState);
      }
    }
  };

  return (
    <>
      <div className="MainSTJoinNo">
        {todos.length > 0 ? (
          todos.map((item) => (
            <div
              key={item.id}
              className={`content-item${
                item.isPlus
                  ? "-plus"
                  : image && item.id === itemId
                  ? "-image"
                  : ""
              }`}
              onClick={() => onClickEffect(item)}
              style={{
                ...typography.Header2,
                backgroundColor:
                  item.isPlus || (image && item.id === itemId)
                    ? "transparent"
                    : color.GrayScale[1],
              }}
            >
              <span>
                {item.isPlus ? (
                  item.content
                ) : image && item.id === itemId ? (
                  <img
                    src={image}
                    style={{
                      width: "100%",
                      height: "100%",
                      objectFit: "contain",
                    }}
                  />
                ) : (
                  item.content
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
