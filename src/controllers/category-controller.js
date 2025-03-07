const Category = require("../models/category-model")


exports.createCategory = async (req, res) => {
  try {
    const { name, parentCategory, description } = req.body;
    
    // Create the new category
    const newCategory = new Category({ name, parentCategory, description });
    await newCategory.save();

    // If it is a subcategory, update the parent category
    if (parentCategory) {
      const parent = await Category.findById(parentCategory);
      if (!parent) {
        return res.status(404).json({ success: false, message: "Parent category not found" });
      }

      // Add new category to parent's subcategories array
      parent.subcategories.push(newCategory._id);
      await parent.save();
    }

    res.status(201).json({ success: true, category: newCategory });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.getCategories = async (req, res) => {
  try {
    // Populate subcategories and services for each category
    const categories = await Category.find({ parentCategory: null })
      .populate({
        path: "subcategories",
        populate: { path: "subcategories" } // Nested population for deeper hierarchy
      })
      .populate("services");

    res.status(200).json({ success: true, categories });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.getCategoryById = async (req, res) => {
  try {
    const category = await Category.findById(req.params.id)
      .populate({
        path: "subcategories",
        populate: { path: "subcategories" }
      })
      .populate("services");

    if (!category) {
      return res.status(404).json({ success: false, message: "Category not found" });
    }

    res.status(200).json({ success: true, category });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};


exports.updateCategory = async (req, res) => {
  try {
    const updatedCategory = await Category.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!updatedCategory) return res.status(404).json({ success: false, message: "Category not found" });

    res.status(200).json({ success: true, category: updatedCategory });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.deleteCategory = async (req, res) => {
  try {
    const deletedCategory = await Category.findByIdAndDelete(req.params.id);
    if (!deletedCategory) return res.status(404).json({ success: false, message: "Category not found" });

    res.status(200).json({ success: true, message: "Category deleted successfully" });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
