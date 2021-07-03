import mongoose from 'mongoose';
import * as config from '../config/user.js';

const refreshTokenSchema = mongoose.Schema({
  token: String,
  expireAt: {
    type: Date,
    default: Date.now,
    expires: config.REFRESH_TOKEN_EXPIRE,
  },
  user: String,
});

export default mongoose.model('RefreshToken', refreshTokenSchema);
