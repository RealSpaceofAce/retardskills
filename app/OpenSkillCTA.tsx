'use client';

type Props = {
  children: React.ReactNode;
  target?: string;
  className?: string;
};

export default function OpenSkillCTA({ children, target = 'rs-email-input', className = 'rs-skill-cta' }: Props) {
  return (
    <a
      href={`#${target}`}
      className={className}
      onClick={(event) => {
        event.preventDefault();
        const el = document.getElementById(target);
        if (!el) return;
        el.scrollIntoView({ behavior: 'smooth', block: 'center' });
        // Wait for the scroll to settle before focusing — focusing too early
        // cancels the smooth scroll on Safari and the user lands jumpy.
        window.setTimeout(() => {
          (el as HTMLElement).focus({ preventScroll: true });
        }, 520);
      }}
    >
      {children}
    </a>
  );
}
