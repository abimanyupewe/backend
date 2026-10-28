import express from "express";
import {
  getAgencyProducts,
  createAgencyProduct,
  updateAgencyProduct,
  deleteAgencyProduct,
  getAgencyOrders,
  createAgencyOrder,
  updateAgencyOrder,
  getAgencyEvents,
  createAgencyEvent,
  updateAgencyEvent,
  deleteAgencyEvent,
  getAgencyServices,
  createAgencyService,
  updateAgencyService,
  deleteAgencyService,
  getAgencyTeam,
  createAgencyTeam,
  updateAgencyTeam,
  deleteAgencyTeam,
  getAgencyTestimonials,
  createAgencyTestimonial,
  updateAgencyTestimonial,
  deleteAgencyTestimonial,
  getAgencyFaqs,
  createAgencyFaq,
  updateAgencyFaq,
  deleteAgencyFaq
} from "../controllers/agencyController.js";

const router = express.Router();

// Public & Admin routes for MVP (minimal authentication setup for now)
router.get("/products", getAgencyProducts);
router.post("/products", createAgencyProduct);
router.put("/products/:id", updateAgencyProduct);
router.delete("/products/:id", deleteAgencyProduct);

router.get("/orders", getAgencyOrders);
router.post("/orders", createAgencyOrder);
router.put("/orders/:id", updateAgencyOrder);

router.get("/events", getAgencyEvents);
router.post("/events", createAgencyEvent);
router.put("/events/:id", updateAgencyEvent);
router.delete("/events/:id", deleteAgencyEvent);

router.get("/services", getAgencyServices);
router.post("/services", createAgencyService);
router.put("/services/:id", updateAgencyService);
router.delete("/services/:id", deleteAgencyService);

router.get("/team", getAgencyTeam);
router.post("/team", createAgencyTeam);
router.put("/team/:id", updateAgencyTeam);
router.delete("/team/:id", deleteAgencyTeam);

router.get("/testimonials", getAgencyTestimonials);
router.post("/testimonials", createAgencyTestimonial);
router.put("/testimonials/:id", updateAgencyTestimonial);
router.delete("/testimonials/:id", deleteAgencyTestimonial);

router.get("/faqs", getAgencyFaqs);
router.post("/faqs", createAgencyFaq);
router.put("/faqs/:id", updateAgencyFaq);
router.delete("/faqs/:id", deleteAgencyFaq);

export default router;
