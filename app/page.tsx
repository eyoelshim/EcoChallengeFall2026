import { Show, SignInButton } from "@clerk/nextjs";
import { redirect } from "next/navigation";
import { auth } from "@clerk/nextjs/server";
import { Leaf, TrendingUp, Users, ArrowRight } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { FeatureCard } from "@/components/FeatureCard";

export default async function Home() {
  const { userId } = await auth();
  if (userId) redirect("/dashboard");

  return (
    <main className="flex min-h-screen flex-col bg-[#f5f5f3]">
      <div className="mx-auto grid min-h-screen w-full max-w-[1180px] items-center gap-10 px-6 py-8 md:grid-cols-[1.05fr_0.95fr] lg:px-10">

        {/* Hero section */}
        <div className="flex flex-col justify-center">
          {/* Logo */}
          <Link
            href="/dashboard"
            className="mb-8 flex w-fit items-center gap-3 rounded-2xl transition-opacity hover:opacity-80 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#0b5d1e]"
          >
            <Image
              src="/icons/logo.png"
              alt="GreenStep logo"
              width={48}
              height={48}
              className="rounded-2xl"
            />
            <span className="text-[22px] font-bold text-[#111827]">GreenStep</span>
          </Link>

          {/* Headline */}
          <h1 className="mb-4 max-w-[620px] text-[36px] font-extrabold leading-[1.1] text-[#111827] md:text-[52px]">
            Make your workplace <span className="text-[#0b5d1e]">greener</span>, one action at a time.
          </h1>
          <p className="mb-8 max-w-[540px] text-[16px] leading-relaxed text-[#6b7280] md:text-[18px]">
            Log sustainable actions, earn points, level up, and compete with your team on the leaderboard.
          </p>
        </div>

        <div className="rounded-[36px] border border-white/80 bg-white/70 p-5 shadow-xl backdrop-blur-sm md:p-7">
          {/* Feature cards */}
          <div className="space-y-3">
            <FeatureCard
              icon={
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-green-100">
                  <Leaf className="h-5 w-5 text-[#0b5d1e]" />
                </div>
              }
              title="Track Sustainable Actions"
              description="Transport, energy, water, food & recycling"
            />

            <FeatureCard
              icon={
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-yellow-100">
                  <TrendingUp className="h-5 w-5 text-yellow-600" />
                </div>
              }
              title="Earn Points & Level Up"
              description="From Green Starter to Eco Hero"
            />

            <FeatureCard
              icon={
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-blue-100">
                  <Users className="h-5 w-5 text-blue-600" />
                </div>
              }
              title="Compete with Your Team"
              description="Live leaderboard across departments"
            />
          </div>

          {/* CTA */}
          <div className="mt-6">
          <Show when="signed-out">
            <SignInButton mode="modal">
              <button className="flex w-full items-center justify-center gap-2 rounded-2xl bg-[#0b5d1e] py-4 text-[16px] font-semibold text-white shadow-sm">
                Get Started
                <ArrowRight className="h-4.5 w-4.5" />
              </button>
            </SignInButton>
          </Show>

          <Show when="signed-in">
            <a
              href="/dashboard"
              className="flex w-full items-center justify-center gap-2 rounded-2xl bg-[#0b5d1e] py-4 text-[16px] font-semibold text-white shadow-sm"
            >
              Go to Dashboard
              <ArrowRight className="h-4.5 w-4.5" />
            </a>
          </Show>

          <p className="mt-4 text-center text-[11px] text-[#9ca3af]">
            Part of your company&apos;s sustainability challenge
          </p>
          </div>
        </div>
      </div>
    </main>
  );
}
