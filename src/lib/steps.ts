// ---------------------------------------------------------------------------
// Single source of truth for the six-step wizard: questions, options, helper
// text, action-step copy, and the video embed URLs.
//
// To wire in real videos later, drop your embed URLs into the VIDEOS map
// below. Any embeddable URL works — Vimeo, unlisted YouTube, or Loom. Use the
// *embed* form of the URL, for example:
//   Vimeo:   https://player.vimeo.com/video/123456789
//   YouTube: https://www.youtube.com/embed/VIDEO_ID
//   Loom:    https://www.loom.com/embed/VIDEO_ID
// Leave a value as null to show a "video coming soon" placeholder.
// ---------------------------------------------------------------------------

/** Our team's Meta Business Manager ID — clients paste this to grant access. */
export const BUSINESS_MANAGER_ID = "483230735518997";

export type VideoKey =
  | "businessPage"
  | "instagram"
  | "adAccount"
  | "addTeamToPage"
  | "addTeamToAdAccount";

/** Drop real embed URLs here when they're ready. */
export const VIDEOS: Record<VideoKey, string | null> = {
  businessPage: null, // Step 2 — creating a Facebook Business Page
  instagram: null, // Step 3 — connecting Instagram to the Page
  adAccount: null, // Step 4 — creating a real ad account
  addTeamToPage: null, // Step 5 — adding our team to the Page
  addTeamToAdAccount: null, // Step 6 — adding our team to the ad account
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

export type AnswerColumn = "q1_answer" | "q2_answer" | "q3_answer" | "q4_answer";
export type CompletedColumn = "q5_completed_at" | "q6_completed_at";

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
  showManagerId: boolean;
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
];
export const COMPLETED_COLUMNS: CompletedColumn[] = [
  "q5_completed_at",
  "q6_completed_at",
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
    answerColumn: "q2_answer",
    eyebrow: "Step 2 of 6",
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
    index: 3,
    answerColumn: "q3_answer",
    eyebrow: "Step 3 of 6",
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
    index: 4,
    answerColumn: "q4_answer",
    eyebrow: "Step 4 of 6",
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
            "This walkthrough shows how to create a real ad account inside Meta Business settings. Set it up, then continue.",
          ],
        },
      },
    ],
  },
  {
    kind: "action",
    index: 5,
    completedColumn: "q5_completed_at",
    eyebrow: "Step 5 of 6",
    title: "Add our team to your Page",
    body: [
      "Now we connect. Watch the walkthrough, then add us as a partner on your Business Page using the ID below.",
      "When Facebook asks which Business Manager you want to give access to, paste this ID:",
    ],
    video: "addTeamToPage",
    showManagerId: true,
    confirmLabel: "I've added your team to my Page",
  },
  {
    kind: "action",
    index: 6,
    completedColumn: "q6_completed_at",
    eyebrow: "Step 6 of 6",
    title: "Add our team to your ad account",
    body: [
      "Same idea as the last step, but for your ad account this time. Watch the walkthrough, then grant us partner access using the ID below.",
    ],
    video: "addTeamToAdAccount",
    showManagerId: true,
    warning:
      "If you see more than one ad account, choose the one you just created. Picking the wrong one is the most common mistake here.",
    confirmLabel: "I've added your team to my ad account",
  },
];

export const TOTAL_STEPS = STEPS.length;

/** Short labels for the vertical progress rail. */
export const RAIL_LABELS = [
  "Facebook account",
  "Business Page",
  "Instagram",
  "Ad account",
  "Add us to your Page",
  "Add us to your ad account",
];
