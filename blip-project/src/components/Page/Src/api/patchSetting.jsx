import axios from "axios";

const patchSetting = async () => {
  const apiUrl = import.meta.env.VITE_API_URL_BASE.trim();
  const accessToken = import.meta.env.VITE_API_URL_URL_KEY?.trim();

  const patchUrl = `${apiUrl}teams//setting`

  try {
    const response = await axios.patch(,
      {}
    );
    console.log("수정된 데이터:", response.data);
  } catch (error) {
    console.error("PATCH 요청 실패:", error);
  }
};

export default patchSetting;
