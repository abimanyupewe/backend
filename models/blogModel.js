import mongoose from "mongoose";

const commentSchema = new mongoose.Schema({
  name: { type: String, required: true },
  image: { type: String },
  date: { type: Date, default: Date.now },
  comment: { type: String, required: true },
  likes: { type: Number, default: 0 },
});

const contentSchema = new mongoose.Schema({
  tip: { type: Number },
  title: { type: String },
  description: { type: String },
  images: [{ type: String }],
});

const blogSchema = new mongoose.Schema(
  {
    title: { type: String, required: true },
    date: { type: Date, default: Date.now },
    relase: { type: String },
    author: {
      name: { type: String },
      about: { type: String },
      profileImage: { type: String },
    },
    excerpt: { type: String },
    category: { type: String },
    tags: [{ type: String }],
    slug: { type: String, unique: true },
    coverImage: { type: String },
    seo: {
      metaTitle: { type: String },
      metaDescription: { type: String },
      keywords: [{ type: String }],
    },
    content: [contentSchema],
    comments: [commentSchema],
    relatedPosts: [
      {
        title: { type: String },
        slug: { type: String },
        date: { type: Date },
      }
    ],
    helpfulCount: { type: Number, default: 0 }
  },
  { timestamps: true }
);

const blogModel = mongoose.models.blog || mongoose.model("blog", blogSchema);
export default blogModel;
