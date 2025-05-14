import { Route, Routes, Navigate } from "react-router-dom";
import Login from "./components/Page/Login/login";
import Signup from "./components/Page/Signup/signup";
import SignupSuccess from "./components/Page/Signup/signupSuccess";

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
