import mongoose from "mongoose";

const productSchema = new mongoose.Schema({
  // id: {
  //   type: String,
  //   required: true,

  // },
  image_url: {
    type: String,
    required: true,
  },
  category: {
    type: String,
    required: true,
  },
  title: {
    type: String,
    required: true,
  },
  description: {
    type: String,
    required: true,
  },
  price_in_cents: {
    type: Number,
    required: true,
  },
  // sales: {
  //   type: Number,
  //   // required: true,
  // },
  created_at: {
    type: Date,
    default: Date.now(),
    required: true,
  },
});

const Product = mongoose.model("Product", productSchema)

export default Product
