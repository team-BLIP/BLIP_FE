import { instance } from "./instance";

const apiSignUp = async (userData) => {
  try {
    const accessToken = localStorage.getItem("accessToken");
    const response = await instance.post("/users/signup", userData, {
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${accessToken}`,
      },
    });
    return response.data;
  } catch (error) {
    console.error("Signup request failed:", error);
    throw error.response?.data || error;
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
