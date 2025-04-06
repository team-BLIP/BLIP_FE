import "../../CSS/ModalMember.css";
import { typography } from "../../../fonts/fonts";
import { color } from "../../../style/color";
import ESC from "../../../svg/ESC.svg";
import CopySvg from "../../../svg/copy.svg";
import okCopy from "../../../svg/okCopy.svg";
import { useState, useEffect } from "react";
import { useLocation } from "react-router-dom";

const ModalMember = ({ onClose }) => {
  const location = useLocation();
  const [teamUrl, setTeamUrl] = useState("");
  const [copyImg, setCopyImg] = useState(CopySvg);

  useEffect(() => {
    try {
      const storedTeams = JSON.parse(localStorage.getItem("teams") || "[]");
      if (storedTeams.length > 0) {
        const latestTeam = storedTeams[storedTeams.length - 1];
        if (latestTeam && latestTeam.TeamUrl) {
          console.log("로컬 스토리지에서 TeamUrl 발견:", latestTeam.TeamUrl);
          setTeamUrl(latestTeam.TeamUrl);
          return;
        }
      }
    } catch (error) {
      console.error("로컬 스토리지 접근 오류:", error);
    }
  }, [location.state]);

  const handleCopy = (urlToCopy) => {
    if (!urlToCopy) {
      alert("복사할 url이 없습니다.");
      return;
    }

    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard
        .writeText(urlToCopy)
        .then(() => {
          alert("초대 링크가 복사되었습니다.");
          setCopyImg(okCopy);
        })
        .catch((error) => {
          alert("초대 코드 복사를 실패했습니다");
        });
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
              {teamUrl || "팀 url 정보를 불러오는중입니다."}
            </div>
            <img src={copyImg} onClick={() => handleCopy(teamUrl)} />
          </div>
        </div>
        <div className="modal-member-button"></div>
      </div>
    </div>
  );
};

export default ModalMember;
