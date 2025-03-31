import { instance } from "./instance";

const apiSignUp = async (userData) => {
  try {
    const data = {
      id: inputs.id,
      email: inputs.email,
      password: inputs.password,
    };
    const response = await instance.post("/users/signup", userData, {
      headers: {
        "Content-Type": "application/json",
      },
    });
    return response.data;
  } catch (error) {
    console.error("Signup request failed:", error);
    throw error.response?.data || error;
  }
};

export default apiSignUp;
