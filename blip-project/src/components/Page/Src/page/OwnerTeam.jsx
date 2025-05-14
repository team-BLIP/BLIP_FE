import "../../../CSS/OwnerTeam.css";
import { typography } from "../../../../fonts/fonts";
import { color } from "../../../../style/color";
import { useRef, useState, useContext, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { TeamDel } from "../../Main/Main";
import { FindId } from "../../Main/Main";
import ModalDel from "../../Modal/ModalDel";
import Camera from "../../../../svg/camera.svg";
import settingApi from "../api/settingApi";
import { useAppState } from "../../../../contexts/AppContext";

const OwnerTeam = () => {
  // 상태 관리
  const [teamName, setTeamName] = useState("");
  const [previewImage, setPreviewImage] = useState(null);
  const [teamId, setTeamId] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isOpenModal, setIsOpenModal] = useState(false);

  // 컨텍스트에서 데이터 가져오기
  const { itemContent, itemId, image, setImage } = useContext(TeamDel);
  const { teamImages, setTeamImages } = useContext(FindId);
  const { setSetting: appSetSetting } = useAppState();

  // 네비게이션 및 파일 입력 참조
  const navigate = useNavigate();
  const fileInputRef = useRef(null);

  // 팀 ID 로드 및 설정
  useEffect(() => {
    try {
      const storedTeamId = localStorage.getItem("currentTeamId");
      if (storedTeamId) {
        setTeamId(storedTeamId);
        console.log("팀 ID 로드됨:", storedTeamId);

        // 팀 정보 로드
        loadTeamInfo(storedTeamId);
      }
    } catch (error) {
      console.error("localStorage 접근 오류:", error);
    }
  }, []);

  /**
   * 팀 정보 로드 함수
   * @param {string} id 팀 ID
   */
  const loadTeamInfo = (id) => {
    try {
      const teamsListStr = localStorage.getItem("teamsList");
      if (!teamsListStr) return;

      const teamsList = JSON.parse(teamsListStr);
      const currentTeam = teamsList.find(
        (team) =>
          String(team.backendId) === String(id) ||
          String(team.id) === String(id)
      );

      if (currentTeam) {
        // 팀 이름 있으면 placeholder용으로 저장
        const currentTeamName =
          currentTeam.itemContent || currentTeam.content || `Team ${id}`;
        console.log("현재 팀 이름:", currentTeamName);
      }
    } catch (error) {
      console.error("팀 정보 로드 오류:", error);
    }
  };

  // 모달 관리 함수
  const openModal = () => setIsOpenModal(true);
  const closeModal = () => setIsOpenModal(false);

  // 이미지 입력 활성화
  const handleImageClick = () => fileInputRef.current?.click();

  // 이름 입력 처리
  const handleNameChange = (e) => setTeamName(e.target.value);

  // 이미지 업로드 처리
  const handleImageUpload = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = () => {
      const imageData = reader.result;
      setPreviewImage(imageData);
      setImage(imageData); // context 업데이트
    };
    reader.readAsDataURL(file);
  };

  /**
   * 로컬 팀 이름 업데이트 함수
   * @param {string} id 팀 ID
   * @param {string} newName 새 팀 이름
   * @returns {boolean} 성공 여부
   */
  const updateLocalTeamName = (id, newName) => {
    try {
      console.log(`로컬 팀 이름 업데이트: ID=${id}, 새 이름=${newName}`);

      const teamsListStr = localStorage.getItem("teamsList");
      if (!teamsListStr) return false;

      const teamsList = JSON.parse(teamsListStr);
      let isUpdated = false;

      const updatedTeams = teamsList.map((team) => {
        if (
          String(team.backendId) === String(id) ||
          String(team.id) === String(id)
        ) {
          isUpdated = true;
          return {
            ...team,
            itemContent: newName,
            content: newName,
          };
        }
        return team;
      });

      if (isUpdated) {
        localStorage.setItem("teamsList", JSON.stringify(updatedTeams));
        console.log(`팀 이름이 '${newName}'으로 업데이트됨`);
        return true;
      }

      return false;
    } catch (error) {
      console.error("로컬 팀 이름 업데이트 실패:", error);
      return false;
    }
  };

  /**
   * 설정 저장 함수
   */
  const saveSettings = async () => {
    // 변경사항 확인
    const hasChanges = Boolean(image || teamName);
    if (!hasChanges) {
      alert("변경사항이 없습니다. 이미지를 업로드하거나 이름을 변경해주세요.");
      return;
    }

    // 팀 ID 확인
    if (!teamId) {
      const storedTeamId = localStorage.getItem("currentTeamId");
      if (storedTeamId) {
        setTeamId(storedTeamId);
        alert("팀 정보를 다시 불러왔습니다. 잠시 후 다시 시도해주세요.");
      } else {
        alert(
          "팀 정보를 찾을 수 없습니다. 페이지를 새로고침 후 다시 시도해주세요."
        );
      }
      return;
    }

    try {
      setIsSubmitting(true);
      console.log("설정 저장 시작 - 팀ID:", teamId);

      // API 호출 (비동기) - 개선된 API는 토큰이 없어도 로컬 저장 결과 반환
      const apiResponse = await settingApi(teamId, teamName, image);
      console.log("API 응답:", apiResponse);

      // 로컬 데이터 업데이트 (성공 여부와 무관하게 진행)
      const localUpdates = [];

      // 1. 이미지 업데이트
      if (image) {
        const newTeamImages = {
          ...teamImages,
          [teamId]: image,
        };

        // Context 업데이트
        setTeamImages(newTeamImages);

        // 로컬 스토리지 저장
        localStorage.setItem("teamImages", JSON.stringify(newTeamImages));
        localUpdates.push("이미지");
      }

      // 2. 팀 이름 업데이트
      if (teamName && teamName.trim() !== "") {
        const nameUpdated = updateLocalTeamName(teamId, teamName.trim());
        if (nameUpdated) {
          localUpdates.push("이름");
        }
      }

      console.log(`로컬 업데이트 완료: ${localUpdates.join(", ")}`);

      // 메인 페이지로 이동 - 상태 전달로 새로고침 유도
      navigate("/", {
        state: {
          itemId,
          updatedTeamName: teamName || null,
          updatedImage: image ? true : false,
          forceRefresh: Date.now(), // 새로고침 트리거
          localOnly: apiResponse.isLocalOnly || false,
        },
      });

      // 설정 모드 종료
      appSetSetting(false);
    } catch (error) {
      console.error("설정 저장 중 오류 발생:", error);
      alert("오류가 발생했습니다. 다시 시도해주세요.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="owner-main">
      <div className="owner-body">
        <div style={{ ...typography.Header1, color: color.GrayScale[8] }}>
          설정
        </div>

        {/* 팀 이미지 섹션 */}
        <div>
          <div style={{ ...typography.Header2, color: color.GrayScale[8] }}>
            팀 스페이스 이미지 수정
          </div>
          <p style={{ ...typography.Body1, color: color.GrayScale[6] }}>
            팀원들에게 보여질 이미지를 설정하세요.
          </p>
        </div>

        <div
          className="circle-main"
          style={{ "--gray-200": color.GrayScale[2] }}
        >
          {previewImage ? (
            <img
              className="circle-main-img"
              src={previewImage}
              onClick={handleImageClick}
              alt="Team Space"
              style={{ width: "100%", height: "100%", objectFit: "cover" }}
            />
          ) : teamId === itemId ? (
            <img
              className="circle-main-img"
              src={Camera}
              onClick={handleImageClick}
              alt="Team Space"
            />
          ) : (
            <img
              src={Camera}
              alt="Click to upload"
              onClick={handleImageClick}
            />
          )}

          <input
            type="file"
            accept="image/*"
            ref={fileInputRef}
            onChange={handleImageUpload}
            style={{ display: "none" }}
          />
        </div>

        {/* 팀 이름 섹션 */}
        <div>
          <div style={{ ...typography.Header2, color: color.GrayScale[8] }}>
            팀 스페이스 이름 수정
          </div>
          <p style={{ ...typography.Body1, color: color.GrayScale[6] }}>
            팀원들에게 보여질 팀스페이스 이름을 설정하세요.
          </p>
        </div>

        <div className="TeamName-input">
          <input
            onChange={handleNameChange}
            value={teamName}
            type="text"
            style={{ ...typography.Body2, "--gray-50": color.GrayScale[0] }}
            placeholder={itemContent}
          />
        </div>
      </div>

      {/* 버튼 섹션 */}
      <div className="owner-button">
        <button
          style={{
            backgroundColor: image || teamName ? color.Main[4] : color.Main[2],
            opacity: isSubmitting ? 0.7 : 1,
            cursor: isSubmitting
              ? "wait"
              : image || teamName
              ? "pointer"
              : "default",
          }}
          onClick={saveSettings}
          disabled={isSubmitting || (!image && !teamName)}
        >
          {isSubmitting ? "처리 중..." : "완료"}
        </button>

        <button
          style={{ backgroundColor: color.Error[0] }}
          onClick={openModal}
          disabled={isSubmitting}
        >
          팀 스페이스 삭제
        </button>
      </div>

      {isOpenModal && <ModalDel onClose={closeModal} />}
    </div>
  );
};

export default OwnerTeam;
