import { Route, Routes, Navigate } from "react-router-dom";
import Login from "./pages/Login/login";
import Signup from "./pages/Signup/signUp";
import SignupSuccess from "./pages/Signup/signupSuccess";

export const AppRouter = () => {
  return (
    <>
      <Routes>
        <Route path="/" element={<Navigate to="/login" replace />} />
        <Route path="/login" element={<Login />} />
        <Route path="/users/signup" element={<Signup />} />
        <Route path="/success" element={<SignupSuccess />} />
        <Route path="/signupVoice" element={<SignupVoice />} />
      </Routes>
    </>
  );
};

export default AppRouter;
