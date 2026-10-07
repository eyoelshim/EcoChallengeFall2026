"use client";

import { useParams } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import {
  ChevronLeft,
  Bike,
  Recycle,
  Zap,
  Utensils,
  Droplet,
  Leaf,
  Camera,
  ImagePlus,
  X,
} from "lucide-react";
import { findAction } from "@/lib/actions-data";
import { GLOBAL_CHALLENGE_ID } from "@/lib/constants";

const categoryMeta: Record<
  string,
  { bg: string; iconBg: string; iconColor: string; label: string }
> = {
  TRANSPORT: { bg: "bg-blue-50", iconBg: "bg-blue-200", iconColor: "text-blue-600", label: "Transportation" },
  RECYCLING: { bg: "bg-green-50", iconBg: "bg-green-200", iconColor: "text-green-700", label: "Recycling" },
  ENERGY:    { bg: "bg-yellow-50", iconBg: "bg-yellow-200", iconColor: "text-yellow-700", label: "Energy" },
  FOOD:      { bg: "bg-orange-50", iconBg: "bg-orange-200", iconColor: "text-orange-700", label: "Food" },
  WATER:     { bg: "bg-blue-50", iconBg: "bg-blue-100", iconColor: "text-blue-700", label: "Water" },
};

function CategoryIcon({ category, className }: { category: string; className?: string }) {
  switch (category) {
    case "TRANSPORT": return <Bike className={className} />;
    case "RECYCLING": return <Recycle className={className} />;
    case "ENERGY":    return <Zap className={className} />;
    case "FOOD":      return <Utensils className={className} />;
    case "WATER":     return <Droplet className={className} />;
    default:          return <Leaf className={className} />;
  }
}

