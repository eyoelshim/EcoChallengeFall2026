/**
 * @file app/(dashboard)/log-action/[actionType]/page.tsx
 * @author GreenStep Development Team
 * @date Fall 2026
 * @purpose Detailed action submission view. Dynamically resolves action points,
 *          calculates optional story/photo bonuses, and records completions.
 */

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
import { findAction, type ActionItem } from "@/lib/actions-data";
import { GLOBAL_CHALLENGE_ID } from "@/lib/constants";

interface CategoryIconProps {
  readonly category: string;
  readonly className?: string;
}

interface CategoryStyleMeta {
  readonly bg: string;
  readonly iconBg: string;
  readonly iconColor: string;
  readonly label: string;
}

const CATEGORY_META_MAP: Record<string, CategoryStyleMeta> = {
  TRANSPORT: {
    bg: "bg-blue-50",
    iconBg: "bg-blue-200",
    iconColor: "text-blue-600",
    label: "Transportation",
  },
  RECYCLING: {
    bg: "bg-green-50",
    iconBg: "bg-green-200",
    iconColor: "text-green-700",
    label: "Recycling",
  },
  ENERGY: {
    bg: "bg-yellow-50",
    iconBg: "bg-yellow-200",
    iconColor: "text-yellow-700",
    label: "Energy",
  },
  FOOD: {
    bg: "bg-orange-50",
    iconBg: "bg-orange-200",
    iconColor: "text-orange-700",
    label: "Food",
  },
  WATER: {
    bg: "bg-blue-50",
    iconBg: "bg-blue-100",
    iconColor: "text-blue-700",
    label: "Water",
  },
};

/**
 * Renders the category-specific Lucide icon for action detail headers.
 *
 * @param props - Icon category string and optional Tailwind styling classes.
 * @returns React JSX element representing the category icon.
 */
function CategoryIcon({
  category,
  className,
}: CategoryIconProps): React.JSX.Element {
  switch (category) {
    case "TRANSPORT":
      return <Bike className={className} />;
    case "RECYCLING":
      return <Recycle className={className} />;
    case "ENERGY":
      return <Zap className={className} />;
    case "FOOD":
      return <Utensils className={className} />;
    case "WATER":
      return <Droplet className={className} />;
    default:
      return <Leaf className={className} />;
  }
}

/**
 * Action detail and logging page allowing employees to review action points,
 * add optional narrative reflections (+10 pts) and photo proof (+15 pts),
 * and record sustainability completions to Neon PostgreSQL.
 *
 * @returns React JSX element representing the action detail view.
 */
