import express from "express";
import mongoose from "mongoose";
import multer from "multer";
import cors from "cors";
import path from "path";
import { fileURLToPath } from "url";
import OpenAI from "openai";
import Stripe from "stripe";
import Razorpay from "razorpay";
import crypto from "crypto";
import dotenv from "dotenv";

dotenv.config();

const stripe = new Stripe(
  "sk_test_51OPpYOSF01MmEgFzAZEgwHqPvMqevyujmyBp1M8JQk7pcDhJJg7QJh0aJyVv1hWRNU6pNDWuSRZzZPXiKAY00Rh100Wl6GwdLC"
);

const razorpayInstance = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID,
  key_secret: process.env.RAZORPAY_KEY_SECRET,
});

const app = express();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

mongoose.connect(
  "mongodb+srv://shankaravi6india:Shankar_123@cms.fcweq.mongodb.net/?retryWrites=true&w=majority&appName=cms",
  {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  }
);

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

app.put(
  "/api/data/:collection/:id",
  upload.single("image"),
  async (req, res) => {
    const { collection, id } = req.params;
    const model = createDynamicModel(collection);

    try {
      const dynamicFields = req.body;
      const finalImageName = req.file
        ? req.file.filename
        : dynamicFields.imageName;
      dynamicFields.imageName = finalImageName;

      const updatedData = await model.findByIdAndUpdate(id, dynamicFields, {
        new: true,
      });
      if (updatedData) {
        res.json({ status: true, data: updatedData });
      } else {
        res.status(404).json({ status: false, error: "Data not found" });
      }
    } catch (error) {
      res.status(500).json({ status: false, error: "Failed to update data" });
    }
  }
);

app.patch(
  "/api/data/:collection/:id",
  upload.single("image"),
  async (req, res) => {
    const { collection, id } = req.params;
    const model = createDynamicModel(collection);

    try {
      const dynamicFields = req.body;
      if (req.file) {
        dynamicFields.imageName = req.file.filename;
      }

      const updatedData = await model.findByIdAndUpdate(
        id,
        { $set: dynamicFields },
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
  }
);

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

//Refine
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
    res
      .status(500)
      .json({ status: false, error: "Failed to generate description" });
  }
});

