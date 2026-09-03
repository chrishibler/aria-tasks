/**
 * The app's calico kitten (see app/icon.svg), in tears — the face on the
 * "Uh Oh" button. Inline rather than a file in /public so it stays crisp at
 * button size and ships with the bundle.
 */
export function UhOhCat({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 64 64"
      className={className}
      role="img"
      aria-label="Sad calico kitten"
      xmlns="http://www.w3.org/2000/svg"
    >
      <rect x="0" y="0" width="64" height="64" rx="14" fill="#ef9494" />
      {/* drooping ears — the base of each is hidden by the head */}
      <path d="M4 34 L2 12 L28 22 Z" fill="#ffffff" />
      <path d="M60 34 L62 12 L36 22 Z" fill="#f0993c" />
      <path d="M8.5 30.5 L7 17.5 L23 23.5 Z" fill="#e8788c" />
      <path d="M55.5 30.5 L57 17.5 L41 23.5 Z" fill="#e8788c" />
      <ellipse cx="32" cy="38" rx="25" ry="20" fill="#ffffff" />
      {/* calico patches: ginger one side, dark the other */}
      <ellipse cx="46" cy="29" rx="9" ry="8" fill="#f0993c" />
      <ellipse cx="17" cy="27" rx="8.5" ry="7" fill="#544741" />
      <ellipse cx="49" cy="43" rx="6" ry="5" fill="#f0993c" opacity="0.9" />
      {/* eyes squeezed shut */}
      <path
        d="M19 41.5 Q23.5 35.5 28 41.5"
        fill="none"
        stroke="#332c28"
        strokeWidth="2.8"
        strokeLinecap="round"
      />
      <path
        d="M36 41.5 Q40.5 35.5 45 41.5"
        fill="none"
        stroke="#332c28"
        strokeWidth="2.8"
        strokeLinecap="round"
      />
      {/* tears */}
      <path d="M21 44 C24 49 23.4 53 21 53 C18.6 53 18 49 21 44 Z" fill="#4fa8e0" />
      <path d="M43 44 C46 49 45.4 53 43 53 C40.6 53 40 49 43 44 Z" fill="#4fa8e0" />
      <path d="M28.8 45.6 L35.2 45.6 L32 49.4 Z" fill="#ef7fa8" />
      <path
        d="M27 55 Q32 50.5 37 55"
        fill="none"
        stroke="#7d635b"
        strokeWidth="1.8"
        strokeLinecap="round"
      />
    </svg>
  );
}
