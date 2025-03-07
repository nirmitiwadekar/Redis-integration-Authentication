const mongoose = require("mongoose");

const serviceSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    category: { type: mongoose.Schema.Types.ObjectId, ref: "Category", required: true },
    price: { type: Number, required: true },
    duration: { type: Number, required: true }, 
    description: { type: String },
    status: { type: String, enum: ["available", "unavailable"], default: "available" },
    garageId: { type: mongoose.Schema.Types.ObjectId, ref: "Garage", required: true }
  },
  { timestamps: true }
);

module.exports = mongoose.model("Service", serviceSchema);
