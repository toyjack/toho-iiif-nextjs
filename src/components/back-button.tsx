"use client";

import { usePathname, useRouter } from "next/navigation";


function BackButton() {
  const router = useRouter();
  const pathname = usePathname();

  const handleBack = () => {
    if (pathname !== "/books") {
      router.back();
    } else {
      router.push("/books");
    }
  };
  return (
    <button onClick={handleBack} className="btn btn-ghost">
      <svg
        xmlns="http://www.w3.org/2000/svg"
        className="h-5 w-5"
        fill="none"
        viewBox="0 0 24 24"
        stroke="currentColor"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M10 19l-7-7m0 0l7-7m-7 7h18"
        />
      </svg>
      戻る
    </button>
  );
}
export default BackButton;
