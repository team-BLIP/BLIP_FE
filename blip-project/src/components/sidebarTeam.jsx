import "./CSS/sidebarTeam.css";
import { typography } from "../fonts/fonts";
import { color } from "../style/color";
import { useContext } from "react";
import { SidebarContext } from "../Router";
import { useNavigate } from "react-router-dom";
import { useRef, useEffect } from "react";

const SidebarTeam = () => {
  const nav = useNavigate();
  const { todos } = useContext(SidebarContext);
  const scrollRef = useRef(null);

  return (
    <>
      <div className="MainSTJoinNo">
        {todos.length > 0 ? (
          todos.map((item) => (
            <div
              key={item.id}
              className={`content-item${item.isPlus ? "-plus" : ""}`}
              onClick={() => {
                if (item.isPlus) {
                  nav("/", { state: {} });
                } else {
                  nav("/TeamJoin", { state: {} });
                }
              }}
              style={{
                ...typography.Header2,
                backgroundColor: item.isPlus
                  ? "transparent"
                  : color.GrayScale[1],
              }}
            >
              <span>{item.content}</span>
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