export default function ActionDetailPage() {
  const params = useParams();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const cameraInputRef = useRef<HTMLInputElement>(null);
  const submitLockRef = useRef(false);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [activeChallengeId, setActiveChallengeId] = useState<string>(GLOBAL_CHALLENGE_ID);
  const [note, setNote] = useState("");
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [showCelebration, setShowCelebration] = useState(false);

  useEffect(() => {
    if (typeof window !== "undefined") {
      setActiveChallengeId(localStorage.getItem("activeChallengeId") || GLOBAL_CHALLENGE_ID);
    }
  }, []);

  const actionType = decodeURIComponent(params.actionType as string);
  const action = findAction(actionType);

  if (!action) {
    return (
      <div className="min-h-screen bg-white px-4 py-6 flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-500 text-lg mb-4">Action not found.</p>
          <Link href="/log-action" className="text-[#0b5d1e] font-medium underline">Go back</Link>
        </div>
      </div>
    );
  }

  const meta = categoryMeta[action.category] ?? {
    bg: "bg-gray-50", iconBg: "bg-gray-200", iconColor: "text-gray-600", label: action.category,
  };

  // Dynamic total points
  const noteBonus  = note.trim() ? 10 : 0;
  const imageBonus = imagePreview ? 15 : 0;
  const totalPoints = action.points + noteBonus + imageBonus;

  function handleImageFile(file: File) {
    if (!file.type.startsWith("image/")) return;
    if (file.size > 10 * 1024 * 1024) {
      setError("Image must be under 10 MB.");
      return;
    }
    const reader = new FileReader();
    reader.onload = (e) => setImagePreview(e.target?.result as string);
    reader.readAsDataURL(file);
  }

  async function handleLog() {
    if (submitLockRef.current || loading) {
      return;
    }

    submitLockRef.current = true;
    setLoading(true);
    setError("");
    let loggedSuccessfully = false;
    try {
      const scopedChallengeId =
        activeChallengeId && !activeChallengeId.startsWith("CATEGORY_")
          ? activeChallengeId
          : undefined;

      const res = await fetch("/api/actions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          category: action!.category,
          actionType: action!.actionType,
          points: action!.points,
          note: note.trim() || undefined,
          imageUrl: imagePreview || undefined,
          ...(scopedChallengeId ? { challengeId: scopedChallengeId } : {}),
        }),
      });

      if (!res.ok) {
        const data = await res.json().catch(() => null);
        setError(
          data?.error ||
            (res.status === 409
              ? "This action was already logged a moment ago."
              : "Failed to log action."),
        );
        return;
      }

      loggedSuccessfully = true;
      setShowCelebration(true);
      window.setTimeout(() => {
        window.location.assign("/dashboard");
      }, 1800);
    } catch {
      setError("Something went wrong.");
    } finally {
      if (!loggedSuccessfully) {
        submitLockRef.current = false;
        setLoading(false);
      }
    }
  }

  return (
    <div className="min-h-screen bg-[#f5f5f3] px-4 py-6">
      {showCelebration && (
        <div className="fixed inset-0 z-50 flex items-center justify-center overflow-hidden bg-[#0b2f18]/70 px-4 backdrop-blur-sm">
          <div className="pointer-events-none absolute inset-0">
            {[
              "left-[12%] top-[18%] bg-emerald-300",
              "left-[22%] top-[72%] bg-yellow-300",
              "left-[78%] top-[20%] bg-lime-300",
              "left-[84%] top-[68%] bg-sky-300",
              "left-[45%] top-[12%] bg-orange-300",
              "left-[58%] top-[82%] bg-green-300",
            ].map((classes) => (
              <span
                key={classes}
                className={`absolute h-3 w-3 animate-ping rounded-full ${classes}`}
              />
            ))}
          </div>

          <div className="relative w-full max-w-[360px] animate-[celebration-pop_0.45s_ease-out] overflow-hidden rounded-[32px] bg-white p-7 text-center shadow-2xl">
            <div className="absolute -right-10 -top-10 h-32 w-32 rounded-full bg-[#dcfce7]" />
            <div className="absolute -left-8 bottom-0 h-24 w-24 rounded-full bg-yellow-100" />
            <div className="relative">
              <div className="mx-auto mb-4 flex h-20 w-20 animate-bounce items-center justify-center rounded-full bg-[#0b5d1e] text-white shadow-lg">
                <Leaf className="h-10 w-10" />
              </div>
              <p className="text-[13px] font-bold uppercase tracking-[0.25em] text-[#0b5d1e]">
                Action Logged
              </p>
              <h2 className="mt-2 text-[30px] font-black text-[#111827]">
                Nice work!
              </h2>
              <div className="mx-auto my-5 w-fit rounded-full bg-[#dcfce7] px-7 py-3">
                <span className="text-[34px] font-black text-[#166534]">
                  +{totalPoints}
                </span>
                <span className="ml-1 text-[15px] font-bold text-[#166534]">
                  pts
                </span>
              </div>
              <p className="text-[14px] leading-6 text-[#6b7280]">
                Your sustainable action was saved. Taking you back to the
                dashboard...
              </p>
            </div>
          </div>
        </div>
      )}
      <div className="mx-auto grid w-full max-w-[430px] gap-5 rounded-[32px] bg-white px-6 py-6 lg:max-w-[1100px] lg:grid-cols-[0.9fr_1.1fr] lg:gap-8 lg:px-8 lg:py-8">

        {/* Header */}
        <div className="flex items-center justify-between lg:col-span-2">
          <Link
            href="/log-action"
            className="flex h-12 w-12 items-center justify-center rounded-full bg-[#eeeeeb] text-[#4b5563]"
          >
            <ChevronLeft className="h-5 w-5" />
          </Link>
          <h1 className="text-[18px] font-medium text-[#111827]">Action Details</h1>
          <div className="h-12 w-12" />
        </div>

        <div className="space-y-5">
          {/* Icon + category */}
          <div className={`flex flex-col items-center rounded-[24px] ${meta.bg} py-8 lg:min-h-[280px] lg:justify-center`}>
            <div className={`mb-3 flex h-20 w-20 items-center justify-center rounded-full ${meta.iconBg}`}>
              <CategoryIcon category={action.category} className={`h-10 w-10 ${meta.iconColor}`} />
            </div>
            <span className="text-[12px] font-semibold uppercase tracking-widest text-[#6b7280]">
              {meta.label}
            </span>
          </div>

          {/* Title + description */}
          <div className="text-center">
            <h2 className="text-[24px] font-bold text-[#111827] mb-2 lg:text-[30px]">{action.title}</h2>
            <p className="text-[15px] text-[#6b7280] lg:text-[16px]">{action.description}</p>
          </div>

          {/* Points badge — updates live */}
          <div className="flex items-center justify-center gap-3">
            <div className="flex items-center gap-2 rounded-full bg-[#dcfce7] px-6 py-3">
              <span className="text-[28px] font-bold text-[#166534]">+{totalPoints}</span>
              <span className="text-[14px] font-medium text-[#166534]">pts</span>
            </div>
            {(noteBonus > 0 || imageBonus > 0) && (
              <div className="text-[12px] text-[#6b7280] leading-tight text-right">
                {noteBonus > 0 && <div>+{noteBonus} story bonus</div>}
                {imageBonus > 0 && <div>+{imageBonus} photo bonus</div>}
              </div>
            )}
          </div>
        </div>

        <div className="space-y-5">
          {/* ── Tell your story ── */}
          <div className="rounded-[20px] border border-[#e5e7eb] p-5">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-[16px] font-semibold text-[#111827]">Tell your story</h3>
              <span className="text-[12px] font-medium text-[#6b7280] bg-gray-100 rounded-full px-2.5 py-1">
                Optional +10pts
              </span>
            </div>
            <textarea
              value={note}
              onChange={(e) => setNote(e.target.value)}
              placeholder="Share details about your sustainable action..."
              maxLength={300}
              rows={3}
              className="min-h-[112px] w-full resize-none rounded-[14px] border border-[#e5e7eb] bg-[#f9fafb] px-4 py-3 text-[15px] text-[#111827] outline-none placeholder:text-[#9ca3af] focus:border-[#0b5d1e] focus:bg-white transition-colors lg:min-h-[160px]"
            />
            {note.trim().length > 0 && (
              <p className="mt-1 text-[11px] text-[#9ca3af] text-right">{note.length}/300</p>
            )}
          </div>

          {/* ── Add an image ── */}
          <div className="rounded-[20px] border border-[#e5e7eb] p-5">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-[16px] font-semibold text-[#111827]">Add an image</h3>
              <span className="text-[12px] font-medium text-[#6b7280] bg-gray-100 rounded-full px-2.5 py-1">
                Optional +15pts
              </span>
            </div>

            {imagePreview ? (
              <div className="relative">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={imagePreview}
                  alt="Preview"
                  className="w-full rounded-[16px] object-cover max-h-[200px]"
                />
                <button
                  onClick={() => setImagePreview(null)}
                  className="absolute top-2 right-2 flex h-10 w-10 items-center justify-center rounded-full bg-black/60 text-white hover:bg-black/80 transition"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-2 gap-3">
                {/* Take Photo */}
                <button
                  type="button"
                  onClick={() => cameraInputRef.current?.click()}
                  className="flex min-h-[120px] flex-col items-center justify-center gap-3 rounded-[16px] border-2 border-dashed border-[#e5e7eb] bg-[#f9fafb] px-3 py-6 text-[#6b7280] hover:border-[#0b5d1e] hover:text-[#0b5d1e] transition-colors"
                >
                  <Camera className="h-6 w-6" />
                  <span className="text-[14px] font-medium">Take Photo</span>
                </button>

                {/* Upload */}
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="flex min-h-[120px] flex-col items-center justify-center gap-3 rounded-[16px] border-2 border-dashed border-[#e5e7eb] bg-[#f9fafb] px-3 py-6 text-[#6b7280] hover:border-[#0b5d1e] hover:text-[#0b5d1e] transition-colors"
                >
                  <ImagePlus className="h-6 w-6" />
                  <span className="text-[14px] font-medium">Upload</span>
                </button>
              </div>
            )}

            {/* Hidden inputs */}
            <input
              ref={cameraInputRef}
              type="file"
              accept="image/*"
              capture="environment"
              className="hidden"
              onChange={(e) => e.target.files?.[0] && handleImageFile(e.target.files[0])}
            />
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={(e) => e.target.files?.[0] && handleImageFile(e.target.files[0])}
            />
          </div>

          {/* Error */}
          {error && <p className="text-center text-sm text-red-600">{error}</p>}

          {/* Log button */}
          <button
            type="button"
            onClick={handleLog}
            disabled={loading}
            className="min-h-14 w-full rounded-full bg-[#0b5d1e] px-5 py-4 text-[16px] font-semibold text-white transition disabled:opacity-60 hover:bg-[#0a4f1a]"
          >
            {loading ? "Logging..." : `Log This Action (+${totalPoints} pts)`}
          </button>
        </div>
      </div>
    </div>
  );
}
