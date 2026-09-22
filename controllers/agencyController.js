import AgencyProduct from "../models/agencyProductModel.js";
import AgencyOrder from "../models/agencyOrderModel.js";
import AgencyEvent from "../models/agencyEventModel.js";
import AgencyTeam from "../models/agencyTeamModel.js";
import AgencyTestimonial from "../models/agencyTestimonialModel.js";
import AgencyFaq from "../models/agencyFaqModel.js";
import AgencyService from "../models/agencyServiceModel.js";

// --- Products ---
export const getAgencyProducts = async (req, res) => {
  try {
    const products = await AgencyProduct.find({ is_active: true, deleted_at: null });
    res.json(products);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const createAgencyProduct = async (req, res) => {
  try {
    const product = new AgencyProduct(req.body);
    const createdProduct = await product.save();
    res.status(201).json(createdProduct);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

export const updateAgencyProduct = async (req, res) => {
  try {
    const updatedProduct = await AgencyProduct.findByIdAndUpdate(req.params.id, req.body, { new: true });
    res.json(updatedProduct);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

export const deleteAgencyProduct = async (req, res) => {
  try {
    await AgencyProduct.findByIdAndUpdate(req.params.id, { deleted_at: new Date(), is_active: false });
    res.json({ message: "Product deleted" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// --- Orders ---
export const createAgencyOrder = async (req, res) => {
  try {
    // Generate simple invoice number
    const invoice_number = `INV-${Date.now()}`;
    const orderData = { ...req.body, invoice_number };
    
    const order = new AgencyOrder(orderData);
    const createdOrder = await order.save();
    res.status(201).json(createdOrder);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

export const getAgencyOrders = async (req, res) => {
  try {
    const orders = await AgencyOrder.find().sort({ createdAt: -1 });
    res.json(orders);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const updateAgencyOrder = async (req, res) => {
  try {
    const updatedOrder = await AgencyOrder.findByIdAndUpdate(req.params.id, { status: req.body.status }, { new: true });
    res.json(updatedOrder);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// --- Events ---
export const getAgencyEvents = async (req, res) => {
  try {
    const events = await AgencyEvent.find().sort({ event_date: -1 });
    res.json(events);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const createAgencyEvent = async (req, res) => {
  try {
    const event = new AgencyEvent(req.body);
    const createdEvent = await event.save();
    res.status(201).json(createdEvent);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

export const updateAgencyEvent = async (req, res) => {
  try {
    const updatedEvent = await AgencyEvent.findByIdAndUpdate(req.params.id, req.body, { new: true });
    res.json(updatedEvent);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

export const deleteAgencyEvent = async (req, res) => {
  try {
    await AgencyEvent.findByIdAndDelete(req.params.id);
    res.json({ message: "Event deleted" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// --- Services ---
export const getAgencyServices = async (req, res) => {
  try {
    const services = await AgencyService.find({ is_active: true }).sort({ sort_order: 1 });
    res.json(services);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const createAgencyService = async (req, res) => {
  try {
    const service = new AgencyService(req.body);
    const createdService = await service.save();
    res.status(201).json(createdService);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

export const updateAgencyService = async (req, res) => {
  try {
    const updatedService = await AgencyService.findByIdAndUpdate(req.params.id, req.body, { new: true });
    res.json(updatedService);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

export const deleteAgencyService = async (req, res) => {
  try {
    await AgencyService.findByIdAndDelete(req.params.id);
    res.json({ message: "Service deleted" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// --- Team ---
export const getAgencyTeam = async (req, res) => {
  try {
    const team = await AgencyTeam.find({ is_active: true });
    res.json(team);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const createAgencyTeam = async (req, res) => {
  try {
    const team = new AgencyTeam(req.body);
    const createdTeam = await team.save();
    res.status(201).json(createdTeam);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

export const updateAgencyTeam = async (req, res) => {
  try {
    const updatedTeam = await AgencyTeam.findByIdAndUpdate(req.params.id, req.body, { new: true });
    res.json(updatedTeam);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

export const deleteAgencyTeam = async (req, res) => {
  try {
    await AgencyTeam.findByIdAndDelete(req.params.id);
    res.json({ message: "Team member deleted" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// --- Testimonials ---
export const getAgencyTestimonials = async (req, res) => {
  try {
    const testimonials = await AgencyTestimonial.find({ is_published: true });
    res.json(testimonials);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const createAgencyTestimonial = async (req, res) => {
  try {
    const testimonial = new AgencyTestimonial(req.body);
    const createdTestimonial = await testimonial.save();
    res.status(201).json(createdTestimonial);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

export const updateAgencyTestimonial = async (req, res) => {
  try {
    const updatedTestimonial = await AgencyTestimonial.findByIdAndUpdate(req.params.id, req.body, { new: true });
    res.json(updatedTestimonial);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

export const deleteAgencyTestimonial = async (req, res) => {
  try {
    await AgencyTestimonial.findByIdAndDelete(req.params.id);
    res.json({ message: "Testimonial deleted" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// --- FAQs ---
export const getAgencyFaqs = async (req, res) => {
  try {
    const faqs = await AgencyFaq.find({ is_active: true }).sort({ sort_order: 1 });
    res.json(faqs);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const createAgencyFaq = async (req, res) => {
  try {
    const faq = new AgencyFaq(req.body);
    const createdFaq = await faq.save();
    res.status(201).json(createdFaq);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

export const updateAgencyFaq = async (req, res) => {
  try {
    const updatedFaq = await AgencyFaq.findByIdAndUpdate(req.params.id, req.body, { new: true });
    res.json(updatedFaq);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

export const deleteAgencyFaq = async (req, res) => {
  try {
    await AgencyFaq.findByIdAndDelete(req.params.id);
    res.json({ message: "FAQ deleted" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
