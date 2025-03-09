import "../../../CSS/OwnerTeam.css";
import { typography } from "../../../../fonts/fonts";
import { color } from "../../../../style/color";
import { useRef, useState, useContext } from "react";
import { useNavigate } from "react-router-dom";
import { TeamDel } from "../../Main/MainTeamOwner";
// import { TeamDel } from "../../Main/Main";
import { UseStateContext } from "../../../../Router";
import ModalDel from "../../Modal/ModalDel";
import Camera from "../../../../svg/camera.svg";

const OwnerTeam = () => {
  const fileInputImg = useRef(null);
  const [image, setImage] = useState(null);
  const [inputFont, setInputFont] = useState("");
  const [isOpenModal, setIsOpenModal] = useState(false);
  const { itemContent, itemId, itemImage } = useContext(TeamDel);
  const { setSetting } = useContext(UseStateContext);
  const nav = useNavigate();

  const openModal = () => setIsOpenModal(true);
  const closeModal = () => setIsOpenModal(false);

  const handleImg = (e) => {
    const file = e.target.files[0];
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => {
      setImage(reader.result);
    };
  };

  const handleImage = () => {
    fileInputImg.current.click();
  };

  const onChnageInput = (e) => {
    setInputFont(e.target.value);
  };

  const CreateImg = () => {
    nav("/TeamOwner", { state: { image: image, itemId } });
    setSetting((preState) => !preState);
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
          {image ? (
            <img
              className="circle-main-img"
              src={image}
              onClick={handleImage}
            />
          ) : itemImage ? (
            <img src={itemImage} alt="Click to upload" onClick={handleImage} />
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
