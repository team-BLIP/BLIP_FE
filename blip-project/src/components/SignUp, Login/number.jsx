import Input from "./input";

export const Number = ({ value, onChange, placeholder, ...props }) => {
  return (
    <Input type="number" placeholder={placeholder} value={value} {...props} />
  );
};

export default Number;
