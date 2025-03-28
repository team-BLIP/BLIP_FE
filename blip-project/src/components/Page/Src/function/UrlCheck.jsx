const UrlCheck = (e) => {
  const value = e.target.value;
  setIsInput(value);
  try {
    new URL(value); 
    setIsValidURL(true); 
  } catch (error) {
    setIsValidURL(false);
  }
};

export default UrlCheck;