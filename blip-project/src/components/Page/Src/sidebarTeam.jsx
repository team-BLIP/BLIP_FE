import "../../CSS/sidebarTeam.css";
import { typography } from "../../../fonts/fonts";
import { color } from "../../../style/color";
import { useContext, useEffect, useState, useRef } from "react";
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
  const { targetId, teamImages, createTeamId, content } = useContext(FindId);
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

  const [localTodos, setLocalTodos] = useState([]);
  const prevTodosRef = useRef();

  useEffect(() => {
    if (todos && todos.length > 0) {
      const todosDeepCopy = todos.map((todo) => ({
        ...todo,
        _originalId: todo.id,
      }));
      setLocalTodos(todosDeepCopy);
      prevTodosRef.current = todos;

      console.log("LocalTodos 업데이트:", todosDeepCopy);
    }
  }, [todos]);

  const onClickEffect = (item) => {
    console.log("todos", todos);
    // console.log("Teamid", TeamId);
    // console.log("targetId", targetId);
    // console.log("content", content);
    // console.log("TeamUrl", TeamUrl);
    // console.log("localTodos", localTodos);
    const itemId = item._originalId || item.id || "";
    const itemContent = item.content || "";
    const itemUrl = item.TeamUrl || "";
    if (item && item.isPlus) {
      if (basic) {
        setBasic((prev) => !prev);
      }
      if (join) {
        setJoin((preState) => !preState);
      }
      nav("/", { state: { createTeamId, content, itemId } });
    } else if (item) {
      const currentTeamId =
        item && typeof itemId === "string" && itemId.startsWith("create-")
          ? itemId
          : `create-${itemId}`;

      if (currentTeamId.startsWith("create-")) {
        alert("create");
        alert(createTeamId);
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
      nav("/", {
        state: {
          createTeamId: currentTeamId,
          content: itemContent,
          targetId: itemId.replace("create-", ""),
          createTeamUrl: itemUrl,
          itemId,
        },
      });
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
        {localTodos.length > 0 ? (
          localTodos.map((item, index) => (
            <div
              key={`todo-${index}-${item._originalId || item.id || Date.now()}`}
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
