import express from "express";
import {
  AgencyProduct,
  AgencyEvent,
  AgencyService,
  AgencyTeam,
  AgencyTestimonial,
  AgencyFaq,
  AgencyOrder,
} from "../models/agencyModel.js";

const agencyRouter = express.Router();

const modelMap = {
  products: AgencyProduct,
  events: AgencyEvent,
  services: AgencyService,
  team: AgencyTeam,
  testimonials: AgencyTestimonial,
  faqs: AgencyFaq,
  orders: AgencyOrder,
};

// Generic GET all items by tab
agencyRouter.get("/:tab", async (req, res) => {
  try {
    const { tab } = req.params;
    const Model = modelMap[tab];
    if (!Model) {
      return res.status(404).json({ success: false, message: "Tab not found" });
    }
    const items = await Model.find({}).sort({ createdAt: -1 });
    res.json(items);
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// Generic POST create item
agencyRouter.post("/:tab", async (req, res) => {
  try {
    const { tab } = req.params;
    const Model = modelMap[tab];
    if (!Model) {
      return res.status(404).json({ success: false, message: "Tab not found" });
    }
    const created = await Model.create(req.body);
    res.status(201).json({ success: true, data: created });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// Generic PUT update item
agencyRouter.put("/:tab/:id", async (req, res) => {
  try {
    const { tab, id } = req.params;
    const Model = modelMap[tab];
    if (!Model) {
      return res.status(404).json({ success: false, message: "Tab not found" });
    }
    const updated = await Model.findByIdAndUpdate(id, req.body, { new: true });
    res.json({ success: true, data: updated });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// Generic DELETE remove item
agencyRouter.delete("/:tab/:id", async (req, res) => {
  try {
    const { tab, id } = req.params;
    const Model = modelMap[tab];
    if (!Model) {
      return res.status(404).json({ success: false, message: "Tab not found" });
    }
    await Model.findByIdAndDelete(id);
    res.json({ success: true, message: "Deleted successfully" });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

export default agencyRouter;
