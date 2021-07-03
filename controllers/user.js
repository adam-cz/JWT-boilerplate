import 'dotenv/config.js';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';

import User from '../models/user.js';
import RefreshTokens from '../models/refreshToken.js';
import * as config from '../config/user.js';

//helper function
const _generateAccessToken = (userData) => {
  return jwt.sign(userData, process.env.ACCESS_TOKEN_SECRET, {
    expiresIn: config.ACCESS_TOKEN_EXPIRE,
  });
};

/*
/ REGISTER function
*/

export const signUp = async (req, res) => {
  const { username, password } = req.body;

  //Check if user doesnt exists
  try {
    const userExists = await User.findOne({ username });
    if (userExists)
      return res.status(401).json({ message: 'User already exists' });

    //Create user and hash password
    const hashedPassword = await bcrypt.hash(password, 10);
    const user = await User.create({
      username,
      password: hashedPassword,
    });
    console.log(user);
    //Generate access and refresh token, save refresh token in database
    const accessToken = _generateAccessToken({ username: user.username });
    const refreshToken = jwt.sign(
      { username: user.username },
      process.env.REFRESH_TOKEN_SECRET
    );
    await RefreshTokens.create({
      token: refreshToken,
      username: user.username,
    });

    //Response - set credentials in httponly cookies and send user details
    res
      .status(201)
      .cookie('jwt_token', accessToken, {
        expires: new Date(Date.now() + config.ACCESS_TOKEN_EXPIRE),
        httpOnly: true,
      })
      .cookie('refresh_token', refreshToken, { httpOnly: true })
      .json({
        username: user.username,
        expiresIn: config.ACCESS_TOKEN_EXPIRE - 1000,
      });
  } catch (err) {
    res.status(500).json({ message: err });
  }
};

/*
/ LOGIN function
*/

export const signIn = async (req, res) => {
  const { username, password } = req.body;
  try {
    //Fetch user, if doesnt exists - 401 status
    const user = await User.findOne({ username }).lean();
    if (!user) return res.status(401).json({ message: 'User doesnt exists' });

    //check password, if invalid - 401 status
    const isPasswordCorrect = await bcrypt.compare(password, user.password);
    if (!isPasswordCorrect)
      return res.status(401).json({ message: 'Invalid credentials' });

    //generate access token with user ID
    const accessToken = _generateAccessToken({ username: user.username });

    //generate refresh token. Expiration date is set automaticly in db
    const refreshToken = jwt.sign(
      { username: user.username },
      process.env.REFRESH_TOKEN_SECRET
    );
    await RefreshTokens.create({
      token: refreshToken,
      user: user.username,
    });

    //response - set status, access and refresh httponly cookie and send user data to frontend
    res
      .status(201)
      .cookie('jwt_token', accessToken, {
        expires: new Date(Date.now() + config.ACCESS_TOKEN_EXPIRE),
        httpOnly: true,
      })
      .cookie('refresh_token', refreshToken, { httpOnly: true })
      .json({
        username: user.username,
        expiresIn: config.ACCESS_TOKEN_EXPIRE - 1000,
      });
  } catch (err) {
    res.status(500).json({ message: err });
  }
};

/*
/ SIGN OUT function
*/

export const signOut = async (req, res) => {
  try {
    //delete refresh token from db and erase cookies
    await RefreshTokens.deleteOne({ token: req.cookies.refresh_token });
    res
      .status(204)
      .cookie('jwt_token', { expires: Date.now() })
      .cookie('refresh_token', { expires: Date.now() });
  } catch (err) {
    res.json({ message: err });
  }
};

/*
/ Refresh token function
/ - also used for silent login
*/

export const refreshToken = async (req, res) => {
  let refreshToken = req.cookies.refresh_token;
  if (refreshToken == null) return res.sendStatus(401);

  //chceck for refresh token in database and if exists, verify and decode
  if (!(await RefreshTokens.findOne({ token: refreshToken })))
    return res.sendStatus(401);
  jwt.verify(
    refreshToken,
    process.env.REFRESH_TOKEN_SECRET,
    async (err, decoded) => {
      if (err) return res.sendStatus(401);

      //find decoded user ID in db and generate new access token
      let user;
      try {
        user = await User.findOne({ username: decoded.username }).lean();

        //Update last manipulation (expireAt) date on current refresh token (automaticly expiring after some time from that date)
        await RefreshTokens.updateOne(
          { token: refreshToken },
          { expireAt: Date.now() }
        );
      } catch (err) {
        return res.sendStatus(401);
      }
      const accessToken = _generateAccessToken({ username: user.username });

      //response - set new access token cookie and send user info
      res
        .cookie('jwt_token', accessToken, {
          expires: new Date(Date.now() + config.ACCESS_TOKEN_EXPIRE),
          httpOnly: true,
        })
        .json({
          username: user.username,
          expiresIn: config.ACCESS_TOKEN_EXPIRE - 1000,
        })
        .status(201);
    }
  );
};
