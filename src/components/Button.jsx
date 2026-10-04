import { Link } from "react-router-dom";

const base = "btn";

const variants = {
  primary: "btn-primary",
  secondary: "btn-secondary",
  outline: "btn-outline",
};

const Button = ({ to, variant = "primary", className = "", children, ...rest }) => {
  const classes = `${base} ${variants[variant]} ${className}`.trim();
  if (to) {
    return (
      <Link to={to} className={classes} {...rest}>
        {children}
      </Link>
    );
  }
  return (
    <button className={classes} {...rest}>
      {children}
    </button>
  );
};

export default Button;

