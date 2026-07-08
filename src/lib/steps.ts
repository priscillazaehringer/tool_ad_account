// ---------------------------------------------------------------------------
// Single source of truth for the wizard: questions, options, helper text,
// action-step copy, and the video embed URLs.
//
// Flow shape (6 numbered steps):
//   Step 1 of 6   — Facebook Account
//   Step 2 of 6   — Business Portfolio  (the container everything lives in)
//   Step 3 of 6   — Business Page
//   Step 4 of 6   — Instagram
//   Step 5 of 6   — Ad Account
//   Step 6 of 6   — Invite Our Team  (one combined partner-access step)
//
// To wire in videos, drop *embed* URLs into the VIDEOS map. Any embeddable URL
// works — Vimeo, unlisted YouTube, or Loom. Use the embed form, e.g.
//   Loom: https://www.loom.com/embed/VIDEO_ID   (NOT the /share/ form)
// Leave a value as null to show a "video coming soon" placeholder.
// ---------------------------------------------------------------------------

/** Our team's Meta Business Portfolio ID — clients invite this as a Partner. */
export const BUSINESS_PORTFOLIO_ID = "483230735518997";

export type VideoKey =
  | "businessPortfolioCheck"
  | "businessPortfolio"
  | "businessPage"
  | "instagram"
  | "adAccount"
  | "inviteTeam";

export const VIDEOS: Record<VideoKey, string | null> = {
  // Step 2 — how to check whether you already have a Business Portfolio
  businessPortfolioCheck:
    "https://www.loom.com/embed/71c79f90157e405d957db285588156ed",
  // Step 2 — creating a Business Portfolio
  businessPortfolio:
    "https://www.loom.com/embed/9a4e8b6ae1604788b7c9b1afb12712f5",
  // Step 3 — creating a Facebook Business Page
  businessPage: "https://www.loom.com/embed/a4c80266e542481d8a6523ebca76f7d6",
  // Step 4 — connecting Instagram to the Page
  instagram: "https://www.loom.com/embed/2a2946a15e1f427aa8755c0efae7cdd8",
  // Step 5 — creating a real ad account
  adAccount: "https://www.loom.com/embed/635484e93e834d729cc964e0f750a5cc",
  // Step 6 — inviting our Business Portfolio as a partner and selecting assets.
  // NOTE: this recording demonstrates adding via People/email; the step's
  // videoNote corrects that to the Partner + Portfolio ID flow.
  inviteTeam: "https://www.loom.com/embed/2b959f77906242d0b2a177226c6631a9",
};

export type Interstitial =
  | { type: "text"; heading?: string; body: string[] }
  | { type: "video"; heading?: string; body?: string[]; video: VideoKey };

export interface QuestionOption {
  value: string;
  label: string;
  /** Shown after the option is chosen, before advancing to the next step. */
  interstitial?: Interstitial;
}

export type AnswerColumn =
  | "q1_answer" // Facebook Account
  | "q2_answer" // Business Page
  | "q3_answer" // Instagram
  | "q4_answer" // Ad Account
  | "q5_answer"; // Business Portfolio
export type CompletedColumn = "q6_completed_at" | "q7_completed_at";

export interface ChecklistItem {
  label: string;
  note?: string;
}

export interface QuestionStep {
  kind: "question";
  index: number; // 1-based position in the flow
  answerColumn: AnswerColumn;
  eyebrow: string;
  title: string;
  helper?: string;
  options: QuestionOption[];
}

export interface ActionStep {
  kind: "action";
  index: number;
  completedColumn: CompletedColumn;
  eyebrow: string;
  title: string;
  body: string[];
  video: VideoKey;
  /** A correction/caveat shown in a callout right above the video. */
  videoNote?: string;
  showPortfolioId: boolean;
  checklist?: ChecklistItem[];
  warning?: string;
  confirmLabel: string;
}

export type Step = QuestionStep | ActionStep;

/** Columns the progress API is allowed to write, guarded on the server. */
export const ANSWER_COLUMNS: AnswerColumn[] = [
  "q1_answer",
  "q2_answer",
  "q3_answer",
  "q4_answer",
  "q5_answer",
];
export const COMPLETED_COLUMNS: CompletedColumn[] = [
  "q6_completed_at",
  "q7_completed_at",
];

