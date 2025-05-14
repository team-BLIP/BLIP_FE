import axios from "axios";

//팀 삭제 API 호출 함수
const listDel = async (idToDelete, onSuccessOrItemId = null) => {
  // idToDelete 유효성 검사
  if (!idToDelete) {
    console.error("삭제할 팀 ID가 제공되지 않았습니다.");
    return false;
  }

  const apiUrl = import.meta.env.VITE_API_URL_BASE.trim() || "";
  const accessToken = localStorage.getItem("accessToken");

  // 토큰 디버깅 (보안을 위해 일부만 출력)
  console.log(
    "사용 중인 토큰 (앞부분만):",
    accessToken ? accessToken.substring(0, 10) + "..." : "토큰 없음"
  );

  // 삭제 API 엔드포인트 구성
  const deleteUrl = `${apiUrl}teams/${idToDelete}`;
  console.log("삭제 요청 URL:", deleteUrl);

  try {
    // 요청 헤더 설정
    const headers = {
      "Content-Type": "application/json",
      Authorization: `Bearer ${accessToken}`,
    };

    // DELETE 요청 보내기
    const response = await axios.delete(deleteUrl, { headers });

    console.log("팀 삭제 성공:", response.data);

    // 로컬 스토리지에서 팀 데이터 제거
    removeTeamFromLocalStorage(idToDelete);

    // 최근 삭제된 팀 ID 저장 (listApi에서 사용)
    localStorage.setItem("recentlyDeletedTeamId", String(idToDelete));

    // 성공 콜백 호출 (제공된 경우)
    if (typeof onSuccessOrItemId === "function") {
      onSuccessOrItemId(idToDelete);
    }

    // 커스텀 이벤트 발생 - 팀 삭제 알림
    window.dispatchEvent(
      new CustomEvent("teamDeleted", {
        detail: {
          teamId: idToDelete,
          uiItemId:
            typeof onSuccessOrItemId === "string" ? onSuccessOrItemId : null,
        },
      })
    );

    return true;
  } catch (error) {
    console.error("팀 삭제 실패:", error);

    if (error.response) {
      console.error("상태 코드:", error.response.status);
      console.error("응답 데이터:", error.response.data);

      // 오류 유형에 따른 처리
      if (error.response.status === 403) {
        console.error("권한 오류: 이 팀을 삭제할 권한이 없습니다.");
      } else if (error.response.status === 404) {
        // 이미 삭제된 팀일 경우, 로컬에서만 삭제 처리
        console.warn("팀을 찾을 수 없습니다. 로컬에서만 삭제합니다.");
        removeTeamFromLocalStorage(idToDelete);

        // 최근 삭제된 팀 ID 저장
        localStorage.setItem("recentlyDeletedTeamId", String(idToDelete));

        // 성공 콜백 호출 (제공된 경우)
        if (typeof onSuccessOrItemId === "function") {
          onSuccessOrItemId(idToDelete);
        }

        // 커스텀 이벤트 발생 - 팀 삭제 알림
        window.dispatchEvent(
          new CustomEvent("teamDeleted", {
            detail: {
              teamId: idToDelete,
              uiItemId:
                typeof onSuccessOrItemId === "string"
                  ? onSuccessOrItemId
                  : null,
            },
          })
        );

        return true; // 성공으로 처리
      } else if (error.response.status === 500) {
        console.error("서버 내부 오류. 백엔드 팀에 문의하세요.");
      }
    } else if (error.request) {
      // 요청은 보냈으나 응답이 없는 경우
      console.error(
        "서버 응답 없음. 네트워크 상태를 확인하세요:",
        error.request
      );
    } else {
      // 요청 설정 과정에서 발생한 오류
      console.error("요청 오류:", error.message);
    }

    return false;
  }
};

/**
 * 로컬 스토리지에서 삭제된 팀 데이터 제거
 * @param {string|number} teamId - 삭제할 팀 ID
 */
function removeTeamFromLocalStorage(teamId) {
  try {
    // 문자열로 변환하여 비교 일관성 유지
    const teamIdStr = String(teamId);

    // 팀 목록 가져오기
    const teamsListJSON = localStorage.getItem("teamsList");
    if (teamsListJSON) {
      let teamsList;
      try {
        teamsList = JSON.parse(teamsListJSON);
      } catch (parseError) {
        console.error("teamsList JSON 파싱 오류:", parseError);
        teamsList = [];
      }

      // null 체크 추가
      if (Array.isArray(teamsList)) {
        // 해당 ID를 가진 팀 제거 로직
        const updatedTeamsList = teamsList.filter((team) => {
          if (!team) return false; // null이나 undefined 객체 필터링

          const currentTeamId = String(team.id || "");
          const backendId = String(team.backendId || "");
          const originalId = String(team._originalId || "");
          const teamTeamId = String(team.team_id || "");

          return (
            currentTeamId !== teamIdStr &&
            backendId !== teamIdStr &&
            originalId !== teamIdStr &&
            teamTeamId !== teamIdStr
          );
        });

        // 업데이트된 팀 목록 저장
        localStorage.setItem("teamsList", JSON.stringify(updatedTeamsList));

        // 현재 선택된 팀이 삭제된 팀인 경우, 선택 상태 초기화
        const currentTeamId = localStorage.getItem("currentTeamId");
        if (currentTeamId === teamIdStr) {
          localStorage.removeItem("currentTeamId");
        }
      }
    }

    // 기존 teams 데이터도 업데이트 (CreateApi와의 호환성)
    const teamsJSON = localStorage.getItem("teams");
    if (teamsJSON) {
      let teams;
      try {
        teams = JSON.parse(teamsJSON);
      } catch (parseError) {
        console.error("teams JSON 파싱 오류:", parseError);
        teams = [];
      }

      // null 체크와 배열 체크 추가
      if (Array.isArray(teams)) {
        //필터링 로직
        const updatedTeams = teams.filter((team) => {
          if (!team) return false; // null이나 undefined 객체 필터링

          // 접두사가 있는 ID와 원본 ID 모두 확인
          const prefixedId = String(`create-${teamId}`);
          // 두 가지 철자 모두 처리 (_originalId 및 _orginalId)
          const originalId = String(team._originalId || team._orginalId || "");
          const currentTeamId = String(team.id || "");

          return (
            currentTeamId !== prefixedId &&
            originalId !== String(teamIdStr) &&
            currentTeamId !== teamIdStr
          );
        });

        localStorage.setItem("teams", JSON.stringify(updatedTeams));
      }
    }

    // 삭제 작업 완료 후 UI 갱신을 위한 상태 업데이트 이벤트 발생
    console.log("로컬 스토리지에서 팀 데이터 제거 완료:", teamIdStr);
  } catch (error) {
    console.error("로컬 스토리지에서 팀 제거 실패:", error);
  }
}

export default listDel;
