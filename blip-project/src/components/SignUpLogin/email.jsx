import Input from "./input";

export const Email = ({ value, onChange, placeholder, ...props }) => {
  return (
    <Input
      type="email"
      placeholder={placeholder}
      value={value}
      onChange={onChange}
      {...props}
    />
  );
};

export default Email;
