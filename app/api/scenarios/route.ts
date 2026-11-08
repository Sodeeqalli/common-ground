import { scenarios } from "../../../lib/game-server";
export async function GET() {
  return Response.json(scenarios.map(({ nodes, ...s }) => s));
}
export async function POST(req: Request) {
  try {
    const {
      id,
      node: nodeId,
      choice: choiceId,
    } = (await req.json()) as { id: string; node?: string; choice?: string };
    const s = scenarios.find((s) => s.id === id);
    if (!s)
      return Response.json({ error: "Scenario not found" }, { status: 404 });
    let node = s.nodes[nodeId || s.startNode];
    if (!node)
      return Response.json({ error: "Node not found" }, { status: 400 });
    const transcript: { who: string; text: string }[] = [];
    let explanation = "",
      credit = 0;
    if (choiceId) {
      const c = node.choices?.find((c) => c.id === choiceId);
      if (!c)
        return Response.json(
          { error: "Choice not available" },
          { status: 400 },
        );
      transcript.push({ who: "You", text: c.text });
      credit = c.credit;
      explanation = c.explanation || "You clarified your message.";
      node = s.nodes[c.next];
    }
    let current = Object.entries(s.nodes).find(([, n]) => n === node)![0];
    while (!["decision", "repair", "terminal"].includes(node.type)) {
      if (node.text)
        transcript.push({
          who: node.speaker || "New information",
          text: node.text,
        });
      current = node.next!;
      node = s.nodes[current];
    }
    return Response.json({
      node: {
        ...node,
        choices: node.choices?.map((c) => ({ id: c.id, text: c.text })),
      },
      nodeId: current,
      transcript,
      explanation,
      credit,
    });
  } catch {
    return Response.json(
      { error: "Invalid practice request." },
      { status: 400 },
    );
  }
}
