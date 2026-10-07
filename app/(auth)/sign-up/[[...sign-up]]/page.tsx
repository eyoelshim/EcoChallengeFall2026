import { SignUp } from "@clerk/nextjs";

export default function SignUpPage() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-[#f5f5f3] px-4 py-8">
      <SignUp />
    </div>
  );
}
