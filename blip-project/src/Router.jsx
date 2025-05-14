import "./Router.css";
import Login from "./components/Page/Login/login";
import Signup from "./components/Page/Signup/signup";
import SignupSuccess from "./components/Page/Signup/signupSuccess";
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

// 초기 사이드바 데이터
const mocDateSide = [
  {
    id: 0,
    content: <img className="mocDataImg" src={SidebarImg} alt="sidebar-img" />,
    isPlus: true,
  },
];

// 리듀서 함수
function reducer(state, action) {
  switch (action.type) {
    case "CREATE":
      return [action.data, ...state];
    case "Del":
      return state.filter((item) => item.id !== action.targetId); // != 대신 !== 사용 (더 엄격한 비교)
    case "Find":
      return state.filter((item) => item.id === action.targetId);
    default:
      return state;
  }
}

// 컨텍스트 정의
export const SidebarContext = createContext();
export const UseStateContext = createContext();
export const DiscordContext = createContext();
export const Call = createContext();

export const AppRouter = () => {
  // 사이드바 관련 상태 및 함수
  const [todos, dispatch] = useReducer(reducer, mocDateSide);
  const lastId = useRef(1);

  const onCreateone = useCallback((content) => {
    const newId = lastId.current++;

    const newTeam = {
      id: newId,
      content: content,
      isPlus: false,
    };

    dispatch({
      type: "CREATE",
      data: newTeam,
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
      onDel,
      onFind,
    };
  }, [onCreateone, onDel, onFind]); // 의존성 배열 추가

  // 애플리케이션 상태들
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
  const [basic, setBasic] = useState(false);
  const [transcript, setTranscript] = useState("");
  const videoRef = useRef(null);
  const [stream, setStream] = useState(null);
  const [TeamJoin, setTeamJoin] = useState(null);
  const [targetId, setTargetId] = useState(null);
  const [recorder, setRecorder] = useState(null);
  const [recordedChunks, setRecordedChunks] = useState([]);
  const [isUploading, setIsUploading] = useState(false);

  // 로그인 관련 상태 추가 (새로운 라우트에 필요할 수 있음)
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [userData, setUserData] = useState(null);

  // 사이드바 컨텍스트 값
  const sidebarContextValue = useMemo(
    () => ({
      todos,
      dispatch: memoizedDispatch,
    }),
    [todos, memoizedDispatch]
  );

  // 상태 컨텍스트 값
  const useStateContextValue = useMemo(
    () => ({
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
      basic,
      setBasic,
      TeamJoin,
      setTeamJoin,
      // 로그인 관련 상태 추가
      isLoggedIn,
      setIsLoggedIn,
      userData,
      setUserData,
    }),
    [
      setting,
      isAlarm,
      isLetter,
      isFeedback,
      isKeyword,
      FullScreen,
      discord,
      isMike,
      isCamera,
      meetingEnd,
      targetId,
      basic,
      TeamJoin,
      isLoggedIn,
      userData, // 새로 추가된 상태들
    ]
  );

  // 디스코드 컨텍스트 값
  const discordContextValue = useMemo(
    () => ({
      isListening,
      setIsListening,
      transcript,
      setTranscript,
      videoRef,
      stream,
      setStream,
    }),
    [isListening, transcript, stream]
  );

  // 콜 컨텍스트 값
  const callContextValue = useMemo(
    () => ({
      recorder,
      setRecorder,
      recordedChunks,
      setRecordedChunks,
      isUploading,
      setIsUploading,
    }),
    [recorder, recordedChunks, isUploading]
  );

  return (
    <SidebarContext.Provider value={sidebarContextValue}>
      <UseStateContext.Provider value={useStateContextValue}>
        <DiscordContext.Provider value={discordContextValue}>
          <Call.Provider value={callContextValue}>
            <Routes>
              <Route path="/mainPage" element={<Main />} />
              <Route path="/" element={<Login />} />
              <Route path="/users/signup" element={<Signup />} />
              <Route path="/success" element={<SignupSuccess />} />
            </Routes>
          </Call.Provider>
        </DiscordContext.Provider>
      </UseStateContext.Provider>
    </SidebarContext.Provider>
  );
};
