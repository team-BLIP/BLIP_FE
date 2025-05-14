import { Route, Routes } from "react-router-dom";
import Login from "./components/Page/Login/login";
import Signup from "./components/Page/Signup/signup";
import SignupSuccess from "./components/Page/Signup/signupSuccess";
import Main from "./components/Page/Main/Main";

export const AppRouter = () => {
  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route path="/users/signup" element={<Signup />} />
      <Route path="/success" element={<SignupSuccess />} />
      <Route path="/mainPage" element={<Main />} />
    </Routes>
  );
};

export default AppRouter;