export default function ActionDetailPage(): React.JSX.Element {
  const routeParams = useParams();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const cameraInputRef = useRef<HTMLInputElement>(null);
  const submitLockRef = useRef<boolean>(false);

  const [action, setAction] = useState<ActionItem | null>(null);
  const [fetchingAction, setFetchingAction] = useState<boolean>(true);
  const [loading, setLoading] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string>("");
  const [activeChallengeId, setActiveChallengeId] =
    useState<string>(GLOBAL_CHALLENGE_ID);
  const [personalNote, setPersonalNote] = useState<string>("");
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [showCelebration, setShowCelebration] = useState<boolean>(false);

  const rawActionTypeParam = decodeURIComponent(
    routeParams.actionType as string,
  );

  // 1. Fetch live action details scoped to the active challenge
  useEffect(() => {
    let isSubscribed = true;
    const storedChallengeId =
      localStorage.getItem("activeChallengeId") || GLOBAL_CHALLENGE_ID;
    setActiveChallengeId(storedChallengeId);

    fetch(
      `/api/actions/catalog?challengeId=${encodeURIComponent(
        storedChallengeId,
      )}&actionType=${encodeURIComponent(rawActionTypeParam)}`,
    )
      .then((response) => response.json())
      .then((catalogResponse) => {
        if (!isSubscribed) {
          return;
        }
        if (catalogResponse.action) {
          setAction(catalogResponse.action);
        } else {
          // Fall back to static reference if catalog cannot resolve action
          const fallbackAction = findAction(rawActionTypeParam);
          setAction(fallbackAction || null);
        }
      })
      .catch((caughtError) => {
        console.error(
          "Failed to load action details from catalog:",
          caughtError,
        );
        if (!isSubscribed) {
          return;
        }
        const fallbackAction = findAction(rawActionTypeParam);
        setAction(fallbackAction || null);
      })
      .finally(() => {
        if (isSubscribed) {
          setFetchingAction(false);
        }
      });

    return () => {
      isSubscribed = false;
    };
  }, [rawActionTypeParam]);

  // Loading skeleton state
  if (fetchingAction) {
    return (
      <div className="min-h-screen bg-[#f5f5f3] px-4 py-12 flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block h-8 w-8 animate-spin rounded-full border-3 border-emerald-600 border-t-transparent mb-3" />
          <p className="text-gray-600 text-sm font-medium">
            Loading action details...
          </p>
        </div>
      </div>
    );
  }

  // Not found fallback screen
  if (!action) {
    return (
      <div className="min-h-screen bg-white px-4 py-6 flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-500 text-lg mb-4">Action not found.</p>
          <Link
            href="/log-action"
            className="text-[#0b5d1e] font-medium underline"
          >
            Go back to actions
          </Link>
        </div>
      </div>
    );
  }

  const categoryStyle = CATEGORY_META_MAP[action.category] ?? {
    bg: "bg-gray-50",
    iconBg: "bg-gray-200",
    iconColor: "text-gray-600",
    label: action.category,
  };

  // Dynamic point tally calculation
  const noteBonusPoints = personalNote.trim() ? 10 : 0;
  const imageBonusPoints = imagePreview ? 15 : 0;
  const totalEarnedPoints = action.points + noteBonusPoints + imageBonusPoints;

  /**
   * Processes a selected image file, ensuring size limits and generating a preview.
   *
   * @param selectedFile - The File uploaded or captured by the user.
   */
  function handleImageFile(selectedFile: File): void {
    if (!selectedFile.type.startsWith("image/")) {
      return;
    }
    if (selectedFile.size > 10 * 1024 * 1024) {
      setErrorMessage("Image must be under 10 MB.");
      return;
    }
    const fileReader = new FileReader();
    fileReader.onload = (loadEvent) => {
      setImagePreview(loadEvent.target?.result as string);
    };
    fileReader.readAsDataURL(selectedFile);
  }

  /**
   * Submits the action completion payload to POST /api/actions.
   * Prevents rapid double-clicks using a ref-based lock.
   */
  async function handleLog(): Promise<void> {
    if (submitLockRef.current || loading || !action) {
      return;
    }

    submitLockRef.current = true;
    setLoading(true);
    setErrorMessage("");
    let isLoggedSuccessfully = false;

    try {
      const isSpecificChallenge =
        activeChallengeId && !activeChallengeId.startsWith("CATEGORY_");

      const scopedChallengeId = isSpecificChallenge
        ? activeChallengeId
        : undefined;

      const submissionResponse = await fetch("/api/actions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          category: action.category,
          actionType: action.actionType,
          points: action.points,
          note: personalNote.trim() || undefined,
          imageUrl: imagePreview || undefined,
          ...(scopedChallengeId ? { challengeId: scopedChallengeId } : {}),
        }),
      });

      if (!submissionResponse.ok) {
        const responseData = await submissionResponse.json().catch(() => null);
        setErrorMessage(
          responseData?.error ||
            (submissionResponse.status === 409
              ? "This action was already logged a moment ago."
              : "Failed to log action."),
        );
        return;
      }

      isLoggedSuccessfully = true;
      setShowCelebration(true);
      window.setTimeout(() => {
        window.location.assign("/dashboard");
      }, 1800);
    } catch {
      setErrorMessage("Something went wrong while logging your action.");
    } finally {
      if (!isLoggedSuccessfully) {
        submitLockRef.current = false;
        setLoading(false);
      }
    }
  }

  return (
    <div className="min-h-screen bg-[#f5f5f3] px-4 py-6">
      {/* ── Celebration Overlay ── */}
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
            ].map((positionClass) => (
              <span
                key={positionClass}
                className={`absolute h-3 w-3 animate-ping rounded-full ${positionClass}`}
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
                  +{totalEarnedPoints}
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

      {/* ── Main Detail Container ── */}
      <div className="mx-auto grid w-full max-w-[430px] gap-5 rounded-[32px] bg-white px-6 py-6 lg:max-w-[1100px] lg:grid-cols-[0.9fr_1.1fr] lg:gap-8 lg:px-8 lg:py-8">
        {/* Navigation Header */}
        <div className="flex items-center justify-between lg:col-span-2">
          <Link
            href="/log-action"
            className="flex h-12 w-12 items-center justify-center rounded-full bg-[#eeeeeb] text-[#4b5563]"
          >
            <ChevronLeft className="h-5 w-5" />
          </Link>
          <h1 className="text-[18px] font-medium text-[#111827]">
            Action Details
          </h1>
          <div className="h-12 w-12" />
        </div>

        {/* Left Column: Category, Title, Points */}
        <div className="space-y-5">
          <div
            className={`flex flex-col items-center rounded-[24px] ${categoryStyle.bg} py-8 lg:min-h-[280px] lg:justify-center`}
          >
            <div
              className={`mb-3 flex h-20 w-20 items-center justify-center rounded-full ${categoryStyle.iconBg}`}
            >
              <CategoryIcon
                category={action.category}
                className={`h-10 w-10 ${categoryStyle.iconColor}`}
              />
            </div>
            <span className="text-[12px] font-semibold uppercase tracking-widest text-[#6b7280]">
              {categoryStyle.label}
            </span>
          </div>

          <div className="text-center">
            <h2 className="text-[24px] font-bold text-[#111827] mb-2 lg:text-[30px]">
              {action.title}
            </h2>
            <p className="text-[15px] text-[#6b7280] lg:text-[16px]">
              {action.description}
            </p>
          </div>

          <div className="flex items-center justify-center gap-3">
            <div className="flex items-center gap-2 rounded-full bg-[#dcfce7] px-6 py-3">
              <span className="text-[28px] font-bold text-[#166534]">
                +{totalEarnedPoints}
              </span>
              <span className="text-[14px] font-medium text-[#166534]">
                pts
              </span>
            </div>
            {(noteBonusPoints > 0 || imageBonusPoints > 0) && (
              <div className="text-[12px] text-[#6b7280] leading-tight text-right">
                {noteBonusPoints > 0 && (
                  <div>+{noteBonusPoints} story bonus</div>
                )}
                {imageBonusPoints > 0 && (
                  <div>+{imageBonusPoints} photo bonus</div>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Right Column: Story Note, Photo Upload, Action Submission */}
        <div className="space-y-5">
          {/* Tell your story */}
          <div className="rounded-[20px] border border-[#e5e7eb] p-5">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-[16px] font-semibold text-[#111827]">
                Tell your story
              </h3>
              <span className="text-[12px] font-medium text-[#6b7280] bg-gray-100 rounded-full px-2.5 py-1">
                Optional +10pts
              </span>
            </div>
            <textarea
              value={personalNote}
              onChange={(event) => setPersonalNote(event.target.value)}
              placeholder="Share details about your sustainable action..."
              maxLength={300}
              rows={3}
              className="min-h-[112px] w-full resize-none rounded-[14px] border border-[#e5e7eb] bg-[#f9fafb] px-4 py-3 text-[15px] text-[#111827] outline-none placeholder:text-[#9ca3af] focus:border-[#0b5d1e] focus:bg-white transition-colors lg:min-h-[160px]"
            />
            {personalNote.trim().length > 0 && (
              <p className="mt-1 text-[11px] text-[#9ca3af] text-right">
                {personalNote.length}/300
              </p>
            )}
          </div>

          {/* Add an image */}
          <div className="rounded-[20px] border border-[#e5e7eb] p-5">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-[16px] font-semibold text-[#111827]">
                Add an image
              </h3>
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
                  type="button"
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

            {/* Hidden file inputs */}
            <input
              ref={cameraInputRef}
              type="file"
              accept="image/*"
              capture="environment"
              className="hidden"
              onChange={(event) =>
                event.target.files?.[0] &&
                handleImageFile(event.target.files[0])
              }
            />
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={(event) =>
                event.target.files?.[0] &&
                handleImageFile(event.target.files[0])
              }
            />
          </div>

          {/* Submission error message */}
          {errorMessage && (
            <p className="text-center text-sm text-red-600">{errorMessage}</p>
          )}

          {/* Submit action button */}
          <button
            type="button"
            onClick={handleLog}
            disabled={loading}
            className="min-h-14 w-full rounded-full bg-[#0b5d1e] px-5 py-4 text-[16px] font-semibold text-white transition disabled:opacity-60 hover:bg-[#0a4f1a]"
          >
            {loading
              ? "Logging..."
              : `Log This Action (+${totalEarnedPoints} pts)`}
          </button>
        </div>
      </div>
    </div>
  );
}
