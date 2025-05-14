import "../../CSS/sidebarTeam.css";
import { typography } from "../../../fonts/fonts";
import { color } from "../../../style/color";
import {
  useContext,
  useEffect,
  useState,
  useRef,
  useCallback,
  memo,
} from "react";
import PropTypes from "prop-types";
import { UseStateContext } from "../../../contexts/AppContext";
import { TeamDel } from "../Main/Main";
import { FindId } from "../Main/Main";
import { useNavigate, useLocation } from "react-router-dom";
import listApi from "./api/listApi";
import Add from "../../../svg/add.svg";

// 로컬 스토리지 유틸리티 함수들
const storageUtils = {
  // 데이터 저장 함수
  save: (key, data) => {
    try {
      if (!data || !Array.isArray(data)) return;

      const cleanData = data.map((item) => ({
        ...item,
        itemContent: item.isDefaultAddButton
          ? "ADD_BUTTON"
          : typeof item.itemContent === "string"
          ? item.itemContent
          : typeof item.content === "string"
          ? item.content
          : "팀 이름",
      }));

      localStorage.setItem(key, JSON.stringify(cleanData));
    } catch (err) {
      console.error(`저장 오류 (${key}):`, err);
    }
  },

  // 데이터 로드 함수
  load: (key, defaultValue = []) => {
    try {
      const data = localStorage.getItem(key);
      if (!data) return defaultValue;

      if (data === "[object Object]" || data === "[object Array]") {
        localStorage.removeItem(key);
        return defaultValue;
      }

      return JSON.parse(data);
    } catch (err) {
      console.error("데이터 로드 오류:", err);
      localStorage.removeItem(key);
      return defaultValue;
    }
  },

  remove: (key) => {
    localStorage.removeItem(key);
  },
};

// 기본 팀 항목 생성 함수
const createDefaultTeam = () => ({
  id: "default-team",
  backendId: "default-team",
  _originalId: "default-team",
  TeamUrl: "",
  isPlus: true,
  itemContent: "ADD_BUTTON",
  content: "",
  isDefaultAddButton: true,
});

// 팀 ID 정규화 함수 - 매우 중요
const normalizeTeamIds = (team) => {
  if (!team) return null;

  // 원본 ID 결정
  let originalId = team._originalId || team._orginalId;

  // 'create-' 접두어가 있는 경우 정리
  if (typeof originalId === "string" && originalId.startsWith("create-")) {
    originalId = originalId.replace("create-", "");
  }

  // 백엔드 ID 결정 (문자열 'create-X'를 숫자로 정규화)
  let backendId = team.backendId || team.team_id || originalId;
  if (typeof backendId === "string" && backendId.startsWith("create-")) {
    backendId = backendId.replace("create-", "");
  }

  return {
    ...team,
    _originalId: originalId,
    _orginalId: originalId, // 호환성 유지
    backendId: backendId, // 백엔드 ID는 항상 숫자 또는 숫자 문자열
  };
};

// 중복 항목 제거 유틸리티 함수
const removeDuplicates = (teams) => {
  const result = [];
  const ids = new Set();
  let hasDefaultTeam = false;

  // 일반 팀 먼저 추가 (default-team 제외)
  for (const team of teams) {
    // ID 정규화
    const normalizedTeam = normalizeTeamIds(team);
    if (!normalizedTeam) continue;

    if (
      normalizedTeam.id === "default-team" ||
      normalizedTeam.isDefaultAddButton
    ) {
      hasDefaultTeam = true;
      continue;
    }

    const teamId = normalizedTeam.id || normalizedTeam._originalId;
    if (teamId && !ids.has(teamId)) {
      ids.add(teamId);
      result.push(normalizedTeam);
    }
  }

  // 기본 팀은 하나만 마지막에 추가
  if (hasDefaultTeam) {
    result.push(createDefaultTeam());
  }

  return result;
};

// TeamItem PropTypes 정의
const TeamItemPropTypes = {
  item: PropTypes.shape({
    isDefaultAddButton: PropTypes.bool,
    itemContent: PropTypes.string,
    content: PropTypes.string,
    isPlus: PropTypes.bool,
  }).isRequired,
  index: PropTypes.number,
  isSelected: PropTypes.bool,
  image: PropTypes.any,
  discord: PropTypes.bool,
  onClick: PropTypes.func.isRequired,
  teamImage: PropTypes.string,
};

