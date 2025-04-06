const UrlCheck = (setIsInput, setIsValidURL) => {
  return (e) => {
    const value = e.target.value;
    setIsInput(value);

    setIsValidURL(!!value.trim());
  };
};
export default UrlCheck;
