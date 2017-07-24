import jwt from 'jsonwebtoken';
import httpStatus from 'http-status';
import APIError from '../helpers/APIError';
import config from '../../config/config';
import User from '../models/user.model';

function signup(req, res, next) {
  const { email } = req.body;

  User.findOne({ email })
    .then((user) => {
      if (user) {
        throw new APIError('User already exists', httpStatus.UNAUTHORIZED, true);
      }

      const newUser = new User({
        email: req.body.email,
        password: req.body.password
      });

      return newUser.save();
    })
    .then((user) => {
      const token = jwt.sign({
        email: user.email
      }, config.jwtSecret);

      res.json({
        user,
        token
      });
    })
    .catch(e => next(e));
}

function login(req, res, next) {
  const { email, password } = req.body;

  User.findOne({ email })
    .then((user) => {
      if (!user || (user.password !== password)) {
        const err = new APIError('Invalid email or password', httpStatus.UNAUTHORIZED, true);
        return next(err);
      }

      const token = jwt.sign({
        email: user.email
      }, config.jwtSecret);

      return res.json({
        token,
        user
      });
    })
    .catch(e => next(e));
}

function getRandomNumber(req, res) {
  return res.json({
    user: req.user,
    num: Math.random() * 100
  });
}

function me(req, res, next) {
  try {
    if (req.user) {
      res.json(req.user);
    }
  } catch (e) {
    next(e);
  }
}

export default { login, getRandomNumber, signup, me };
