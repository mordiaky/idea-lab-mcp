import express from "express";
import cors from "cors";
import ideasRouter from "./routes/ideas.js";
import variantsRouter from "./routes/variants.js";
import portfolioRouter from "./routes/portfolio.js";

const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors());
app.use(express.json());

app.use("/api/ideas", ideasRouter);
app.use("/api/variants", variantsRouter);
app.use("/api/portfolio", portfolioRouter);

app.listen(PORT, () => {
  console.error(`[idea-lab-web] Express API server running on port ${PORT}`);
});
