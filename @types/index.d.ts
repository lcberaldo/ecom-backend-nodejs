import { Response } from "express";
import { Document } from "mongoose";

export interface iProduct extends Document {
  image_url: string;
  category: string;
  title: string;
  description: string;
  price_in_cents: number;
  created_at: Date;
}

interface iResponse extends Response {
  product?: iProduct
}