export const STEPS: Step[] = [
  {
    kind: "question",
    index: 1,
    answerColumn: "q1_answer",
    eyebrow: "Step 1 of 6",
    title: "Do you have a personal Facebook account?",
    options: [
      { value: "yes", label: "Yes, I have one" },
      {
        value: "no",
        label: "No, not yet",
        interstitial: {
          type: "text",
          heading: "Create a personal account first",
          body: [
            "Everything on Meta hangs off a personal Facebook profile — even for businesses. There's no way around it.",
            "Head to facebook.com and sign up with your name and email. It only takes a couple of minutes.",
            "Once you're in, come back here and continue.",
          ],
        },
      },
    ],
  },
  {
    kind: "question",
    index: 2,
    answerColumn: "q5_answer",
    eyebrow: "Step 2 of 6",
    title: "Do you have a Meta Business Portfolio?",
    helper:
      "A Meta Business Portfolio is where Meta stores your Facebook Page, Instagram account, ad account, Pixel, and permissions. It's the container everything else lives in — so we set it up first. If you've run Meta ads before or hired someone to manage your Facebook Page, you may already have one.",
    options: [
      { value: "yes", label: "Yes, I already have one" },
      {
        value: "unsure",
        label: "I'm not sure",
        interstitial: {
          type: "video",
          video: "businessPortfolioCheck",
          heading: "How to check if you already have one",
          body: [
            "Watch this quick video to see how to check whether you already have a Business Portfolio.",
            "Once you know, hit Back and choose Yes or No.",
          ],
        },
      },
      {
        value: "no",
        label: "No, I don't have one",
        interstitial: {
          type: "video",
          video: "businessPortfolio",
          heading: "Create your Business Portfolio",
          body: [
            "This walkthrough shows how to create your Business Portfolio. Set it up, then continue — you'll create your Page, Instagram, and ad account inside it in the next steps.",
          ],
        },
      },
    ],
  },
  {
    kind: "question",
    index: 3,
    answerColumn: "q2_answer",
    eyebrow: "Step 3 of 6",
    title: "Do you have a Facebook Business Page?",
    options: [
      { value: "yes", label: "Yes, I have a Page" },
      {
        value: "no_unsure",
        label: "No / Not sure",
        interstitial: {
          type: "video",
          video: "businessPage",
          heading: "Let's set up your Business Page",
          body: [
            "Watch this short walkthrough to create your Business Page, then continue.",
          ],
        },
      },
    ],
  },
  {
    kind: "question",
    index: 4,
    answerColumn: "q3_answer",
    eyebrow: "Step 4 of 6",
    title: "Is your Instagram connected to your Page?",
    options: [
      { value: "yes", label: "Yes, it's connected" },
      {
        value: "no",
        label: "No, not yet",
        interstitial: {
          type: "video",
          video: "instagram",
          heading: "Connect Instagram to your Page",
          body: [
            "This short video walks through linking your Instagram account to your Facebook Page. Do that, then continue.",
          ],
        },
      },
      { value: "no_instagram", label: "I don't use Instagram" },
    ],
  },
  {
    kind: "question",
    index: 5,
    answerColumn: "q4_answer",
    eyebrow: "Step 5 of 6",
    title: "Do you have a Meta ad account you've used for real campaigns?",
    helper:
      "Boosting an Instagram post doesn't count. That creates a hidden ad account we can't really work with. If you've only ever boosted posts, choose No.",
    options: [
      { value: "yes", label: "Yes, I've run real campaigns" },
      {
        value: "no_unsure",
        label: "No / Not sure",
        interstitial: {
          type: "video",
          video: "adAccount",
          heading: "Create a proper ad account",
          body: [
            "This walkthrough shows how to create a real ad account inside your Business Portfolio. Set it up, then continue.",
          ],
        },
      },
    ],
  },
  {
    kind: "action",
    index: 6,
    completedColumn: "q6_completed_at",
    eyebrow: "Step 6 of 6",
    title: "Invite our team",
    body: [
      "Last step. Instead of adding us to each asset separately, you'll invite our Business Portfolio as a Partner once and grant access to everything we need.",
      "In your Business settings, add a Partner using the ID below, then select the assets on the checklist. The walkthrough shows exactly where everything is.",
    ],
    video: "inviteTeam",
    videoNote:
      "One correction to the video: it shows adding us under People by email — please don't do it that way. Add us as a Partner instead. When you go to add access, choose Partner (not Person). It'll ask for a Business Portfolio ID — that's the number below, not an email address. Everything after that (selecting your assets and confirming) works exactly the same.",
    showPortfolioId: true,
    checklist: [
      { label: "Facebook Page" },
      { label: "Ad Account" },
      { label: "Instagram", note: "if connected" },
      { label: "Pixel", note: "if one exists" },
    ],
    warning:
      "If you see more than one ad account, choose the one you use for real campaigns. Picking the wrong one is the most common mistake here.",
    confirmLabel: "I've invited your team",
  },
];

export const TOTAL_STEPS = STEPS.length;

/** Short labels for the vertical progress rail. */
export const RAIL_LABELS = [
  "Facebook Account",
  "Business Portfolio",
  "Business Page",
  "Instagram",
  "Ad Account",
  "Invite Our Team",
];