//Aerio
app.post("/api/data/stripe-payment/:collection", async (req, res) => {
  const { products, userName, email } = req.body;

  if (!products || !userName || !email) {
    return res
      .status(400)
      .json({ status: false, error: "All fields are required" });
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
    console.log(email);

    const session = await stripe.checkout.sessions.create({
      payment_method_types: ["card"],
      customer_email: email,
      mode: "payment",
      success_url: "https://aerio-app.netlify.app/checkout/success",
      cancel_url: "https://aerio-app.netlify.app/",
      line_items: lineItems,
    });
    const responseSession = {
      sessionId: session.id,
    };

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

//Promptrix
app.get("/api/data/:collection/category/:category", async (req, res) => {
  const { collection, category } = req.params;
  const model = createDynamicModel(collection);

  try {
    const data = await model.find({
      category: { $regex: new RegExp(`^${category}$`, "i") },
    });

    if (data.length > 0) {
      res.json({ status: true, data });
    } else {
      res
        .status(404)
        .json({ status: false, error: "No data found for this category" });
    }
  } catch (error) {
    res.status(500).json({ status: false, error: "Failed to fetch data" });
  }
});

app.get("/api/data/premdata/cate/:category", async (req, res) => {
  const { category } = req.params;
  const model = createDynamicModel("prem_promptrix_data");

  try {
    const data = await model
      .find({
        category: { $regex: new RegExp(`^${category}$`, "i") },
      })
      .select("title category price");

    if (data.length > 0) {
      res.json({ status: true, data });
    } else {
      res
        .status(404)
        .json({ status: false, error: "No data found for this category" });
    }
  } catch (error) {
    console.error("Error fetching data:", error);
    res.status(500).json({ status: false, error: "Failed to fetch data" });
  }
});

app.post("/api/data/promptrix/stripe-payment/:collection", async (req, res) => {
  const { products, userName, email } = req.body;
  console.log(products, userName, email);

  if (!products || !userName || !email) {
    return res
      .status(400)
      .json({ status: false, error: "All fields are required" });
  }

  try {
    const lineItems = products.map((product) => ({
      price_data: {
        currency: "usd",
        product_data: {
          name: product.name,
        },
        unit_amount: Number(product.price) * 100,
      },
      quantity: product.count,
    }));

    const session = await stripe.checkout.sessions.create({
      payment_method_types: ["card"],
      customer_email: email,
      mode: "payment",
      success_url:
        "https://promptrix.netlify.app?session_id={CHECKOUT_SESSION_ID}",
      cancel_url: "https://promptrix.netlify.app/",
      line_items: lineItems,
    });

    // Save transaction data in MongoDB
    const { collection } = req.params;
    const model = createDynamicModel(collection);

    const newData = new model({
      ...req.body,
      stripe_sessionid: session.id,
    });

    await newData.save();

    res.json({ status: true, data: { sessionId: session.id } });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      status: false,
      error: "An error occurred while processing your request",
    });
  }
});

app.post("/api/data/promptrix/verify-payment", async (req, res) => {
  const { session_id } = req.body;

  try {
    const session = await stripe.checkout.sessions.retrieve(session_id);

    if (session.payment_status === "paid") {
      // You can also save the purchased prompt and user info to DB here
      res.json({ status: "success", session });
    } else {
      res
        .status(400)
        .json({ status: "failed", message: "Payment not completed" });
    }
  } catch (error) {
    console.error("Stripe verification error:", error);
    res.status(500).json({ status: "error", message: "Internal Server Error" });
  }
});

// Create Razorpay Order
app.post(
  "/api/data/promptrix/razorpay-payment/:collection",
  async (req, res) => {
    const { products, userName, email } = req.body;

    if (!products || !userName || !email) {
      return res
        .status(400)
        .json({ status: false, error: "All fields are required" });
    }

    try {
      const totalAmount = products.reduce((acc, product) => {
        return acc + product.price * product.count;
      }, 0);

      const options = {
        amount: totalAmount * 100,
        currency: "INR",
        receipt: `receipt_order_${Date.now()}`,
        notes: { userName, email },
      };

      const order = await razorpayInstance.orders.create(options);

      res.json({
        status: true,
        data: {
          orderId: order.id,
          amount: options.amount,
        },
      });
    } catch (error) {
      console.error("Razorpay order error:", error);
      res.status(500).json({
        status: false,
        error: "An error occurred while creating Razorpay order",
      });
    }
  }
);

// Verify Razorpay Payment Signature
app.post(
  "/api/data/promptrix/razor-verify-payment/:collection",
  async (req, res) => {
    const {
      razorpay_order_id,
      razorpay_payment_id,
      razorpay_signature,
      products,
      userName,
      email,
    } = req.body;

    const { collection } = req.params;

    // Validate signature
    const hmac = crypto.createHmac("sha256", process.env.RAZORPAY_KEY_SECRET);
    hmac.update(razorpay_order_id + "|" + razorpay_payment_id);
    const digest = hmac.digest("hex");

    if (digest !== razorpay_signature) {
      return res.status(400).json({
        status: "failed",
        message: "Invalid payment signature",
      });
    }

    try {
      // Save data to MongoDB after successful verification
      const model = createDynamicModel(collection);

      const newData = new model({
        products,
        userName,
        email,
        razorpay_order_id,
        razorpay_payment_id,
        razorpay_signature,
      });

      await newData.save();

      res.json({
        status: "success",
        message: "Payment verified and data saved",
      });
    } catch (err) {
      console.error("DB Save Error:", err);
      res.status(500).json({
        status: "error",
        message: "Payment verified but failed to store data",
      });
    }
  }
);

app.get("/api/data/promptrix/paidpromts/:email", async (req, res) => {
  const email = req.params.email;

  try {
    const PaymentsModel = createDynamicModel("promptrix_payments_data");
    const PromptModel = createDynamicModel("prem_promptrix_data");

    const payments = await PaymentsModel.find({ email });

    if (!payments || payments.length === 0) {
      return res.status(404).json({
        status: "not_found",
        message: "No payments found for this email",
      });
    }

    const allProducts = [];

    for (const payment of payments) {
      for (const product of payment.products) {
        try {
          const promptDoc = await PromptModel.findOne({ _id: product.id });

          allProducts.push({
            title: product.name,
            price: product.price,
            id: product.id,
            prompt: promptDoc?.prompt || "Prompt not found",
            userName: payment.userName,
            email: payment.email,
          });
        } catch (err) {
          allProducts.push({
            title: product.name,
            price: product.price,
            id: product.id,
            prompt: "Prompt not found",
            userName: payment.userName,
            email: payment.email,
          });
        }
      }
    }

    res.json({
      status: "success",
      data: allProducts,
    });
  } catch (error) {
    console.error("Error fetching enriched prompt list:", error);
    res.status(500).json({
      status: "error",
      message: "Internal Server Error",
    });
  }
});

const PORT = 5050;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
