// MainPage.jsx 수정 부분
import {
  createContext,
  useReducer,
  useState,
  useCallback,
  useMemo,
  useEffect,
  useRef,
} from "react";
import { useLocation, useNavigate } from "react-router-dom";
import MainTeam from "./MainTeam";
import MainTeamOwner from "./MainTeamOwner";
import MTeamJoinNo from "./MainTeamJoinNo";
import FullScreenPage from "./FullScreen";
import SidebarImg from "../../../svg/add.svg";

// Context 생성
export const SidebarContext = createContext();
export const UseStateContext = createContext();
export const DiscordContext = createContext();
export const Call = createContext();
export const FindId = createContext({
  filteredItem: null,
  targetId: null,
  setTargetId: () => {},
});
export const TeamDel = createContext();

// Reducer 함수
const reducer = (state, action) => {
  switch (action.type) {
    case "CREATE":
      return [action.data, ...state];
    case "Del":
      return state.filter((item) => item.id !== action.targetId);
    case "ADD_TEAM": // 추가된 팀 액션 처리
      return state.some((item) => item.id === action.payload.id)
        ? state
        : [action.payload, ...state];
    default:
      return state;
  }
};

// 초기 상태
const mocDateSide = [
  {
    id: "default-team",
    content: <img className="mocDataImg" src={SidebarImg} alt="sidebar-img" />,
    isPlus: true,
    isDefaultAddButton: true,
    itemContent: "ADD_BUTTON",
  },
];

