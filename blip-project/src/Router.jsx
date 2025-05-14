import { Route, Routes } from "react-router-dom";
import Login from "./components/Page/Login/login";
import Signup from "./components/Page/Signup/signup";
import SignupSuccess from "./components/Page/Signup/signupSuccess";

export const AppRouter = () => {
  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route path="/users/signup" element={<Signup />} />
      <Route path="/success" element={<SignupSuccess />} />
    </Routes>
  );
};

export default AppRouter;
