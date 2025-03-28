import { FindId } from "../../Main/Main";
import { useContext } from "react";

const ImgUpload = (e) => {
  const { setTeamImages } = useContext(FindId);

  const file = e.target.files[0];
  const reader = new FileReader();
  reader.readAsDataURL(file);
  reader.onload = () => {
    setTeamImages((prevState) => ({
      ...prevState,
      [targetId]: reader.result,
    }));
  };
};

export default ImgUpload;
