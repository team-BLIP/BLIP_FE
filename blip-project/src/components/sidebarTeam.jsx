import "./CSS/sidebarTeam.css";
import { typography } from "../fonts/fonts";
import { color } from "../style/color";
import { useContext } from "react";
import { SidebarContext } from "../Router";

const SidebarTeam = () => {
  const { todos } = useContext(SidebarContext);
  return (
    <>
      <div className="MainSTJoinNo">
        {todos.length > 0 ? (
          todos.map((item) => (
            <div
              key={item.id}
              className="content-item"
              style={{
                ...typography.Header2,
                backgroundColor: color.GrayScale[1],
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
