import express from "express";
import mongoose from "mongoose";
import multer from "multer";
import cors from "cors";
import path from "path";
import { fileURLToPath } from "url";
import OpenAI from "openai";

const app = express();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

mongoose.connect("mongodb://localhost:27017/refine", {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

const dynamicSchema = new mongoose.Schema(
  {
    createdDate: { type: Date, default: Date.now },
    updatedDate: { type: Date, default: Date.now },
  },
  { strict: false }
);

dynamicSchema.pre("save", function (next) {
  this.updatedDate = Date.now();
  next();
});

dynamicSchema.pre("findOneAndUpdate", function (next) {
  this.set({ updatedDate: Date.now() });
  next();
});

const DynamicModel = mongoose.model("DynamicData", dynamicSchema);

const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, path.join(__dirname, "uploads/")),
  filename: (req, file, cb) => cb(null, `${Date.now()}-${file.originalname}`),
});

const upload = multer({ storage });

app.use(cors());
app.use(express.json());
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

const openai = new OpenAI({
  apiKey: "",
});

app.post("/api/data", upload.single("image"), async (req, res) => {
  try {
    const dynamicFields = req.body;
    const imageName = req.file ? req.file.filename : "";
    dynamicFields.imageName = imageName;
    const newData = new DynamicModel(dynamicFields);
    await newData.save();
    res.status(201).json({ status: true, data: newData });
  } catch (error) {
    res.status(500).json({ status: false, error: "Failed to add data" });
  }
});

app.put("/api/data/:id", upload.single("image"), async (req, res) => {
  try {
    const dynamicFields = req.body;
    const finalImageName = req.file ? req.file.filename : dynamicFields.imageName;
    dynamicFields.imageName = finalImageName;
    const updatedData = await DynamicModel.findByIdAndUpdate(
      req.params.id,
      dynamicFields,
      { new: true }
    );
    if (updatedData) {
      res.json({ status: true, data: updatedData });
    } else {
      res.status(404).json({ status: false, error: "Data not found" });
    }
  } catch (error) {
    res.status(500).json({ status: false, error: "Failed to update data" });
  }
});

app.get("/api/data", async (req, res) => {
  try {
    const data = await DynamicModel.find();
    res.json({ status: true, data });
  } catch (error) {
    res.status(500).json({ status: false, error: "Failed to fetch data" });
  }
});

app.get("/api/data/:id", async (req, res) => {
  try {
    const data = await DynamicModel.findById(req.params.id);
    if (data) {
      res.json({ status: true, data });
    } else {
      res.status(404).json({ status: false, error: "Data not found" });
    }
  } catch (error) {
    res.status(500).json({ status: false, error: "Failed to fetch data" });
  }
});

app.delete("/api/data/:id", async (req, res) => {
  try {
    const deletedData = await DynamicModel.findByIdAndDelete(req.params.id);
    if (deletedData) {
      res.json({ status: true, message: "Data deleted successfully" });
    } else {
      res.status(404).json({ status: false, error: "Data not found" });
    }
  } catch (error) {
    res.status(500).json({ status: false, error: "Failed to delete data" });
  }
});

app.post("/api/generate-description", async (req, res) => {
  const { prompt } = req.body;
  if (!prompt) {
    return res.status(400).json({ status: false, error: "Prompt is required" });
  }
  try {
    const completion = await openai.chat.completions.create({
      model: "gpt-3.5-turbo",
      store: true,
      messages: [{ role: "user", content: prompt }],
    });
    const generatedText = completion.choices[0].message;
    res.json({ status: true, data: generatedText });
  } catch (error) {
    res.status(500).json({ status: false, error: "Failed to generate description" });
  }
});

const PORT = 5050;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
