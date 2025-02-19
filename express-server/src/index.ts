import express from "express";
import { createClient } from "redis";

const client = createClient();
const app = express();

app.use(express.json());

client.on("error", (err) => console.log("Redis Client Error", err));

app.get("/result/:id", async (req, res): Promise<any> => {
  const { id } = req.params;

  try {
    const solutions = await client.lRange("solutions", 0, -1);

    const parsedsolutions = solutions
      .map((res) => JSON.parse(res))
      .filter((r) => String(r.problemId) === String(id));

    if (parsedsolutions.length === 0) {
      return res.status(404).json({
        success: false,
        error: `No result found for problemId: ${id}`,
      });
    }

    const latestResult = parsedsolutions[0];

    console.log("LATEST RESULT ::: ", latestResult);

    if (latestResult.success) {
      return res.status(200).json(latestResult);
    } else {
      return res.status(400).json(latestResult);
    }
  } catch (error) {
    console.error("Error fetching solutions:", error);
    res.status(500).json({
      success: false,
      error: "Internal Server Error",
      details: error instanceof Error ? error.message : "Unknown error",
    });
  }
});
app.post("/submit", async (req, res): Promise<any> => {
  const { problemId, code, language } = req.body;

  if (!problemId || !code || !language) {
    return res.status(400).json({
      success: false,
      error: "Missing required fields: problemId, code, or language.",
    });
  }

  try {
    await client.lPush(
      "submissions",
      JSON.stringify({ code, language, problemId })
    );
    res.status(200).json({ success: true, message: "Submission received." });
  } catch (error) {
    console.error("Redis error:", error);
    res
      .status(500)
      .json({ success: false, error: "Failed to store submission." });
  }
});

async function startServer() {
  try {
    await client.connect();
    console.log("Connected to Redis");

    app.listen(3000, () => {
      console.log("Server is running on port 3000");
    });
  } catch (error) {
    console.error("Failed to connect to Redis", error);
    setTimeout(startServer, 5000); // Retry connection after 5 seconds
  }
}

startServer();
