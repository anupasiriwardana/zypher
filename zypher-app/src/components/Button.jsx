import { Lexend } from 'next/font/google';

const lexend = Lexend({
  subsets: ['latin'],
  weight: ['400', '500', '600', '700'], // choose weights you need
});

const Button = ({ children, variant = "solid", ...props }) => {
  const base = `px-8 py-4 rounded-full font-semibold transition duration-200 text-lg ${lexend.className}`;
  const styles = {
    solid: "bg-[var(--brand-yellow)] text-[var(--background)] hover:brightness-110",
    outline: "border border-[var(--text-primary)] text-[var(--text-primary)] hover:bg-[var(--text-primary)] hover:text-[var(--background)]",
  };

  return (
    <button className={`${base} ${styles[variant]}`} {...props}>
      {children}
    </button>
  );
};

export default Button;
