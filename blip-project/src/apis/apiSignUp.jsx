import { instance } from "./instance";

const apiSignUp = async (userData) => {
  try {
    const response = await instance.post("/users/signup", userData);
    return response.data;
  } catch (error) {
    throw error.response?.data || error.message;
  }
};

/*const apiSignUp = async (userData) => {
  try {
    const response = await axios.post("/signup", userData, {
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${localStorage.getItem("accessToken")}`, 
      },
    });
    return response.data;
  } catch (error) {
    console.error("회원가입 요청 실패:", error);
    throw error;
  }
};
*/

export default apiSignUp;
