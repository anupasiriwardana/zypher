import { Lexend } from "next/font/google";

const lexend = Lexend({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
});

const Button = ({ children, variant = "solid", ...props }) => {
  const base = `px-4 py-1.5 rounded-xl font-medium transition duration-200 text-sm md:text-base ${lexend.className}`;
  const styles = {
    solid: "bg-[var(--brand-yellow)] text-[var(--background)] hover:brightness-110",
    outline:
      "border border-[var(--text-primary)] text-[var(--text-primary)] hover:bg-[var(--text-primary)] hover:text-[var(--background)]",
  };

  return (
    <button className={`${base} ${styles[variant]}`} {...props}>
      {children}
    </button>
  );
};

export default Button;
