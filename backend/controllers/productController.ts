import type { Request, Response } from "express";

export const getAllProducts = (req: Request, res: Response) => {
  // Logic to retrieve all products from the database
  res.send("Get all products");
};

export const createProduct = (req: Request, res: Response) => {
  // Logic to create a new product in the database
  res.send("Create a new product");
};
