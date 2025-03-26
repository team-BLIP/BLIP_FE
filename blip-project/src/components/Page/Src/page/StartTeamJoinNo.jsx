import "../../../CSS/StartTeamJoinNo.css";
import { typography } from "../../../../fonts/fonts";
import { color } from "../../../../style/color";
import Modal from "../../Modal/Modal";
import { useState, useContext, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { SidebarContext } from "../../../../Router";
import axios from "axios";

const StartTeamJoinNo = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [urlInput, setUrlInput] = useState("");
  const [isUrl, setIsUrl] = useState(false);
  const { dispatch } = useContext(SidebarContext);
  const [content, setContent] = useState("");
  const submitRef = useRef();

  const apiUrl = import.meta.env.VITE_API_URL_URL_JOIN;

  const joinTeam = async (TeamId) => {
    const url = `${apiUrl}/data`;
    const accessToken = "토큰 값";

    const data = {
      item_id: "fagda",
    };
    try {
      const reponse = await axios.post(url, data, {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${accessToken}`,
        },
      });
      console.log("팀 가입 성공", reponse.data);
      return reponse.data;
    } catch (error) {
      console.log("팀 가입 실패", error);
      alert("팀 참가에 실패했습니다. 다시 시도해주세요");
    }
  };

  const onClickUrl = async () => {
    if (isUrl) {
      const teamId = new URL(urlInput).searchParams.get("team_id");

      if (teamId) {
        const result = await joinTeam(teamId);

        if (result) {
          nav("/", { state: { urlInput } });
          dispatch.onCreatedouble(content);
          setContent("");
        } else {
          openModal();
        }
      } else {
        alert("유효하지 않은 초대 링크입니다. 다시 확인해주세여. ");
      }
    } else if (content === "") {
      submitRef.current.focus();
      return;
    }
  };

  const onChangeUrlInput = (e) => {
    const urlValue = e.target.value;
    setUrlInput(urlValue);
    try {
      new URL(urlValue);
      setIsUrl(true);
    } catch (error) {
      setIsUrl(false);
    }
  };

  const nav = useNavigate();

  const handleKeyDown = (e) => {
    if (e.key === "Enter") {
      onClickUrl();
    }
  };

  const openModal = () => setIsModalOpen(true);
  const closeModal = () => setIsModalOpen(false);

  return (
    <>
      <div className="StartTeamJoinNos">
        <div className="STJoinNoMain">
          <div className="STJoinNoLink">
            <div className="STJoinNoFont">
              <p style={typography.Header1}>팀을 꾸리거나 팀에 참여하세요!</p>
              <p style={typography.Header3}>초대받은 팀의 코드를 입력하세요!</p>
            </div>
            <input
              className="STJoinNoInput"
              placeholder="링크 주소를 입력하세요."
              value={urlInput}
              type="text"
              onKeyDown={handleKeyDown}
              onChange={onChangeUrlInput}
              ref={submitRef}
              style={{
                ...typography.Header3,
                borderColor: isUrl ? "#616064" : "red",
              }}
            />
          </div>
          <button
            className="STJoinNoButton"
            onClick={onClickUrl}
            onKeyDown={handleKeyDown}
            style={{
              ...typography.Button0,
              "--main-400": color.Main[4],
              "--white": color.White,
            }}
          >
            시작하기
          </button>
        </div>
      </div>
      {isModalOpen && <Modal onClose={closeModal} />}
    </>
  );
};

export default StartTeamJoinNo;
