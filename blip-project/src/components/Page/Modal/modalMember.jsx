import "../../CSS/ModalMember.css";
import { typography } from "../../../fonts/fonts";
import { color } from "../../../style/color";
import ESC from "../../../svg/ESC.svg";
import CopySvg from "../../../svg/copy.svg";
import okCopy from "../../../svg/okCopy.svg";
import { useState, useEffect, useContext } from "react";
import { FindId } from "../Main/Main";
import PropTypes from "prop-types";

const ModalMember = ({ onClose = () => {} }) => {
  const [inviteLink, setInviteLink] = useState("");
  const [copyImg, setCopyImg] = useState(CopySvg);
  const [isLoading, setIsLoading] = useState(true);
  const { createTeamId } = useContext(FindId);

  useEffect(() => {
    setIsLoading(true);
    console.log("ModalMember - createTeamId:", createTeamId);

    if (!createTeamId) {
      console.error("createTeamId가 없습니다.");
      setIsLoading(false);
      return;
    }

    try {
      // localStorage에서 팀 정보 확인
      const storedTeams = JSON.parse(localStorage.getItem("teamsList") || "[]");
      console.log("저장된 팀 목록:", storedTeams);

      // ID 정규화 함수
      const normalizeId = (id) => {
        if (typeof id === 'string' && id.startsWith('create-')) {
          return id.replace('create-', '');
        }
        return String(id);
      };

      const normalizedCreateTeamId = normalizeId(createTeamId);
      console.log("정규화된 createTeamId:", normalizedCreateTeamId);

      // 팀 찾기
      const currentTeam = storedTeams.find(team => {
        if (!team) return false;
        
        const teamIdMatch = normalizeId(team.team_id) === normalizedCreateTeamId;
        const idMatch = normalizeId(team.id) === normalizedCreateTeamId;
        const backendIdMatch = normalizeId(team.backendId) === normalizedCreateTeamId;
        const originalIdMatch = normalizeId(team._originalId) === normalizedCreateTeamId;

        return teamIdMatch || idMatch || backendIdMatch || originalIdMatch;
      });

      console.log("찾은 팀 정보:", currentTeam);

      if (currentTeam) {
        // invite_link를 직접 표시
        const link = currentTeam.invite_link;
        
        if (link) {
          console.log("초대 링크 발견:", link);
          setInviteLink(link);
        } else {
          console.warn("팀은 찾았으나 초대 링크가 없습니다:", currentTeam);
          setInviteLink("");
        }
      } else {
        console.warn("해당하는 팀을 찾을 수 없습니다. createTeamId:", createTeamId);
        setInviteLink("");
      }
    } catch (error) {
      console.error("초대 링크 로드 중 오류 발생:", error);
      setInviteLink("");
    } finally {
      setIsLoading(false);
    }
  }, [createTeamId]);

  const handleCopy = async (linkToCopy) => {
    if (!linkToCopy) {
      alert("복사할 초대 링크가 없습니다.");
      return;
    }

    try {
      await navigator.clipboard.writeText(linkToCopy);
      alert("초대 링크가 복사되었습니다.");
      setCopyImg(okCopy);
      setTimeout(() => setCopyImg(CopySvg), 2000);
    } catch (error) {
      console.error("클립보드 복사 실패:", error);
      alert("초대 링크 복사를 실패했습니다");
    }
  };

  return (
    <div className="modal-overlay">
      <div className="modal-content">
        <div className="modal-member-header">
          <div>
            <div style={typography.Label2_46}>팀원 초대하기</div>
            <div
              className="modal-member-p"
              style={{ ...typography.Body1, color: color.GrayScale[6] }}
            >
              팀원을 초대하고 더 큰 규모로 성장하세요!
            </div>
          </div>
          <img src={ESC} alt="닫기" onClick={onClose} />
        </div>
        <div className="modal-member-main">
          <div
            className="modal-member-main-title"
            style={{ ...typography.Title2, "--gray-700": color.GrayScale[7] }}
          >
            초대 링크
          </div>
          <p style={{ ...typography.Button2, color: color.GrayScale[6] }}>
            팀원에게 공유해주세요!
          </p>
          <div className="modal-member-main-url-main">
            <div className="modal-member-main-url">
              {isLoading 
                ? "초대 링크를 불러오는 중입니다..." 
                : inviteLink || "초대 링크를 찾을 수 없습니다."}
            </div>
            <img 
              src={copyImg} 
              onClick={() => handleCopy(inviteLink)}
              style={{ cursor: inviteLink ? "pointer" : "not-allowed" }}
              alt="복사하기"
            />
          </div>
        </div>
        <div className="modal-member-button"></div>
      </div>
    </div>
  );
};

ModalMember.propTypes = {
  onClose: PropTypes.func
};

export default ModalMember;
