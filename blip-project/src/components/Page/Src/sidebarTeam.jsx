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
  const { basic, setBasic, discord, targetId } = useContext(UseStateContext);
  const { teamImages, createTeamId, content, idMappings, addIdMappings } =
    useContext(FindId);
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

  // 백엔드 → 클라이언트 ID 매핑 (역방향)
  const [backendToClientIdMap, setBackendToClientIdMap] = useState({});

  // 백엔드와 클라이언트 ID 간의 양방향 매핑 구축
  useEffect(() => {
    if (createTeamId && targetId) {
      const clientId =
        typeof createTeamId === "string"
          ? createTeamId.replace("create-", "")
          : createTeamId;

      // 역방향 매핑 업데이트 (백엔드 ID → 클라이언트 ID)
      setBackendToClientIdMap((prev) => ({
        ...prev,
        [targetId]: clientId,
      }));

      // 필요한 경우 addIdMappings 호출
      if (typeof addIdMappings === "function") {
        addIdMappings(clientId, targetId);
      }
    }
  }, [createTeamId, targetId, addIdMappings]);

  // todos 상태가 변경될 때 localTodos 업데이트
  useEffect(() => {
    if (todos && todos.length > 0) {
      const todosDeepCopy = todos.map((todo) => {
        // 백엔드 ID 필드 추가
        let backendId = null;

        // 1. ID 매핑에서 찾기
        if (idMappings && idMappings[todo.id]) {
          backendId = idMappings[todo.id];
        }
        // 2. ID가 'create-'로 시작하면 뒷부분 추출
        else if (typeof todo.id === "string" && todo.id.startsWith("create-")) {
          backendId = todo.id.replace("create-", "");
        }
        // 3. _orginalId 사용
        else if (todo._orginalId) {
          backendId = todo._orginalId;
        }

        return {
          ...todo,
          _originalId: todo.id,
          backendId: backendId || todo.id, // 백엔드 ID가 없으면 ID 그대로 사용
        };
      });

      setLocalTodos(todosDeepCopy);
      prevTodosRef.current = todos;

      console.log("LocalTodos 업데이트:", todosDeepCopy);
    }
  }, [todos, idMappings]);

  const onClickEffect = (item) => {
    console.log("todos", todos);
    console.log("targetId", targetId);
    console.log("content", content);
    console.log("localTodos", localTodos);
    console.log("createTeamId", createTeamId);
    const itemId = (item._originalId || item.id || "").toString();
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
        alert(targetId);
        if (Owner) {
          setOwner((preState) => !preState);
        }
        if (!basic) setBasic(false);
        if (join) {
          setJoin((preState) => !preState);
        }
        console.log(targetId);
      } else {
        if (!join) setJoin(false);
        if (!basic) setBasic(false);
        if (Owner) setOwner(false);
      }
      nav("/", {
        state: {
          createTeamId: currentTeamId,
          content: itemContent,
          targetId:
            typeof itemId === "string" ? itemId.replace("create-", "") : itemId,
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

  // SidebarTeam.jsx 내부에 추가할 디버깅 useEffect
  useEffect(() => {
    // 디버깅 정보 로깅
    console.log("=== ID 매핑 디버깅 정보 ===");
    console.log("현재 targetId (백엔드):", targetId);
    console.log("idMappings:", idMappings);

    if (localTodos.length > 0) {
      console.log("아이템 ID 분석:");
      localTodos.forEach((item, index) => {
        const itemBackendId =
          item.backendId ||
          (idMappings && idMappings[item.id]) ||
          (typeof item.id === "string" && item.id.startsWith("create-")
            ? item.id.replace("create-", "")
            : item.id);

        console.log(`아이템 #${index}:`, {
          "클라이언트 ID": item.id,
          "클라이언트 타입": typeof item.id,
          "백엔드 ID": itemBackendId,
          "타입": typeof itemBackendId,
          "ID 일치 여부": String(itemBackendId) === String(targetId),
          "ID 느슨한 비교": itemBackendId == targetId,
        });
      });
    }

    // createTeamId 확인 (있는 경우)
    if (createTeamId) {
      console.log("createTeamId:", createTeamId);
      const extractedId =
        typeof createTeamId === "string"
          ? createTeamId.replace("create-", "")
          : createTeamId;
      console.log("createTeamId에서 추출한 ID:", extractedId);
      console.log(
        "targetId와 일치 여부:",
        String(extractedId) === String(targetId)
      );
    }
    console.log("=== 디버깅 정보 끝 ===");
  }, [localTodos, targetId, idMappings, createTeamId]);

  return (
    <>
      <div className="MainSTJoinNo">
        {localTodos.length > 0 ? (
          localTodos.map((item, index) => {
            // 백엔드 ID와 비교
            const isSelected = String(item.backendId) === String(targetId);

            return (
              <div
                key={`todo-${index}-${
                  item._originalId || item.id || Date.now()
                }`}
                className={`content-item${
                  item.isPlus ? "-plus" : isSelected && image ? "-image" : ""
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
                  ) : isSelected && teamImages[targetId] ? (
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
            );
          })
        ) : (
          <p>기본값이 없다</p>
        )}
      </div>
    </>
  );
};

export default SidebarTeam;
