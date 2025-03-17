import "../../../CSS/OwnerTeam.css";
import { typography } from "../../../../fonts/fonts";
import { color } from "../../../../style/color";
import { useRef, useState, useContext, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { TeamDel } from "../../Main/Main";
import { UseStateContext } from "../../../../Router";
import { FindId } from "../../Main/Main";
import ModalDel from "../../Modal/ModalDel";
import Camera from "../../../../svg/camera.svg";

const OwnerTeam = () => {
  const fileInputImg = useRef(null);
  const [inputFont, setInputFont] = useState("");
  const [isOpenModal, setIsOpenModal] = useState(false);
  const { itemContent, itemId, image, setImage } = useContext(TeamDel);
  const { targetId, setTargetId } = useContext(FindId);
  const { setSetting } = useContext(UseStateContext);
  const nav = useNavigate();

  // 각 팀에 대해 별도로 이미지를 관리하는 상태
  const [teamImages, setTeamImages] = useState({});

  const openModal = () => setIsOpenModal(true);
  const closeModal = () => setIsOpenModal(false);

  const handleImg = (e) => {
    const file = e.target.files[0];
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => {
      setTeamImages((prevState) => ({
        ...prevState,
        [targetId]: reader.result, // targetId에 해당하는 팀의 이미지만 업데이트
      }));
    };
  };

  const handleImage = () => {
    fileInputImg.current.click(); // 이미지 업로드를 위한 파일 입력 창 열기
  };

  const onChnageInput = (e) => {
    setInputFont(e.target.value);
  };

  const CreateImg = () => {
    if (image || inputFont) {
      nav("/", { state: { itemId } });
      setSetting(false);
      setTargetId(null); // targetId를 null로 설정하여 다른 팀으로 이동
    }
  };

  useEffect(() => {
    // targetId에 해당하는 팀의 이미지를 설정
    if (targetId && teamImages[targetId]) {
      setImage(teamImages[targetId]);
    }
  }, [targetId, teamImages]); // targetId나 teamImages가 바뀔 때마다 이미지 업데이트

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
          {teamImages[targetId] ? (
            <img
              className="circle-main-img"
              src={teamImages[targetId]}
              onClick={handleImage}
              alt="Team Space"
            />
          ) : (
            <img src={Camera} alt="Click to upload" onClick={handleImage} />
          )}
          <input
            type="file"
            accept="image/*"
            ref={fileInputImg}
            onChange={handleImg}
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
            onClick={CreateImg}
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
