import { SignIn } from "@clerk/nextjs";

export default function SignInPage() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-[#f5f5f3] px-4 py-8">
      <SignIn />
    </div>
  );
}
