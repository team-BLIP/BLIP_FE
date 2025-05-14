import {
  createContext,
  useContext,
  useState,
  useMemo,
  useCallback,
} from "react";
import PropTypes from "prop-types";

// 초기 상태 정의
export const initialContextState = {
  setting: false,
  isAlarm: false,
  isLetter: false,
  isFeedback: false,
  isKeyword: false,
  discord: false,
  isMike: false,
  isCamera: false,
  FullScreen: false,
  meetingEnd: false,
  isListening: false,
  basic: false,
  transcript: "",
  videoRef: null,
  stream: null,
  TeamJoin: null,
  targetId: null,
  recorder: null,
  recordedChunks: [],
  isUploading: false,
};

// Context 생성
export const UseStateContext = createContext(initialContextState);
export const SidebarContext = createContext(null);
export const DiscordContext = createContext(null);
export const CallContext = createContext(null);

// Custom hooks for each context
export const useAppState = () => {
  const context = useContext(UseStateContext);
  if (!context) {
    throw new Error(
      "useAppState must be used within a UseStateContextProvider"
    );
  }
  return context;
};

export const useSidebar = () => {
  const context = useContext(SidebarContext);
  if (!context) {
    throw new Error("useSidebar must be used within a SidebarContextProvider");
  }
  return context;
};

export const useDiscord = () => {
  const context = useContext(DiscordContext);
  if (!context) {
    throw new Error("useDiscord must be used within a DiscordContextProvider");
  }
  return context;
};

export const useCall = () => {
  const context = useContext(CallContext);
  if (!context) {
    throw new Error("useCall must be used within a CallContextProvider");
  }
  return context;
};

// Main Provider Component
export const AppContextProvider = ({ children }) => {
  const [state, setState] = useState(initialContextState);

  const createStateSetter = useCallback(
    (key) => (value) => {
      setState((prev) => {
        const newValue = typeof value === "function" ? value(prev[key]) : value;
        // 값이 같으면 업데이트하지 않음
        if (prev[key] === newValue) {
          return prev;
        }
        return {
          ...prev,
          [key]: newValue,
        };
      });
    },
    []
  );
  const [discordState] = useState({});
  const [callState] = useState({});
  const [sidebarState] = useState({})

  const setters = useMemo(() => {
    const optimizedSetters = {};
    Object.keys(initialContextState).forEach((key) => {
      // 메서드 이름이 setKey 형식이므로 `set${key.charAt(0).toUpperCase()}${key.slice(1)}`로 동적으로 설정
      optimizedSetters[`set${key.charAt(0).toUpperCase()}${key.slice(1)}`] =
        createStateSetter(key);
    });
    return optimizedSetters;
  }, [createStateSetter]);

  // Context 값 메모이제이션
  const contextValue = useMemo(
    () => ({
      ...state,
      ...setters,
    }),
    [state, setters]
  );

  const sidebarValue = useMemo(
    () => ({
      ...sidebarState,
      dispatch: sidebarState.dispatch,
    }),
    [sidebarState]
  );

  return (
    <UseStateContext.Provider value={contextValue}>
      <SidebarContext.Provider value={sidebarValue}>
        <DiscordContext.Provider value={discordState}>
          <CallContext.Provider value={callState}>
            {children}
          </CallContext.Provider>
        </DiscordContext.Provider>
      </SidebarContext.Provider>
    </UseStateContext.Provider>
  );
};

// PropTypes
AppContextProvider.propTypes = {
  children: PropTypes.node.isRequired,
};
