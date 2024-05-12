import express, { NextFunction, Request } from 'express';
import bcrypt from 'bcrypt'
import nodemailer from 'nodemailer';


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

function makePass(length: number) {
  let result = '';
  const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  const charactersLength = characters.length;
  let counter = 0;
  while (counter < length) {
    result += characters.charAt(Math.floor(Math.random() * charactersLength));
    counter += 1;
  }
  return result;
}


const transporter = nodemailer.createTransport({
  service: 'Gmail',
  auth: {
    user: 'lcberaldo@gmail.com',
    pass: 'xqtl rmhr tkbd yjsx'
  },
});


router.get('/confirmation/:token', async (req, res: iUserResponse) => {

  const token = req.params.token
  const users = await User.find()

  const user = users.filter((e) => bcrypt.compareSync(e.id, token))

  if (!user[0]) return res.status(500).json({ message: 'user not found' })
  if (user[0].status === true) return res.status(404).json({ message: 'expired link' })

  user[0].status = true

  try {
    await user[0].save()
    res.redirect('http://localhost:3001/login');
  } catch (e) {
    res.status(500).json({ message: e });
  } finally {
  }
});

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
  const pass = makePass(10)
  var hash = bcrypt.hashSync(pass, 8);

  const user = new User({
    name: req.body.name,
    user: req.body.user,
    password: hash,
    email: req.body.email,
    permission: req.body.permission,
    todos: [],
    status: false
  })

  try {
    const newUser = await user.save()

    const token = bcrypt.hashSync(newUser.id, 12)

    const url = `http://localhost:3000/users/confirmation/${token}`;


    await transporter.sendMail({
      to: user.email,
      subject: 'Welcome Email',
      html: `Welcome ${user.name}: </br></br> Your password is <b>${pass}</b> </br></br> Please save your pass and click this link to confirm your email: </br>  <a href="${url}">${url}</a> `,
    });

    res.status(201).json({ message: 'mail sent' })

  } catch (error) {
    res.status(500).json({ message: error })
  }
})

// deleting one
router.delete('/:id', getUser, async (req, res: iUserResponse) => {
  try {
    await res.user?.deleteOne()
    // await User.deleteMany() -- delete all
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