const MainPage = () => {
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    // 위치 및 상태 로깅 (디버깅용)
    console.log("MainPage 마운트 - location.state:", location.state);
    console.log("현재 URL:", window.location.href);
  }, [location]);

  // location.state에서 값 추출
  const {
    itemContent,
    itemId,
    itemImage,
    createTeamId,
    content,
    createTeamUrl,
    itemBackendId,
    newTeamId,
    TeamJoinId,
    targetId: locationTargetId, // 명시적으로 이름 변경
    forceRefresh, // 강제 새로고침 옵션
  } = location.state || {};

  // 상태 초기화
  const [filteredItem, setFilteredItem] = useState(null);
  const [Owner, setOwner] = useState(false); // null 대신 false로 초기화
  const [join, setJoin] = useState(false); // null 대신 false로 초기화
  const [image, setImage] = useState(false); // null 대신 false로 초기화

  // 로컬 스토리지에서 팀 이미지 로드
  const [teamImages, setTeamImages] = useState(() => {
    try {
      const storedImages = localStorage.getItem("teamImages");
      return storedImages ? JSON.parse(storedImages) : {};
    } catch (error) {
      console.error("팀 이미지 로드 실패:", error);
      return {};
    }
  });

  const [isTopic, setIsTopic] = useState("");
  const [userName, setUserName] = useState([]);
  const [inputName, setInputName] = useState("");
  const [meetingId, setMeetingId] = useState("");

  // 기존 상태들
  const [todos, dispatch] = useReducer(reducer, mocDateSide);
  const lastId = useRef(1);
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
  const [TeamJoin, setTeamJoin] = useState(false); // null 대신 false로 초기화

  // 로컬 스토리지에서 targetId 초기화
  const [targetId, setTargetId] = useState(() => {
    // URL 파라미터에서 teamId 확인
    const params = new URLSearchParams(window.location.search);
    const urlTeamId = params.get("teamId");

    // 위치 상태, URL 파라미터, 로컬 스토리지 순으로 확인
    return (
      locationTargetId ||
      urlTeamId ||
      localStorage.getItem("currentTeamId") ||
      null
    );
  });

  const [transcript, setTranscript] = useState("");
  const videoRef = useRef(null);
  const [stream, setStream] = useState(null);

  // ID 매핑 상태
  const [idMappings, setIdMappings] = useState(() => {
    const savedMappings = localStorage.getItem("idMappings");
    return savedMappings ? JSON.parse(savedMappings) : {};
  });

  // 팀 ID 변경 시 URL 업데이트
  useEffect(() => {
    if (targetId) {
      // 현재 URL 파라미터 확인
      const params = new URLSearchParams(window.location.search);
      const currentTeamId = params.get("teamId");

      // URL 파라미터와 targetId가 다를 경우에만 업데이트
      if (currentTeamId !== targetId) {
        navigate(`?teamId=${targetId}`, { replace: true });
      }
    }
  }, [targetId, navigate]);

  // useCallback을 사용하여 함수 재생성 방지
  const addIdMappings = useCallback((clientId, backendId) => {
    if (!clientId || !backendId) {
      console.warn("ID 매핑 추가 실패: 유효하지 않은 ID");
      return;
    }

    setIdMappings((prevMappings) => {
      const newMappings = {
        ...prevMappings,
        [clientId]: backendId,
      };
      localStorage.setItem("idMappings", JSON.stringify(newMappings));
      return newMappings;
    });
  }, []);

  // location.state 변경 시 상태 업데이트
  useEffect(() => {
    if (!location.state) return;

    console.log("location.state 변경 감지:", location.state);

    // 팀 ID 설정
    if (locationTargetId) {
      setTargetId(locationTargetId);
      localStorage.setItem("currentTeamId", locationTargetId);
    }

    // Owner 모드 설정 (createTeamId가 있고 'create-'로 시작하는 경우)
    if (
      createTeamId &&
      typeof createTeamId === "string" &&
      createTeamId.startsWith("create-")
    ) {
      setOwner(true);
      setBasic(false);
      setJoin(false);
    }

    // 강제 새로고침 플래그가 있는 경우
    if (forceRefresh) {
      console.log("강제 새로고침 실행");
      // 필요한 상태 초기화 작업 수행
    }
  }, [location.state, locationTargetId, createTeamId, forceRefresh]);

  // 팀 이미지 LocalStorage 저장
  useEffect(() => {
    if (teamImages && Object.keys(teamImages).length > 0) {
      localStorage.setItem("teamImages", JSON.stringify(teamImages));
    }
  }, [teamImages]);

  // targetId 업데이트 로직
  useEffect(() => {
    if (targetId) {
      localStorage.setItem("currentTeamId", targetId);
    }
  }, [targetId]);

  // 멤버 추가 함수
  const AddMember = useCallback((name) => {
    if (!name) return;
    console.log("멤버 추가:", name);
    setUserName((prevNames) => {
      // 이미 존재하는 경우 중복 추가 방지
      if (prevNames.includes(name)) return prevNames;
      return [...prevNames, name];
    });
  }, []);

  // onCreateone 함수
  const onCreateone = useCallback((content) => {
    if (!content) return;

    const newId = lastId.current++;
    const newTeam = {
      id: newId,
      content,
      itemContent: content,
      isPlus: false,
    };
    dispatch({ type: "CREATE", data: newTeam });
  }, []);

  // 디스패치 메모이제이션
  const memoizedDispatch = useMemo(
    () => ({
      onCreateone,
      dispatch,
    }),
    [onCreateone]
  );

  useEffect(() => {
    // URL 파라미터에서 teamId 확인
    const params = new URLSearchParams(window.location.search);
    const urlTeamId = params.get("teamId");

    if (urlTeamId) {
      console.log("URL에서 팀 ID 감지:", urlTeamId);

      // 상태 초기화
      setTargetId(urlTeamId);
      localStorage.setItem("currentTeamId", urlTeamId);

      // createTeamId 형태로 변환
      const createTeamIdWithPrefix = `create-${urlTeamId}`;

      // Owner 모드 설정 (기본값)
      setOwner(true);
      setBasic(false);
      setJoin(false);

      // 없는 경우 강제 상태 설정
      if (!location.state) {
        console.log("location.state가 없음, 강제 상태 구성");

        // 팀 정보 가져오기 시도
        const getTeamInfo = () => {
          try {
            const teamsListJSON = localStorage.getItem("teamsList");
            if (!teamsListJSON) return null;

            const teamsList = JSON.parse(teamsListJSON);
            if (!Array.isArray(teamsList)) return null;

            // teamId와 일치하는 팀 찾기
            return teamsList.find((team) => {
              if (!team) return false;

              const backendId = String(
                team.backendId || team.team_id || team._originalId || ""
              );

              // 'create-' 접두어 제거 처리
              const cleanBackendId = backendId.startsWith("create-")
                ? backendId.replace("create-", "")
                : backendId;

              return cleanBackendId === urlTeamId;
            });
          } catch (error) {
            console.error("팀 정보 가져오기 실패:", error);
            return null;
          }
        };

        const teamInfo = getTeamInfo();
        console.log("찾은 팀 정보:", teamInfo);

        // 상태 수동 구성 (history.replaceState 사용)
        const stateToSet = {
          createTeamId: createTeamIdWithPrefix,
          content:
            teamInfo?.itemContent ||
            teamInfo?.content ||
            teamInfo?.team_name ||
            "",
          targetId: urlTeamId,
          createTeamUrl: teamInfo?.TeamUrl || teamInfo?.invite_link || "",
          itemId: teamInfo?.id || urlTeamId,
          itemBackendId: urlTeamId,
        };

        // history 상태 수동 업데이트
        window.history.replaceState(
          { ...location.state, ...stateToSet },
          document.title,
          window.location.href
        );

        console.log("상태 수동 구성 완료:", stateToSet);
      }
    }
  }, [location.search, setTargetId, setOwner, setBasic, setJoin]);

  // 메모이제이션된 Context 값
  const findIdValue = useMemo(
    () => ({
      filteredItem,
      teamImages,
      setTeamImages,
      createTeamId,
      content,
      createTeamUrl,
      idMappings,
      addIdMappings,
      targetId,
      setTargetId,
      itemBackendId,
      newTeamId,
      TeamJoinId,
    }),
    [
      filteredItem,
      teamImages,
      setTeamImages,
      createTeamId,
      content,
      createTeamUrl,
      idMappings,
      addIdMappings,
      targetId,
      setTargetId,
      itemBackendId,
      newTeamId,
      TeamJoinId,
    ]
  );

  const teamDelValue = useMemo(
    () => ({
      itemContent,
      itemId,
      image,
      setImage,
      itemImage,
      Owner,
      setOwner,
      join,
      setJoin,
      isTopic,
      setIsTopic,
      userName,
      setUserName,
      AddMember,
      inputName,
      setInputName,
      meetingId,
      setMeetingId,
    }),
    [
      itemContent,
      itemId,
      image,
      itemImage,
      Owner,
      setOwner,
      join,
      setJoin,
      isTopic,
      setIsTopic,
      userName,
      AddMember,
      inputName,
      setInputName,
      meetingId,
      setMeetingId,
    ]
  );

  // 조건부 렌더링
  const renderContent = () => {
    console.log("렌더링 상태:", { Owner, join, FullScreen });

    if (FullScreen) {
      return <FullScreenPage />;
    }

    if (Owner) {
      return <MainTeamOwner />;
    }

    if (join) {
      return <MTeamJoinNo />;
    }

    return <MainTeam />;
  };

  return (
    <SidebarContext.Provider value={{ todos, dispatch: memoizedDispatch }}>
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
          <FindId.Provider value={findIdValue}>
            <TeamDel.Provider value={teamDelValue}>
              <Call.Provider
                value={{
                  image,
                  setImage,
                  teamImages,
                  setTeamImages,
                  filteredItem,
                  setFilteredItem,
                  Owner,
                  setOwner,
                  join,
                  setJoin,
                }}
              >
                {renderContent()}
              </Call.Provider>
            </TeamDel.Provider>
          </FindId.Provider>
        </DiscordContext.Provider>
      </UseStateContext.Provider>
    </SidebarContext.Provider>
  );
};

export default MainPage;
