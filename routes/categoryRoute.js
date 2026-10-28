import express from "express";
import {
  addCategory,
  getCategories,
  getCategoryById,
  updateCategory,
  deleteCategory,
} from "../controllers/categoryController.js";

import authorize, { ownOrAdmin } from "../middleware/authorize.js";

const categoryRouter = express.Router();
const admins = ["superadmin", "admin"];

categoryRouter.post("/add", authorize(...admins), addCategory);
categoryRouter.get("/get", getCategories);
categoryRouter.get("/get/:id", getCategoryById);
categoryRouter.put("/update/:id", authorize(...admins), updateCategory);
categoryRouter.delete("/delete/:id", authorize(...admins), deleteCategory);

export default categoryRouter;
