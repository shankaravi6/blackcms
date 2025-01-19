import express from "express";
import mongoose from "mongoose";
import multer from "multer";
import cors from "cors";
import path from "path";
import { fileURLToPath } from "url";
import OpenAI from "openai";
import Stripe from 'stripe';
const stripe = new Stripe('sk_test_51OPpYOSF01MmEgFzAZEgwHqPvMqevyujmyBp1M8JQk7pcDhJJg7QJh0aJyVv1hWRNU6pNDWuSRZzZPXiKAY00Rh100Wl6GwdLC');

const app = express();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

mongoose.connect("mongodb+srv://shankaravi6india:Shankar_123@cms.fcweq.mongodb.net/?retryWrites=true&w=majority&appName=cms", {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

const createDynamicModel = (collectionName) => {
  if (mongoose.models[collectionName]) {
    return mongoose.models[collectionName];
  }

  const schema = new mongoose.Schema(
    {
      createdDate: { type: Date, default: Date.now },
      updatedDate: { type: Date, default: Date.now },
    },
    { strict: false }
  );

  schema.pre("save", function (next) {
    this.updatedDate = Date.now();
    next();
  });

  schema.pre("findOneAndUpdate", function (next) {
    this.set({ updatedDate: Date.now() });
    next();
  });

  return mongoose.model(collectionName, schema, collectionName);
};

const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, path.join(__dirname, "uploads/")),
  filename: (req, file, cb) => cb(null, `${Date.now()}-${file.originalname}`),
});

const upload = multer({ storage });

app.use(cors());
app.use(express.json());
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

const openai = new OpenAI({
  apiKey: "your-openai-api-key",
});

app.post("/api/data/:collection", upload.single("image"), async (req, res) => {
  const { collection } = req.params;
  const model = createDynamicModel(collection);

  try {
    const dynamicFields = req.body;
    const imageName = req.file ? req.file.filename : "";
    dynamicFields.imageName = imageName;
    const newData = new model(dynamicFields);
    await newData.save();
    res.status(201).json({ status: true, data: newData });
  } catch (error) {
    res.status(500).json({ status: false, error: "Failed to add data" });
  }
});

app.put("/api/data/:collection/:id", upload.single("image"), async (req, res) => {
  const { collection, id } = req.params;
  const model = createDynamicModel(collection);

  try {
    const dynamicFields = req.body;
    const finalImageName = req.file ? req.file.filename : dynamicFields.imageName;
    dynamicFields.imageName = finalImageName;

    const updatedData = await model.findByIdAndUpdate(id, dynamicFields, { new: true });
    if (updatedData) {
      res.json({ status: true, data: updatedData });
    } else {
      res.status(404).json({ status: false, error: "Data not found" });
    }
  } catch (error) {
    res.status(500).json({ status: false, error: "Failed to update data" });
  }
});

app.patch("/api/data/:collection/:id", upload.single("image"), async (req, res) => {
  const { collection, id } = req.params;
  const model = createDynamicModel(collection);

  try {
    const dynamicFields = req.body;
    if (req.file) {
      dynamicFields.imageName = req.file.filename;
    }

    const updatedData = await model.findByIdAndUpdate(id, { $set: dynamicFields }, { new: true });
    if (updatedData) {
      res.json({ status: true, data: updatedData });
    } else {
      res.status(404).json({ status: false, error: "Data not found" });
    }
  } catch (error) {
    res.status(500).json({ status: false, error: "Failed to update data" });
  }
});


app.get("/api/data/:collection", async (req, res) => {
  const { collection } = req.params;
  const model = createDynamicModel(collection);

  try {
    const data = await model.find();
    res.json({ status: true, data });
  } catch (error) {
    res.status(500).json({ status: false, error: "Failed to fetch data" });
  }
});

app.get("/api/data/:collection/:id", async (req, res) => {
  const { collection, id } = req.params;
  const model = createDynamicModel(collection);

  try {
    const data = await model.findById(id);
    if (data) {
      res.json({ status: true, data });
    } else {
      res.status(404).json({ status: false, error: "Data not found" });
    }
  } catch (error) {
    res.status(500).json({ status: false, error: "Failed to fetch data" });
  }
});

app.delete("/api/data/:collection/:id", async (req, res) => {
  const { collection, id } = req.params;
  const model = createDynamicModel(collection);

  try {
    const deletedData = await model.findByIdAndDelete(id);
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


app.post("/api/data/stripe-payment/:collection", async (req, res) => {
  const { products, userName, email } = req.body;

  if (!products || !userName || !email ) {
    return res.status(400).json({ status: false, error: "All fields are required" });
  }

  try {
    const lineItems = products.map((product) => ({
      price_data: {
        currency: "usd",
        product_data: {
          name: product.name,
        },
        unit_amount: product.price * 100,
      },
      quantity: product.count,
    }));
    console.log(lineItems);
    console.log(email)

    const session = await stripe.checkout.sessions.create({
      payment_method_types: ["card"],
      customer_email: email,
      mode: "payment",
      success_url: "http://localhost:3000/checkout/success",
      cancel_url: "http://localhost:3000",
      line_items: lineItems,
    });
    const responseSession = {
      sessionId: session.id,
    }

    const { collection } = req.params;
    const model = createDynamicModel(collection);

    
    const dynamicFields = req.body;
    dynamicFields.stripe_sessionid = session.id;
    const newData = new model(dynamicFields);
    await newData.save();
    

    res.json({ status: true, data: responseSession });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      status: false,
      error: "An error occurred while processing your request",
    });
  }
});

const PORT = 5050;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
