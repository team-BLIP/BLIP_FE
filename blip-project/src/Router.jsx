import { Route, Routes } from "react-router-dom";
import MainTeamJoinNo from "./components/MainTeamJoinNo";
import MainTeamJoin from "./components/MainTeam";
import Alarm from "./components/AlarmTeam";
import Letter from "./components/LetterTeam";
import SidebarImg from "./svg/add.svg";
import { useRef, useReducer, createContext, useCallback, useMemo } from "react";

const mocDateSide = [
  {
    id: 0,
    content: <img src={SidebarImg} alt="sidebar-img"/>,
  },
];

function reducer(state, action) {
  switch (action.type) {
    case "CREATE":
      return [action.data, ...state];
    default:
      return state;
  }
}

export const SidebarContext = createContext();

export const AppRouter = () => {
  const [todos, dispatch] = useReducer(reducer, mocDateSide);
  const idRef = useRef(1);

  const onCreateSidevar = useCallback((content) => {
    dispatch({
      type: "CREATE",
      data: {
        id: idRef.current++,
        content: content,
      },
    });
  }, []);

  const memoizedDispatch = useMemo(() => {
    return {
      onCreateSidevar,
    };
  }, []);

  return (
    <SidebarContext.Provider value={{ todos, dispatch:memoizedDispatch }}>
      <Routes>
        <Route path="/" element={<MainTeamJoinNo />} />
        <Route path="/TeamJoin" element={<MainTeamJoin />} />
        <Route path="/Alarm" element={<Alarm />} />
        <Route path="/Letter" element={<Letter />} />
      </Routes>
    </SidebarContext.Provider>
  );
};
