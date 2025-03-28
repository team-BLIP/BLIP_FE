import axios from "axios";

const CreateApi = async () => {
  const apiUrl = import.meta.env.VITE_API_URL_URL_CREATE;
  const url = `${apiUrl}/data`;
  const accessToken = "토큰 값";

  if (content === "") {
    submitRef.current.focus();
    return;
  }

  const data = {
    team_name: content,
    nick_name: "er",
  };

  try {
    const response = await axios.post(url, data, {
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${accessToken}`,
      },
    });
    console.log("팀 생성 성공:", response.data);

    setOwner((prev) => !prev);
    if (join) {
      setJoin((prev) => !prev);
    }

    const TeamId = response.data.team_id;
    nav("/", { state: { content, TeamId } });
    console.log(TeamId);
    dispatch.onCreateone(content);
    setContent("");
    onClose();
  } catch (error) {
    console.error("팀 생성 실패:", error);
  } finally {
    setIsLoading(false);
  }
};

export default CreateApi;
