import express, { NextFunction, Request } from 'express';
import Product from '../models/productSchema';
import multer from 'multer'
import { iProduct, iResponse } from '../../@types';

const router = express.Router();

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/');
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + '-' + file.originalname);
  }
});
const upload = multer({ storage: storage });

async function getProduct(req: Request, res: iResponse, next: NextFunction) {
  let product: iProduct | null
  try {

    const id = req.params.id

    product = await Product.findById(id)


    if (product === null) {
      return res.status(404).json({ message: 'product not found' })
    }
  } catch (error: any) {
    return res.status(500).json({ message: error.message })
  }

  res.product = product

  next()
}

// get all
router.get('/', async (req, res) => {
  const products = await Product.find()
  res.json(products)
})

// getting one
router.get('/:id', getProduct, (req, res: iResponse) => {
  res.json(res.product)
})

// creating one
router.post('/', upload.single('image'), async (req, res) => {
  if (!req.file) {
    return res.status(400).send('No image file uploaded');
  }

  const image = {
    path: req.file.path
  }

  const product: iProduct = new Product({
    title: req.body.title,
    category: req.body.category,
    description: req.body.description,
    price_in_cents: req.body.price_in_cents,
    image_url: image.path

  })

  try {
    const newProduct = await product.save()
    res.status(201).json(newProduct)
  } catch (error) {
    res.status(500).json({ message: error })
  }
})

// deleting one
router.delete('/:id', getProduct, async (req, res: iResponse) => {
  try {
    await res.product?.deleteOne()
    res.status(200).json({ message: 'product was deleted' })
  } catch (error) {
    res.status(500).json({ message: error })
  }
})

// patching one
router.patch('/:id', getProduct, upload.single('image'), async (req, res: iResponse) => {

  if (!res.product) return res.status(500).json({ message: 'product not found' })

  if (req.body.title != null) {
    res.product.title = req.body.title
  }
  if (req.body.category != null) {
    res.product.category = req.body.category
  }
  if (req.body.description != null) {
    res.product.description = req.body.description
  }
  if (req.body.price_in_cents != null) {
    res.product.price_in_cents = req.body.price_in_cents
  }
  if (req.file) {
    res.product.image_url = req.file.path
  }

  try {
    const updatedProduct = await res.product.save()

    res.status(200).json(updatedProduct)
  } catch (error) {
    res.status(500).json({ message: error })
  }
})

module.exports = router;
