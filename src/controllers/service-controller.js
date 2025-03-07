const Service = require("../models/service-model");

exports.createService = async (req, res) => {
  try {
    const { name, category, price, duration, description, status, garageId } = req.body;
    const newService = new Service({ name, category, price, duration, description, status, garageId });
    await newService.save();
    res.status(201).json({ success: true, service: newService });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.getServices = async (req, res) => {
  try {
    const services = await Service.find().populate("category").populate("garageId");
    res.status(200).json({ success: true, services });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.getServiceById = async (req, res) => {
  try {
    const service = await Service.findById(req.params.id).populate("category").populate("garageId");
    if (!service) return res.status(404).json({ success: false, message: "Service not found" });

    res.status(200).json({ success: true, service });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.updateService = async (req, res) => {
  try {
    const updatedService = await Service.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!updatedService) return res.status(404).json({ success: false, message: "Service not found" });

    res.status(200).json({ success: true, service: updatedService });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.deleteService = async (req, res) => {
  try {
    const deletedService = await Service.findByIdAndDelete(req.params.id);
    if (!deletedService) return res.status(404).json({ success: false, message: "Service not found" });

    res.status(200).json({ success: true, message: "Service deleted successfully" });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
