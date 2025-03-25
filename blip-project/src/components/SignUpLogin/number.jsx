import Input from "./input";

export const NumberInput = ({ value, onChange, placeholder, ...props }) => {
  return (
    <Input type="number" placeholder={placeholder} value={value} {...props} />
  );
};

export default NumberInput;
