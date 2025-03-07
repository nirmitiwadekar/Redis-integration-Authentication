const mongoose = require("mongoose");

const categorySchema = new mongoose.Schema({
  name: { type: String, required: true },
  parentCategory: { type: mongoose.Schema.Types.ObjectId, ref: "Category" }, // Self-referencing for hierarchy
  description: String,
  subcategories: [{ type: mongoose.Schema.Types.ObjectId, ref: "Category" }],
  services: [{ type: mongoose.Schema.Types.ObjectId, ref: "Service" }],
});

module.exports = mongoose.model("Category", categorySchema);
