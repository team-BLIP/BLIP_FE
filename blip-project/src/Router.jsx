import { Route, Routes, Navigate } from "react-router-dom";
import Login from "./pages/Login/login";
import Signup from "./pages/Signup/signup";
import SignupSuccess from "./pages/Signup/signupSuccess";

export const AppRouter = () => {
  return (
    <>
      <Routes>
        <Route path="/" element={<Navigate to="/login" replace />} />
        <Route path="/users/login" element={<Login />} />
        <Route path="/users/signup" element={<Signup />} />
        <Route path="/success" element={<SignupSuccess />} />
      </Routes>
    </>
  );
};

export default AppRouter;
