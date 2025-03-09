import "./Router.css";
import { Route, Routes } from "react-router-dom";
import MainTeamJoinNo from "./components/Page/Main/MainTeamJoinNo";
import MainTeamJoin from "./components/Page/Main/MainTeam";
import MainTeamOwner from "./components/Page/Main/MainTeamOwner";
import SidebarImg from "./svg/add.svg";
import {
  useRef,
  useReducer,
  createContext,
  useCallback,
  useMemo,
  useState,
} from "react";

const mocDateSide = [
  {
    id: 0,
    content: <img className="mocDataImg" src={SidebarImg} alt="sidebar-img" />,
    isPlus: true,
  },
];

function reducer(state, action) {
  switch (action.type) {
    case "CREATE":
      return [action.data, ...state];
    case "Del":
      return state.filter((item) => item.id != action.targetId);
    case "Find":
      return state.filter((item) => item.id === action.targetId);
    case "Update":
      return state.map((item) =>
        item.id === action.targetId ? { ...item, ...action.payload } : item
      );
    default:
      return state;
  }
}

export const SidebarContext = createContext();
export const UseStateContext = createContext();
export const DiscordContext = createContext();

export const AppRouter = () => {
  const [todos, dispatch] = useReducer(reducer, mocDateSide);
  const idRefEven = useRef(2);
  const idRefOdd = useRef(1);

  const onCreateone = useCallback((content) => {
    const newId = idRefEven.current;
    idRefEven.current += 2;
    dispatch({
      type: "CREATE",
      data: {
        id: newId,
        content: content,
        isPlus: false,
      },
    });
  }, []);

  const onCreatedouble = useCallback((content) => {
    const newId = idRefOdd.current;
    idRefOdd.current += 2;
    dispatch({
      type: "CREATE",
      data: {
        id: newId,
        content: content,
        isPlus: false,
      },
    });
  }, []);

  const onDel = useCallback((targetId) => {
    dispatch({
      type: "Del",
      targetId: targetId,
    });
  }, []);

  const onFind = useCallback((targetId) => {
    dispatch({
      type: "Find",
      targetId: targetId,
    });
  }, []);

  const memoizedDispatch = useMemo(() => {
    return {
      onCreateone,
      onCreatedouble,
      onDel,
      onFind,
    };
  }, []);

  const [setting, setSetting] = useState(false);
  const [isAlarm, setIsAlarm] = useState(false);
  const [isLetter, setIsLetter] = useState(false);
  const [isFeedback, setIsFeedback] = useState(false);
  const [isKeyword, setIsKeyword] = useState(false);
  const [discord, setDiscord] = useState(false);
  const [isMike, setIsMike] = useState(false);
  const [isCamera, setIsCamera] = useState(false);
  const [FullScreen, setFullScreen] = useState(false);
  const [meetingEnd, setMeetingEnd] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [transcript, setTranscript] = useState("");
  const videoRef = useRef(null);
  const [stream, setStream] = useState(null);

  return (
    <SidebarContext.Provider
      value={{
        todos,
        dispatch: memoizedDispatch,
      }}
    >
      <UseStateContext.Provider
        value={{
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
          FullScreen,
          setFullScreen,
          discord,
          setDiscord,
          isMike,
          setIsMike,
          isCamera,
          setIsCamera,
          meetingEnd,
          setMeetingEnd,
        }}
      >
        <DiscordContext.Provider
          value={{
            isListening,
            setIsListening,
            transcript,
            setTranscript,
            videoRef,
            stream,
            setStream,
          }}
        >
          <Routes>
            <Route path="/" element={<MainTeamJoinNo />} />
            <Route path="/TeamJoin" element={<MainTeamJoin />} />
            <Route path="/TeamOwner" element={<MainTeamOwner />} />
          </Routes>
        </DiscordContext.Provider>
      </UseStateContext.Provider>
    </SidebarContext.Provider>
  );
};
