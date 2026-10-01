import mongoose from "mongoose";

// 1. Agency Product Schema
const agencyProductSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    slug: { type: String, trim: true },
    description: { type: String, trim: true },
    price: { type: Number, required: true, min: 0 },
    stock: { type: Number, default: 0 },
    category: { type: String, trim: true },
    image_url: { type: String, trim: true },
    is_active: { type: Boolean, default: true },
  },
  { timestamps: true }
);

// 2. Agency Event Schema
const agencyEventSchema = new mongoose.Schema(
  {
    title: { type: String, required: true, trim: true },
    slug: { type: String, trim: true },
    description: { type: String, trim: true },
    event_date: { type: Date, required: true },
    location: { type: String, required: true, trim: true },
    image: { type: String, trim: true },
    is_active: { type: Boolean, default: true },
  },
  { timestamps: true }
);

// 3. Agency Service Schema
const agencyServiceSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    slug: { type: String, trim: true },
    description: { type: String, trim: true },
    price: { type: Number, required: true, min: 0 },
    is_active: { type: Boolean, default: true },
  },
  { timestamps: true }
);

// 4. Agency Team Schema
const agencyTeamSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    position: { type: String, required: true, trim: true },
    bio: { type: String, trim: true },
    image: { type: String, trim: true },
    is_active: { type: Boolean, default: true },
  },
  { timestamps: true }
);

// 5. Agency Testimonial Schema
const agencyTestimonialSchema = new mongoose.Schema(
  {
    client_name: { type: String, required: true, trim: true },
    company_name: { type: String, trim: true },
    content: { type: String, trim: true },
    rating: { type: Number, default: 5, min: 1, max: 5 },
    is_published: { type: Boolean, default: true },
  },
  { timestamps: true }
);

// 6. Agency FAQ Schema
const agencyFaqSchema = new mongoose.Schema(
  {
    question: { type: String, required: true, trim: true },
    answer: { type: String, required: true, trim: true },
    sort_order: { type: Number, default: 0 },
    is_active: { type: Boolean, default: true },
  },
  { timestamps: true }
);

// 7. Agency Order Schema
const agencyOrderSchema = new mongoose.Schema(
  {
    invoice_number: { type: String, required: true, unique: true, trim: true },
    client_name: { type: String, required: true, trim: true },
    client_email: { type: String, trim: true },
    total_price: { type: Number, required: true, min: 0 },
    status: {
      type: String,
      enum: ["Pending", "Paid", "Completed", "Cancelled"],
      default: "Pending",
    },
    order_date: { type: Date, default: Date.now },
  },
  { timestamps: true }
);

export const AgencyProduct =
  mongoose.models.agencyproducts ||
  mongoose.model("agencyproducts", agencyProductSchema);

export const AgencyEvent =
  mongoose.models.agencyevents ||
  mongoose.model("agencyevents", agencyEventSchema);

export const AgencyService =
  mongoose.models.agencyservices ||
  mongoose.model("agencyservices", agencyServiceSchema);

export const AgencyTeam =
  mongoose.models.agencyteams ||
  mongoose.model("agencyteams", agencyTeamSchema);

export const AgencyTestimonial =
  mongoose.models.agencytestimonials ||
  mongoose.model("agencytestimonials", agencyTestimonialSchema);

export const AgencyFaq =
  mongoose.models.agencyfaqs ||
  mongoose.model("agencyfaqs", agencyFaqSchema);

export const AgencyOrder =
  mongoose.models.agencyorders ||
  mongoose.model("agencyorders", agencyOrderSchema);
