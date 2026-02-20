import { NextResponse } from "next/server";
import { v4 as uuidv4 } from "uuid";
import { analyzeFounderContext, generateOutputs } from "@/lib/openai";
import { checkGuardrails } from "@/lib/guardrails";
import { saveSession } from "@/lib/store";
import type { FounderIntake } from "@/lib/types";

export async function POST(req: Request) {
  try {
    const { intake, overrideGuardrail } = (await req.json()) as {
      intake: FounderIntake;
      overrideGuardrail?: boolean;
    };

    if (!intake) {
      return NextResponse.json(
        { error: "Missing intake data" },
        { status: 400 }
      );
    }

    const analysis = await analyzeFounderContext(intake);
    const guardrailResult = checkGuardrails(intake, analysis);
    const guardrailTriggered =
      guardrailResult.triggered && !overrideGuardrail;

    if (guardrailTriggered) {
      return NextResponse.json(
        {
          guardrailTriggered: true,
          reason: guardrailResult.reason,
        },
        { status: 200 }
      );
    }

    const outputs = await generateOutputs(intake, analysis);

    const id = uuidv4();
    const result = {
      id,
      intake,
      analysis,
      outputs,
      guardrailTriggered: false,
      createdAt: new Date().toISOString(),
    };

    await saveSession(result);

    return NextResponse.json({
      id,
      guardrailTriggered: false,
      result,
    });
  } catch (e) {
    console.error("Analyze error:", e);
    return NextResponse.json(
      {
        error:
          e instanceof Error ? e.message : "Analysis failed. Please try again.",
      },
      { status: 500 }
    );
  }
}
