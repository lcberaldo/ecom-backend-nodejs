import express, { NextFunction, Request } from 'express';
import bcrypt from 'bcrypt'

import { iUser, iUserResponse } from '../../@types';
import User from '../models/userSchema';

const router = express.Router();


async function getUser(req: Request, res: iUserResponse, next: NextFunction) {
  let user: iUser | null
  try {
    const id = req.params.id
    user = await User.findById(id)

    if (user === null) {
      return res.status(404).json({ message: 'user not found' })
    }
  } catch (error: any) {
    return res.status(500).json({ message: error.message })
  }

  res.user = user

  next()
}

// get all
router.get('/', async (req, res) => {
  const users = await User.find()
  res.json(users)
})

// getting one
router.get('/:id', getUser, (req, res: iUserResponse) => {
  res.json(res.user)
})

// creating one
router.post('/', async (req, res) => {
  const pass = req.body.password
  var hash = bcrypt.hashSync(pass, 8);

  const user = new User({
    name: req.body.name,
    user: req.body.user,
    password: hash,
    email: req.body.email,
    permission: req.body.permission
  })

  try {
    const newUser = await user.save()
    res.status(201).json(newUser)
  } catch (error) {
    res.status(500).json({ message: error })
  }
})

// deleting one
router.delete('/:id', getUser, async (req, res: iUserResponse) => {
  try {
    await res.user?.deleteOne()
    res.status(200).json({ message: 'user was deleted' })
  } catch (error) {
    res.status(500).json({ message: error })
  }
})

// patching one
router.patch('/:id', getUser, async (req, res: iUserResponse) => {

  if (!res.user) return res.status(500).json({ message: 'user not found' })

  if (req.body.permission != null) {
    res.user.permission = req.body.permission
  }
  if (req.body.password != null) {

    const pass = req.body.password
    const hash = bcrypt.hashSync(pass, 8);

    res.user.password = hash
  }

  try {
    const updatedUser = await res.user.save()
    res.status(200).json(updatedUser)
  } catch (error) {
    res.status(500).json({ message: error })
  }
})

module.exports = router;
