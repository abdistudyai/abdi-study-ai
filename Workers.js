
export default {
  async fetch(request, env) {
    const cors = {
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "POST, OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type"
    };

    if (request.method === "OPTIONS") {
      return new Response(null, { headers: cors });
    }

    if (request.method !== "POST") {
      return new Response("Study AI is ready", {
        headers: cors
      });
    }

    try {
      const { question } = await request.json();

      if (!question || !question.trim()) {
        return Response.json(
          { error: "Please enter a question." },
          { status: 400, headers: cors }
        );
      }

      const result = await fetch(
        "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "x-goog-api-key": env.GEMINI_API_KEY
          },
          body: JSON.stringify({
            contents: [{
              parts: [{
                text: question
              }]
            }]
          })
        }
      );

      const data = await result.json();

      if (!result.ok) {
        return Response.json(
          { error: data.error?.message || "AI request failed." },
          { status: result.status, headers: cors }
        );
      }

      const answer =
        data.candidates?.[0]?.content?.parts
          ?.map(part => part.text || "")
          .join("") || "No answer received.";

      return Response.json({ answer }, { headers: cors });

    } catch (error) {
      return Response.json(
        { error: "Something went wrong. Please try again." },
        { status: 500, headers: cors }
      );
    }
  }
};