// 팀 항목 컴포넌트 (성능 최적화를 위한 메모이제이션)
// memo로 감싸서 불필요한 리렌더링 방지
// 이미지가 없는 경우에도 텍스트를 가운데 정렬하는 TeamItem 컴포넌트
const TeamItem = memo(
  ({ item, isSelected, image, discord, onClick, teamImage }) => {
    // 기본 추가 버튼인 경우
    if (item.isDefaultAddButton || item.itemContent === "ADD_BUTTON") {
      return (
        <div
          className="content-item-plus"
          onClick={discord ? undefined : () => onClick(item)}
          style={{
            ...typography.Header2,
            backgroundColor: "transparent",
          }}
        >
          <span
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <img
              src={Add}
              alt="추가"
              style={{ width: "100%", height: "100%" }}
            />
          </span>
        </div>
      );
    }

    // 일반 팀 항목
    const teamDisplayName =
      typeof item.itemContent === "string" && item.itemContent !== "ADD_BUTTON"
        ? item.itemContent
        : typeof item.content === "string"
        ? item.content
        : "팀 이름";

    // 이미지 URL 결정 (teamImage prop 사용)
    const hasTeamImage = teamImage && typeof teamImage === "string";

    if (hasTeamImage) {
      // 이미지가 있는 경우 이미지로 꽉 채우고 초록색 테두리 제거
      return (
        <div
          className={isSelected && image ? "content-item-image" : ""}
          onClick={discord ? undefined : () => onClick(item)}
          style={{
            ...typography.Header2,
            backgroundColor: item.isPlus ? "transparent" : color.White,
            padding: 0, // 패딩 제거
            overflow: "hidden", // 넘치는 부분 숨김
            position: "relative", // 상대 위치 설정]
            width: "90%", // 너비 설정
            aspectRatio: "1 / 1", // 가로 세로 비율 유지
            borderRadius: "12px", // 모서리 둥글게
            marginBottom: "20%", // 하단 여백
            boxShadow: "none", // 초록색 테두리(그림자) 제거
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <img
            src={teamImage}
            alt={teamDisplayName}
            style={{
              width: "100%",
              height: "100%",
              objectFit: "cover", // 이미지 비율 유지하면서 영역 꽉 채움
              borderRadius: "inherit", // 부모 요소와 동일한 모서리 둥글기 적용
            }}
          />
        </div>
      );
    } else {
      // 이미지가 없는 경우 - 텍스트 가운데 정렬
      return (
        <div
          className="content-item"
          onClick={discord ? undefined : () => onClick(item)}
          style={{
            ...typography.Header2,
            backgroundColor: item.isPlus ? "transparent" : color.GrayScale[1],
            // 전체 컨테이너를 flex로 구성하여 중앙 정렬 용이하게
            display: "flex",
            alignItems: "center",
            justifyContent: "center", // 컨텐츠 가운데 정렬
          }}
        >
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "center", // 내부 컨텐츠 가운데 정렬
              width: "100%",
              padding: "0 8px",
              textAlign: "center", // 텍스트 가운데 정렬
            }}
          >
            <span
              style={{
                overflow: "hidden",
                textOverflow: "ellipsis",
                whiteSpace: "nowrap",
                maxWidth: "100%", // 너비 제한
                textAlign: "center", // 텍스트 가운데 정렬
              }}
            >
              {teamDisplayName}
            </span>
          </div>
        </div>
      );
    }
  }
);

// PropTypes 설정
TeamItem.propTypes = TeamItemPropTypes;
TeamItem.displayName = "TeamItem";

