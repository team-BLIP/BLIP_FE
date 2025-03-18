import { Route, Routes } from "react-router-dom";
import Login from "./pages/Login/login";
import Signup from "./pages/Signup/signUp";
import SignupSuccess from "./pages/Signup/signupSuccess";
import SignupVoice from "./pages/Signup/signupVoice";

export const AppRouter = () => {
  return (
    <>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/users/signup" element={<Signup />} />
        <Route path="/success" element={<SignupSuccess />} />
        <Route path="/signupVoice" element={<SignupVoice />} />
      </Routes>
    </>
  );
};

export default AppRouter;
