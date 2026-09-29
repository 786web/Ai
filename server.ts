import express from "express";
import path from "path";
import { fileURLToPath } from "url";
import { handleApiRequest } from "./server/apiRouter.ts";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3000;

// Mount API routes
app.use("/api", async (req, res, next) => {
  try {
    const handled = await handleApiRequest(req, res);
    if (!handled) {
      next();
    }
  } catch (err) {
    console.error("API error:", err);
    if (!res.headersSent) {
      res.status(500).json({ error: "Internal Server Error" });
    }
  }
});

// Serve static frontend build
const distPath = path.join(__dirname, "dist");
app.use(express.static(distPath));

app.get("*", (req, res) => {
  res.sendFile(path.join(distPath, "index.html"));
});

app.listen(PORT, () => {
  console.log(`Trivexa AI server running on http://0.0.0.0:${PORT}`);
});
