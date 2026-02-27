import express from "express";
import {
  createProduct,
  getAllProducts,
} from "../controllers/productController.js";

const router = express.Router();

router.get("/test", (req, res) => {
  res.send("Welcome to the Products API!");
});

router.get("/", getAllProducts);

router.post("/", createProduct);

export default router;