// 메인 컴포넌트
const SidebarTeam = () => {
  const location = useLocation();
  const [targetId, setTargetId] = useState("");
  const nav = useNavigate();
  const { image, Owner, setOwner, join, setJoin } = useContext(TeamDel) || {};
  const { basic, setBasic, discord } = useContext(UseStateContext) || {};
  const {
    createTeamId,
    content,
    idMappings,
    addIdMappings,
    teamImages,
    setTeamImages,
  } = useContext(FindId) || {};

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
  const [teamsLoaded, setTeamsLoaded] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  // 이미 처리된 업데이트 추적용 ref
  const processedUpdatesRef = useRef(new Set());

  // **수정된 부분: 팀 이미지 변경 이벤트 리스너**
  useEffect(() => {
    // 팀 이미지 업데이트 이벤트 처리 함수
    const handleTeamImageUpdate = (event) => {
      const { teamId, image } = event.detail || {};
      if (!teamId || !image) return;

      console.log(`팀 ${teamId} 이미지 업데이트 이벤트 수신`);

      // 함수형 업데이트로 불필요한 리렌더링 방지
      setTeamImages((prev) => {
        // 이미 같은 값인 경우 업데이트하지 않음
        if (prev && prev[teamId] === image) return prev;

        // 새 객체 생성
        return {
          ...prev,
          [teamId]: image,
        };
      });
    };

    // 이벤트 리스너 등록
    window.addEventListener("teamImageUpdate", handleTeamImageUpdate);

    // 클린업 함수
    return () => {
      window.removeEventListener("teamImageUpdate", handleTeamImageUpdate);
    };
  }, [setTeamImages]);

  // 로컬 스토리지 초기화 (마운트 시 한 번만 실행)
  useEffect(() => {
    if (
      localStorage.getItem("teamsList") === "[object Object]" ||
      localStorage.getItem("teamsList") === "[object Array]"
    ) {
      storageUtils.remove("teamsList");
    }
  }, []);

  const loadAndNormalizeTeams = useCallback(() => {
    try {
      console.log("팀 데이터 로드 및 정규화 시작");

      // 1. 단일 소스로 데이터 로드 (teamsList만 사용)
      // teamsList가 이제 유일한 소스가 됨
      let teamsListData = storageUtils.load("teamsList", []);
      console.log("teamsList 데이터:", teamsListData);

      // 하위 호환성을 위해 teams에서도 로드하지만 한 번만 실행 (초기 마이그레이션)
      const teamsData = storageUtils.load("teams", []);
      if (teamsData && teamsData.length > 0) {
        console.log("teams 데이터 발견 - 마이그레이션 실행:", teamsData);

        // teams의 데이터를 teamsList로 통합 (중복 처리 포함)
        const allTeams = [...teamsListData, ...teamsData];
        const uniqueTeams = removeDuplicates(allTeams);

        // teamsList에만 저장하고 teams는 비움
        storageUtils.save("teamsList", uniqueTeams);
        localStorage.setItem("teams", "[]"); // teams 비우기

        // 마이그레이션된 데이터 사용
        teamsListData = uniqueTeams;
      }

      // 2. ID 정규화 적용
      const normalizedTeams = teamsListData
        .map((team) => {
          const normalized = normalizeTeamIds(team);
          return normalized;
        })
        .filter(Boolean);

      const uniqueTeams = removeDuplicates(normalizedTeams);
      console.log("정규화 및 중복 제거 후 팀 목록:", uniqueTeams);

      // 3. 기본 팀 추가 확인
      const finalTeams = uniqueTeams.some((t) => t.id === "default-team")
        ? uniqueTeams
        : [...uniqueTeams, createDefaultTeam()];

      return finalTeams;
    } catch (error) {
      console.error("팀 데이터 로드 실패:", error);
      return [createDefaultTeam()]; // 오류 시 기본 팀만 반환
    }
  }, []);

  //라우터 상태 처리 병합 및 최적화**
  useEffect(() => {
    const locationState = location.state;
    if (!locationState) return;

    // 업데이트 정보 확인
    const hasUpdate =
      locationState.updatedTeamName ||
      locationState.updatedTeamImage ||
      locationState.forceRefresh;

    if (!hasUpdate) return;

    // 중복 처리 방지를 위한 고유 식별자
    const updateId =
      locationState.forceRefresh || `${locationState.itemId}_${Date.now()}`;

    // 이미 처리한 업데이트인지 확인
    if (processedUpdatesRef.current.has(updateId)) return;
    processedUpdatesRef.current.add(updateId);

    // 팀 ID 확인
    const teamId = locationState.itemId || locationState.targetId || targetId;
    if (!teamId) return;

    console.log("팀 데이터 업데이트 정보:", {
      teamId,
      name: locationState.updatedTeamName,
      image: locationState.updatedTeamImage,
    });

    // 팀 이름 업데이트 처리
    if (locationState.updatedTeamName) {
      const newName = locationState.updatedTeamName;

      // 함수형 업데이트로 불필요한 의존성 제거
      setLocalTodos((prevTodos) => {
        // 변경이 필요한지 확인
        let hasChanges = false;

        const updatedTodos = prevTodos.map((item) => {
          const normalized = normalizeTeamIds(item);
          if (!normalized) return item;

          if (
            String(normalized.backendId) === String(teamId) ||
            String(normalized.id) === String(teamId)
          ) {
            // 이름이 다른 경우만 업데이트
            if (normalized.itemContent !== newName) {
              hasChanges = true;
              return {
                ...normalized,
                itemContent: newName,
                content: newName,
              };
            }
          }
          return item;
        });

        // 변경사항이 있는 경우만 새 배열 반환
        return hasChanges ? updatedTodos : prevTodos;
      });
    }

    // 이미지 업데이트는 teamImages context로 처리됨

    // 전체 새로고침이 필요한 경우
    if (locationState.forceRefresh) {
      // 필요한 경우만 업데이트
      const freshTeams = loadAndNormalizeTeams();
      setLocalTodos(freshTeams);
    }

    // 업데이트 처리 완료 표시 (세션 스토리지 사용)
    try {
      sessionStorage.setItem(`processed_update_${updateId}`, "true");
    } catch (e) {
      console.error("세션 스토리지 저장 실패:", e);
    }
  }, [location.state, targetId, loadAndNormalizeTeams]);

  // 디바운스된 로컬 스토리지 저장 함수
  const saveToLocalStorageDebounced = useCallback((data) => {
    const timeoutId = setTimeout(() => {
      const uniqueData = removeDuplicates(data);
      storageUtils.save("teamsList", uniqueData);
    }, 300);
    return () => clearTimeout(timeoutId);
  }, []);

  // 팀 목록 변경 시 로컬 스토리지 저장
  useEffect(() => {
    if (localTodos && localTodos.length > 0) {
      return saveToLocalStorageDebounced(localTodos);
    }
  }, [localTodos, saveToLocalStorageDebounced]);

  // API에서 팀 목록 로드
  useEffect(() => {
    const loadTeams = async () => {
      try {
        setIsLoading(true);

        // 1. 로컬 스토리지에서 정규화된 팀 데이터 로드
        const localTeams = loadAndNormalizeTeams();

        // 일단 로컬 데이터로 UI 업데이트
        setLocalTodos(localTeams);

        // 2. URL 파라미터에서 팀 ID 가져오기
        const params = new URLSearchParams(location.search);
        const urlTeamId = params.get("teamId");
        if (urlTeamId) {
          setTargetId(urlTeamId);
          localStorage.setItem("currentTeamId", urlTeamId);
        } else {
          // URL에 없으면 로컬 스토리지에서 가져오기
          const storedTeamId = localStorage.getItem("currentTeamId");
          if (storedTeamId) {
            setTargetId(storedTeamId);
          }
        }

        // 3. API에서 최신 데이터 가져오기
        const teamsData = await listApi();
        if (teamsData && teamsData.length > 0) {
          // API 데이터 처리 및 형식 변환
          const formattedTeams = teamsData.map((team) => {
            // 안전하게 텍스트 추출
            const safeContent =
              typeof team.content === "string" ? team.content : "";
            const safeName = typeof team.name === "string" ? team.name : "";
            const safeTitle = typeof team.title === "string" ? team.title : "";

            // API 결과에서 가져온 팀 ID는 백엔드 ID
            const teamId = team.id || team.team_id;

            return {
              id: teamId,
              backendId: teamId,
              _originalId: teamId,
              _orginalId: teamId, // 호환성 유지
              TeamUrl: team.url || team.team_url || "",
              isPlus: team.isPlus || false,
              itemContent:
                safeName || safeTitle || safeContent || "팀 이름 없음",
              content: safeContent || "",
            };
          });

          // 4. 기존 로컬 데이터와 API 데이터 병합 및 정규화
          const mergedTeams = [...formattedTeams, ...localTeams];
          const uniqueTeams = removeDuplicates(mergedTeams);

          // UI 업데이트
          setLocalTodos(uniqueTeams);
          setTeamsLoaded(true);
        }
      } catch (error) {
        console.error("팀 목록 로드 실패:", error);
      } finally {
        setIsLoading(false);
      }
    };

    loadTeams();
  }, [location.search, loadAndNormalizeTeams]);

  // todos context 상태가 변경될 때 처리
  useEffect(() => {
    if (createTeamId) {
      // 로컬 스토리지에서 최신 팀 데이터 로드
      const freshTeams = loadAndNormalizeTeams();
      console.log("새 팀 추가 감지 - 최신 데이터 로드:", freshTeams);

      // 상태 업데이트
      setLocalTodos(freshTeams);
    }
  }, [
    createTeamId,
    idMappings,
    teamsLoaded,
    localTodos.length,
    loadAndNormalizeTeams,
  ]);

  // 백엔드와 클라이언트 ID 매핑 처리
  useEffect(() => {
    if (createTeamId && typeof addIdMappings === "function") {
      try {
        // createTeamId가 'create-123' 형식인 경우
        if (
          typeof createTeamId === "string" &&
          createTeamId.startsWith("create-")
        ) {
          const clientId = createTeamId;
          const backendId = createTeamId.replace("create-", "");
          addIdMappings(clientId, backendId);
          console.log(`ID 매핑 추가: ${clientId} -> ${backendId}`);
        }
        // createTeamId가 객체인 경우
        else if (createTeamId && typeof createTeamId === "object") {
          const clientId = createTeamId.id;
          const backendId = createTeamId._originalId || createTeamId._orginalId;
          if (clientId && backendId) {
            addIdMappings(clientId, backendId);
            console.log(`ID 매핑 추가 (객체): ${clientId} -> ${backendId}`);
          }
        }
      } catch (error) {
        console.error("ID 매핑 추가 실패:", error);
      }
    }
  }, [createTeamId, addIdMappings]);

  // 새로고침 시 상태 복원
  useEffect(() => {
    const storedTeamId = localStorage.getItem("currentTeamId");
    if (storedTeamId && !targetId) {
      setTargetId(storedTeamId);

      // URL 업데이트
      const currentParams = new URLSearchParams(location.search);
      if (!currentParams.has("teamId")) {
        nav(`?teamId=${storedTeamId}`, { replace: true });
      }
    }
  }, [targetId, nav, location.search]);

  // **수정된 부분: 로컬 스토리지에서 이미지 로드**
  useEffect(() => {
    try {
      const storedImages = localStorage.getItem("teamImages");
      if (!storedImages) return;

      const parsedImages = JSON.parse(storedImages);
      if (!parsedImages || typeof parsedImages !== "object") return;

      // 이미 teamImages에 있는 내용과 비교하여 필요한 경우만 업데이트
      const currentKeys = Object.keys(teamImages || {});
      const storedKeys = Object.keys(parsedImages);

      // 새로운 키가 있거나, 기존 키의 값이 다른 경우에만 업데이트
      const needsUpdate = storedKeys.some(
        (key) =>
          !currentKeys.includes(key) || teamImages[key] !== parsedImages[key]
      );

      if (needsUpdate) {
        setTeamImages((prev) => ({
          ...prev,
          ...parsedImages,
        }));
      }
    } catch (error) {
      console.error("로컬 스토리지 이미지 로드 실패:", error);
    }
  }, []);

  // 팀 삭제 이벤트 처리 함수 업데이트
  useEffect(() => {
    const handleTeamDeleted = (event) => {
      const { teamId, forceUpdate } = event.detail || {};
      console.log(
        "팀 삭제 이벤트 감지:",
        teamId,
        "강제 업데이트:",
        forceUpdate
      );

      if (!teamId) return;

      // 즉시 UI 업데이트
      setLocalTodos((prevTodos) => {
        const updatedTodos = prevTodos.filter((todo) => {
          if (!todo) return false;

          const todoId =
            todo.id || todo.team_id || todo.backendId || todo._originalId;
          return String(todoId) !== String(teamId);
        });

        // 변경사항이 있는 경우에만 새 배열 반환
        return updatedTodos;
      });

      // 로컬 스토리지 업데이트
      const teamsListJSON = localStorage.getItem("teamsList");
      if (teamsListJSON) {
        try {
          const teamsList = JSON.parse(teamsListJSON);
          const updatedTeamsList = teamsList.filter((team) => {
            if (!team) return false;
            const teamIds = [
              team.id,
              team.team_id,
              team.backendId,
              team._originalId,
            ].map(String);
            return !teamIds.includes(String(teamId));
          });
          localStorage.setItem("teamsList", JSON.stringify(updatedTeamsList));
        } catch (error) {
          console.error("팀 목록 업데이트 실패:", error);
        }
      }

      // 강제 업데이트가 필요한 경우
      if (forceUpdate) {
        const freshTeams = loadAndNormalizeTeams();
        setLocalTodos(freshTeams);
      }
    };

    window.addEventListener("teamDeleted", handleTeamDeleted);
    return () => window.removeEventListener("teamDeleted", handleTeamDeleted);
  }, [loadAndNormalizeTeams]);

  // 팀 클릭 이벤트 핸들러 (메모이제이션)
  const onClickEffect = useCallback(
    async (item) => {
      if (!item) return;

      // ID 정규화 적용
      const normalizedItem = normalizeTeamIds(item);

      // 기존 처리 로직
      const itemId = (
        normalizedItem._originalId ||
        normalizedItem.id ||
        ""
      ).toString();
      const itemContent =
        typeof normalizedItem.content === "string"
          ? normalizedItem.content
          : typeof normalizedItem.itemContent === "string" &&
            normalizedItem.itemContent !== "ADD_BUTTON"
          ? normalizedItem.itemContent
          : "";
      const itemUrl = normalizedItem.TeamUrl || "";
      const itemBackendId = normalizedItem.backendId;

      // 'create-' 접두어 제거된 백엔드 ID
      const cleanBackendId =
        typeof itemBackendId === "string" && itemBackendId.startsWith("create-")
          ? itemBackendId.replace("create-", "")
          : itemBackendId;

      // 디버깅 로그
      console.log("팀 클릭:", {
        원본ID: itemId,
        백엔드ID: cleanBackendId,
        content: itemContent,
      });

      // 현재 선택한 팀 ID 저장
      setTargetId(cleanBackendId);
      localStorage.setItem("currentTeamId", cleanBackendId);

      // URL 파라미터 업데이트
      nav(`?teamId=${cleanBackendId}`, { replace: true });

      if (normalizedItem.isPlus || normalizedItem.isDefaultAddButton) {
        if (basic) {
          setBasic((prev) => !prev);
        }
        if (join) {
          setJoin((prev) => !prev);
        }
        nav("/mainPage", { state: { createTeamId, content, itemId } });
      } else {
        const currentTeamId = `create-${cleanBackendId}`;

        if (currentTeamId.startsWith("create-")) {
          if (Owner) setOwner((prev) => !prev);
          if (!basic) setBasic((prev) => !prev);
          if (join) setJoin((prev) => !prev);
        } else {
          if (!join) setJoin(false);
          if (!basic) setBasic(false);
          if (Owner) setOwner(false);
        }

        nav("/mainPage", {
          state: {
            createTeamId: currentTeamId,
            content: itemContent,
            targetId: cleanBackendId,
            createTeamUrl: itemUrl,
            itemId,
            itemBackendId: cleanBackendId,
          },
        });
      }

      // 상태 리셋
      if (isLetter) setIsLetter(false);
      if (setting) setSetting(false);
      if (isAlarm) setIsAlarm(false);
      if (isKeyword) setIsKeyword(false);
      if (isFeedback) setIsFeedback(false);
    },
    [
      createTeamId,
      content,
      nav,
      basic,
      setBasic,
      join,
      setJoin,
      Owner,
      setOwner,
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
    ]
  );

  // 디버깅을 위한 팀 목록 로그 출력
  useEffect(() => {
    if (localTodos.length > 0) {
      console.log("현재 팀 목록 업데이트됨");
    }
  }, [localTodos]);

  return (
    <div className="MainSTJoinNo">
      {isLoading ? (
        <div style={{ padding: "16px", textAlign: "center" }}>
          팀 목록을 불러오는 중입니다...
        </div>
      ) : localTodos && localTodos.length > 0 ? (
        localTodos.map((item) => {
          // ID 정규화 적용
          const normalizedItem = normalizeTeamIds(item);
          if (!normalizedItem) return null;

          // 현재 선택된 팀인지 확인
          const storedTeamId = localStorage.getItem("currentTeamId");
          const isSelected =
            String(normalizedItem.backendId) === String(targetId) ||
            String(normalizedItem.backendId) === String(storedTeamId);

          // 팀 이미지 가져오기
          const teamId = normalizedItem.backendId;
          const teamImage = teamImages && teamImages[teamId];

          return (
            <TeamItem
              key={`team-${
                normalizedItem._originalId || normalizedItem.id || Date.now()
              }`}
              item={normalizedItem}
              isSelected={isSelected}
              image={image}
              discord={discord}
              onClick={onClickEffect}
              teamImage={teamImage}
            />
          );
        })
      ) : (
        <div style={{ padding: "16px", textAlign: "center" }}>
          표시할 팀이 없습니다. 새 팀을 추가해보세요.
        </div>
      )}
    </div>
  );
};

export default SidebarTeam;
