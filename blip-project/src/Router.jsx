import "./Router.css";
import { Route, Routes } from "react-router-dom";
import Main from "./components/Page/Main/Main";
import SidebarImg from "./svg/add.svg";
import {
  useRef,
  useReducer,
  createContext,
  useCallback,
  useMemo,
  useState,
} from "react";
import MyPage from "./components/Page/MyPage/myPage";
import Profiles from "./components/Page/MyPage/Profiles/profile";

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
export const Call = createContext();

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
  const [basic, setBasic] = useState(null);
  const [TeamJoin, setTeamJoin] = useState(null);
  const [targetId, setTargetId] = useState(null);
  const [teamImages, setTeamImages] = useState({});

  const [recorder, setRecorder] = useState(null);
  const [recordedChunks, setRecordedChunks] = useState([]);
  const [isUploading, setIsUploading] = useState(false);

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
          targetId,
          setTargetId,
          targetId,
          setTargetId,
          basic,
          setBasic,
          TeamJoin,
          setTeamJoin,
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
          <Call.Provider
            value={{
              recorder,
              setRecorder,
              recordedChunks,
              setRecordedChunks,
              isUploading,
              setIsUploading,
            }}
          >
            <Routes>
              <Route path="/" element={<Main />} />
              <Route path="/profile" element={<Profiles />} />
              <Route path="/users/mypage" element={<MyPage />} />
            </Routes>
          </Call.Provider>
        </DiscordContext.Provider>
      </UseStateContext.Provider>
    </SidebarContext.Provider>
  );
};
