"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function SignUpRedirect() {
  const router = useRouter();

  useEffect(() => {
    // Redirect to homepage where users can choose their path
    router.replace("/#signup");
  }, [router]);

  return (
    <div className="flex flex-col justify-center items-center w-full h-screen">
      <div className="text-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
        <p className="text-gray-600">Redirecting to signup options...</p>
      </div>
    </div>
  );
}
