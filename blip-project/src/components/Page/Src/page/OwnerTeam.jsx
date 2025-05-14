import "../../../CSS/OwnerTeam.css";
import { typography } from "../../../../fonts/fonts";
import { color } from "../../../../style/color";
import { useRef, useState, useContext, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { TeamDel } from "../../Main/Main";
import { FindId } from "../../Main/Main";
import ModalDel from "../../Modal/ModalDel";
import Camera from "../../../../svg/camera.svg";
import Add from "../../../../svg/add.svg";
import SettingApi from "../api/settingApi";
import { useAppState } from "../../../../contexts/AppContext";

const OwnerTeam = () => {
  const fileInputImg = useRef(null);
  const [inputFont, setInputFont] = useState("");
  const [isOpenModal, setIsOpenModal] = useState(false);
  const { itemContent, itemId, image, setImage } = useContext(TeamDel);
  const { teamImages, setTeamImages } = useContext(FindId);
  const [previewImage, setPreviewImage] = useState(null);
  const nav = useNavigate();
  const [TeamTargetId, setTeamTargetId] = useState(null);
  const { setSetting: appSetSetting } = useAppState();

  useEffect(() => {
    try {
      // JSON.parse 제거 - localStorage에는 문자열로 저장되어 있음
      const localId = localStorage.getItem("currentTeamId");
      setTeamTargetId(localId);
      console.log("TeamTargetId", localId);
    } catch (error) {
      console.log("localStorage 처리 오류:", error);
    }
  }, []);

  const openModal = () => setIsOpenModal(true);
  const closeModal = () => setIsOpenModal(false);

  const handleImage = () => {
    fileInputImg.current.click();
  };

  const onChnageInput = (e) => {
    setInputFont(e.target.value);
  };

  useEffect(() => {
    try {
      // TeamTargetId 불러오기
      const localId = localStorage.getItem("currentTeamId");
      setTeamTargetId(localId);
      console.log("TeamTargetId", localId);

      // 팀 이름 불러오기 (teamsList에서)
      if (localId) {
        const teamsListStr = localStorage.getItem("teamsList");
        if (teamsListStr) {
          try {
            const teamsList = JSON.parse(teamsListStr);
            // 현재 팀 찾기
            const currentTeam = teamsList.find(
              (team) =>
                String(team.backendId) === String(localId) ||
                String(team.id) === String(localId)
            );

            if (currentTeam) {
              // placeholder에 표시할 현재 팀 이름 설정
              const teamName =
                currentTeam.itemContent ||
                currentTeam.content ||
                `Team ${localId}`;
              console.log("현재 팀 이름:", teamName);

              // 이름 입력란의 placeholder로 설정
              // 이미 코드에 placeholder={itemContent}가 있으므로 수정하지 않아도 됨
            }
          } catch (parseError) {
            console.error("팀 목록 파싱 오류:", parseError);
          }
        }
      }
    } catch (error) {
      console.log("localStorage 처리 오류:", error);
    }
  }, []);

  // 이미지 업로드 처리
  const ImgUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    if (!TeamTargetId) {
      console.error(
        "TeamTargetId가 설정되지 않아 이미지를 업로드할 수 없습니다."
      );
      return;
    }

    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => {
      const result = reader.result;

      // 미리보기 이미지만 설정 (완료 버튼 클릭 전까지는 UI에만 표시)
      setPreviewImage(result);

      // 임시 이미지 데이터 저장 (API 호출 시 사용)
      setImage(result);
    };
  };

  // 로컬 스토리지의 teamsList에서 팀 이름 업데이트 함수
  // OwnerTeam.jsx의 createImg 함수 수정
  // OwnerTeam.jsx의 수정된 코드

  // 로컬 스토리지 업데이트 함수
  const updateLocalTeamName = async (teamId, newName) => {
    try {
      console.log(
        `로컬 스토리지 팀 이름 업데이트 시작: ID=${teamId}, 새 이름=${newName}`
      );

      // 1. teamsList 업데이트
      try {
        const teamsListStr = localStorage.getItem("teamsList");
        if (teamsListStr) {
          const teamsList = JSON.parse(teamsListStr);

          // 팀 목록 순회하며 해당 팀 찾아 이름 업데이트
          let isUpdated = false;
          const updatedTeams = teamsList.map((team) => {
            if (
              String(team.backendId) === String(teamId) ||
              String(team.id) === String(teamId)
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

          // 변경된 경우에만 저장
          if (isUpdated) {
            localStorage.setItem("teamsList", JSON.stringify(updatedTeams));
            console.log(`teamsList에 팀 이름이 '${newName}'으로 업데이트됨`);
          }
        }
      } catch (e) {
        console.error("teamsList 업데이트 실패:", e);
      }

      return true;
    } catch (error) {
      console.error("로컬 데이터 업데이트 실패:", error);
      return false;
    }
  };

  const createImg = async () => {
    if (!image && !inputFont) {
      alert("변경사항이 없습니다. 이미지를 업로드하거나 이름을 변경해주세요.");
      return;
    }

    try {
      // TeamTargetId 확인
      if (!TeamTargetId) {
        console.error("TeamTargetId가 설정되지 않았습니다.");

        // localStorage에서 직접 가져오기
        const localId = localStorage.getItem("currentTeamId");
        if (localId) {
          console.log("localStorage에서 TeamTargetId를 가져옴:", localId);
          setTeamTargetId(localId);

          alert("팀 정보를 다시 불러왔습니다. 잠시 후 다시 시도해주세요.");
          return;
        } else {
          alert(
            "팀 정보를 찾을 수 없습니다. 페이지를 새로고침 후 다시 시도해주세요."
          );
          return;
        }
      }

      console.log("설정 변경 시작 - TeamID:", TeamTargetId);
      console.log("이름 변경:", inputFont || "변경 없음");
      console.log("이미지 변경:", image ? "있음" : "없음");

      // 로컬 데이터 업데이트 및 API 호출 병렬 처리
      try {
        // API 호출
        const apiPromise = SettingApi(TeamTargetId, inputFont, image);

        // 로컬 데이터 업데이트 (API 결과 대기하지 않음)

        // 1. 이미지 업데이트
        if (image) {
          const newTeamImages = {
            ...teamImages,
            [TeamTargetId]: image,
          };

          // Context 업데이트
          setTeamImages(newTeamImages);

          // 로컬 스토리지 저장
          localStorage.setItem("teamImages", JSON.stringify(newTeamImages));
          console.log("로컬 스토리지에 이미지 저장 완료");
        }

        // 2. 팀 이름 업데이트
        if (inputFont && inputFont.trim() !== "") {
          await updateLocalTeamName(TeamTargetId, inputFont.trim());
        }

        // API 응답 대기
        const response = await apiPromise;
        console.log("API 호출 성공:", response);

        // 메인 페이지로 이동 - 업데이트된 정보를 state로 전달
        nav("/mainPage", {
          state: {
            itemId,
            updatedTeamName: inputFont || null,
            updatedImage: image ? true : false,
            forceRefresh: Date.now(), // 강제 새로고침 트리거
          },
        });
        appSetSetting(false);
      } catch (error) {
        console.error("API 호출 실패:", error);

        // API 실패해도 로컬 데이터는 이미 업데이트됨 - 메인 페이지로 이동
        nav("/mainPage", {
          state: {
            itemId,
            updatedTeamName: inputFont || null,
            updatedImage: image ? true : false,
            forceRefresh: Date.now(), // 강제 새로고침 트리거
          },
        });
        appSetSetting(false);
      }
    } catch (error) {
      console.error("설정 저장 중 오류 발생:", error);
      alert("오류가 발생했습니다. 다시 시도해주세요.");
    }
  };

  return (
    <div className="owner-main">
      <div className="owner-body">
        <div style={{ ...typography.Header1, color: color.GrayScale[8] }}>
          설정
        </div>
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
            // 미리보기 이미지가 있는 경우
            <img
              className="circle-main-img"
              src={previewImage}
              onClick={handleImage}
              alt="Team Space"
              style={{ width: "100%", height: "100%", objectFit: "cover" }}
            />
          ) : TeamTargetId === itemId ? (
            // TeamTargetId와 itemId가 같고 미리보기가 없는 경우 Add 아이콘 표시
            <img
              className="circle-main-img"
              src={Camera}
              onClick={handleImage}
              alt="Team Space"
            />
          ) : (
            // 그 외의 경우 Camera 아이콘 표시
            <img src={Camera} alt="Click to upload" onClick={handleImage} />
          )}
          <input
            type="file"
            accept="image/*"
            ref={fileInputImg}
            onChange={ImgUpload}
            style={{ display: "none" }}
          />
        </div>
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
            onChange={onChnageInput}
            value={inputFont}
            type="text"
            style={{ ...typography.Body2, "--gray-50": color.GrayScale[0] }}
            placeholder={itemContent}
          />
        </div>
      </div>
      <div className="owner-button">
        {image || inputFont ? (
          <button
            style={{ backgroundColor: color.Main[4] }}
            onClick={createImg}
          >
            완료
          </button>
        ) : (
          <button style={{ backgroundColor: color.Main[2] }}>완료</button>
        )}
        <button style={{ backgroundColor: color.Error[0] }} onClick={openModal}>
          팀 스페이스 삭제
        </button>
      </div>
      {isOpenModal && <ModalDel onClose={closeModal} />}
    </div>
  );
};

export default OwnerTeam;
