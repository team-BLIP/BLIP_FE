// utils/IdUtils.js

/**
 * ID 관련 유틸리티 함수들
 * 회의/팀 ID 정리 및 변환 기능 제공
 */
export const IdUtils = {
  /**
   * ID 정리 - "create-123" 형식에서 "123"을 추출
   * @param {string|number} id 정리할 ID
   * @returns {string|number} 정리된 ID
   */
  cleanId: (id) => {
    if (typeof id === "string" && id.includes("create-")) {
      const match = id.match(/create-(\d+)/);
      return match?.[1] || id;
    }
    return id;
  },

  /**
   * 유효한 팀 ID 가져오기 (우선순위 적용)
   * @param {Object} params ID 관련 파라미터
   * @returns {string|number} 유효한 팀 ID
   */
  getValidTeamId: ({ itemBackendId, createTeamId, itemId }) => {
    const teamId = itemBackendId || createTeamId || itemId;
    return IdUtils.cleanId(teamId);
  },

  /**
   * 유효한 회의 ID 가져오기
   * @param {string|number} meetingId 원본 회의 ID
   * @returns {string|number} 정리된 회의 ID
   */
  getValidMeetingId: (meetingId) => {
    return IdUtils.cleanId(meetingId);
  },

  /**
   * 새 팀 생성 여부 확인
   * @param {string|number} createTeamId 팀 생성 ID
   * @returns {boolean} 새 팀 생성 여부
   */
  isNewTeam: (createTeamId) => {
    return (
      typeof createTeamId === "string" && createTeamId.startsWith("create-")
    );
  },
};

export default IdUtils;
