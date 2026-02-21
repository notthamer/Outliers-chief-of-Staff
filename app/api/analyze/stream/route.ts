import { NextResponse } from "next/server";
import { v4 as uuidv4 } from "uuid";
import { analyzeFounderContext, generateOutputsStreaming } from "@/lib/openai";
import { checkGuardrails } from "@/lib/guardrails";
import { saveSession } from "@/lib/store";
import type { FounderIntake, SessionResult, GeneratedOutputs } from "@/lib/types";

function streamLine(data: object): string {
  return JSON.stringify(data) + "\n";
}

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
      const encoder = new TextEncoder();
      const stream = new ReadableStream({
        start(controller) {
          controller.enqueue(
            encoder.encode(
              streamLine({
                type: "guardrail",
                reason: guardrailResult.reason,
              })
            )
          );
          controller.close();
        },
      });
      return new Response(stream, {
        headers: {
          "Content-Type": "application/x-ndjson",
          "Cache-Control": "no-cache",
          Connection: "keep-alive",
        },
      });
    }

    const id = uuidv4();
    const outputs: Partial<GeneratedOutputs> = {};

    const encoder = new TextEncoder();
    const stream = new ReadableStream({
      async start(controller) {
        controller.enqueue(
          encoder.encode(streamLine({ type: "analysis", data: analysis }))
        );

        for await (const msg of generateOutputsStreaming(intake, analysis)) {
          const m = msg as { key: keyof GeneratedOutputs; chunk?: string; content?: string };
          if (m.chunk) {
            outputs[m.key] = (outputs[m.key] ?? "") + m.chunk;
            controller.enqueue(
              encoder.encode(streamLine({ type: "output_chunk", key: m.key, chunk: m.chunk }))
            );
          }
          if (m.content) {
            outputs[m.key] = m.content;
            controller.enqueue(
              encoder.encode(streamLine({ type: "output", key: m.key, content: m.content }))
            );
          }
        }

        const result: SessionResult = {
          id,
          intake,
          analysis,
          outputs: outputs as GeneratedOutputs,
          guardrailTriggered: false,
          createdAt: new Date().toISOString(),
        };
        await saveSession(result);

        controller.enqueue(
          encoder.encode(streamLine({ type: "done", id, result }))
        );
        controller.close();
      },
    });

    return new Response(stream, {
      headers: {
        "Content-Type": "application/x-ndjson",
        "Cache-Control": "no-cache",
        Connection: "keep-alive",
      },
    });
  } catch (e) {
    console.error("Analyze stream error:", e);
    return NextResponse.json(
      {
        error:
          e instanceof Error ? e.message : "Analysis failed. Please try again.",
      },
      { status: 500 }
    );
  }
}
