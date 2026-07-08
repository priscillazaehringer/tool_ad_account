import { NextRequest, NextResponse } from "next/server";
import { getSupabaseAdmin } from "@/lib/supabase";
import {
  ANSWER_COLUMNS,
  COMPLETED_COLUMNS,
  TOTAL_STEPS,
  type AnswerColumn,
  type CompletedColumn,
} from "@/lib/steps";

export const runtime = "nodejs";

// GET /api/progress?id=xxx
// Returns the current step and completion timestamp for a row.
export async function GET(req: NextRequest) {
  const id = req.nextUrl.searchParams.get("id");
  if (!id) {
    return NextResponse.json({ error: "Missing id." }, { status: 400 });
  }

  try {
    const supabase = getSupabaseAdmin();
    const { data, error } = await supabase
      .from("meta_setup")
      .select("current_step, completed_at")
      .eq("id", id)
      .maybeSingle();

    if (error) throw error;
    if (!data) {
      return NextResponse.json({ error: "Not found." }, { status: 404 });
    }

    return NextResponse.json({
      currentStep: data.current_step,
      completedAt: data.completed_at,
    });
  } catch (err) {
    console.error("[/api/progress GET]", err);
    return NextResponse.json(
      { error: "Could not load progress." },
      { status: 500 },
    );
  }
}

// POST /api/progress
// Updates an answer and/or the completion timestamp of an action step, and/or
// advances current_step. Column names are validated against an allowlist so the
// request can't write arbitrary columns.
export async function POST(req: NextRequest) {
  let body: {
    id?: string;
    answerColumn?: string;
    answerValue?: string;
    completedColumn?: string;
    currentStep?: number;
  };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid request body." }, { status: 400 });
  }

  const { id, answerColumn, answerValue, completedColumn, currentStep } = body;
  if (!id) {
    return NextResponse.json({ error: "Missing id." }, { status: 400 });
  }

  const update: Record<string, unknown> = {};

  if (answerColumn !== undefined) {
    if (!ANSWER_COLUMNS.includes(answerColumn as AnswerColumn)) {
      return NextResponse.json(
        { error: "Invalid answer column." },
        { status: 400 },
      );
    }
    update[answerColumn] = answerValue ?? null;
  }

  if (completedColumn !== undefined) {
    if (!COMPLETED_COLUMNS.includes(completedColumn as CompletedColumn)) {
      return NextResponse.json(
        { error: "Invalid completion column." },
        { status: 400 },
      );
    }
    update[completedColumn] = new Date().toISOString();
  }

  if (currentStep !== undefined) {
    if (
      typeof currentStep !== "number" ||
      !Number.isInteger(currentStep) ||
      currentStep < 1 ||
      currentStep > TOTAL_STEPS + 1
    ) {
      return NextResponse.json(
        { error: "Invalid step." },
        { status: 400 },
      );
    }
    update.current_step = currentStep;
  }

  if (Object.keys(update).length === 0) {
    return NextResponse.json({ error: "Nothing to update." }, { status: 400 });
  }

  try {
    const supabase = getSupabaseAdmin();
    const { data, error } = await supabase
      .from("meta_setup")
      .update(update)
      .eq("id", id)
      .select("current_step, completed_at")
      .maybeSingle();

    if (error) throw error;
    if (!data) {
      return NextResponse.json({ error: "Not found." }, { status: 404 });
    }

    return NextResponse.json({
      currentStep: data.current_step,
      completedAt: data.completed_at,
    });
  } catch (err) {
    console.error("[/api/progress POST]", err);
    return NextResponse.json(
      { error: "Could not save progress." },
      { status: 500 },
    );
  }
}
