import { Route, Routes } from "react-router-dom";
import Login from "./components/Page/Login/login";
import Signup from "./components/Page/Signup/signup";
import SignupSuccess from "./components/Page/Signup/signupSuccess";
import MainPage from "./components/Page/Main/Main";

export const AppRouter = () => {
  return (
    <Routes>
      <Route path="/" element={<Login />} />
      <Route path="/users/signup" element={<Signup />} />
      <Route path="/success" element={<SignupSuccess />} />
      <Route path="/mainPage" element={<MainPage />} />
    </Routes>
  );
};

export default AppRouter;
