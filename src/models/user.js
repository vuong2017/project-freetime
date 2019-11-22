import mongoose from "mongoose";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import uniqueValidator from "mongoose-unique-validator";
import uuidv1 from "uuid/v1";
import { userConstants } from "../helpers/constants";
import { validateEmail } from "../helpers/validate";
import { sendMail } from "../helpers/sendMail";

const Schema = mongoose.Schema;

let UserSchema = new Schema(
  {
    role_id: {
      type: Number,
      default: 1,
    },
    api_key: {
      type: String,
      default: null
    },
    reset_password_token: {
      type: String,
      default: null
    },
    reset_password_expires: {
      type: Number,
      default: 0
    },
    blance: {
      type: Number,
      default: 0,
    },
    name: {
      type: String,
      required: [true, userConstants.NAME_REQUIRED],
    },
    phone: {
      type: String,
    },
    username: {
      type: String,
      required: [true, userConstants.USERNAME_REQUIRED],
      unique: true,
      minlength: [6, userConstants.USERNAME_MIN_CHARACTERS],
      maxlength: [30, userConstants.USERNAME_MAX_CHARACTERS],
      trim: true
    },
    password: {
      type: String,
      required: [true, userConstants.PASSWORD_REQUIRED],
      minlength: [6, userConstants.PASSWORD_MIN_CHARACTERS],
      maxlength: [30, userConstants.PASSWORD_MAX_CHARACTERS]
    },
    email: {
      type: String,
      required: [true, userConstants.EMAIL_REQUIRED],
      unique: true,
      lowercase: true,
      validate: {
        validator: validateEmail,
        message: props => `${userConstants.INVALID_EMAIL} '${props.value}'!`
      }
    },
    is_banned: { type: Boolean, default: false },
    updated_password: { type: String }
  },
  {
    timestamps: true,
    toObject: { versionKey: false }
  }
);

UserSchema.pre("save", function (next) {
  this.api_key = uuidv1();
  this.password = bcrypt.hashSync(this.password, +process.env.SALTROUNDS);
  this.updated_password = new Date(this.createdAt).toISOString();
  next();
});

UserSchema.methods.createToken = function () {
  const token = jwt.sign(
    { _id: mongoose.Types.ObjectId(this._id)},
    process.env.PRIVATEKEY,
    { expiresIn: +process.env.EXPIRESIN }
  );
  return token;
};

UserSchema.methods.checkPassword = function (password) {
  return bcrypt.compareSync(password, this.password);
};

UserSchema.methods.sendMailForgotPassword = async function(host) {
  const token = uuidv1();
  const filter = {
    _id: this._id
  }
  const doc = {
    $set: {
      reset_password_token: token,
      reset_password_expires: Date.now() + 80000,
    }
  }
  await User.updateOne(filter, doc);
  const url = `${host}/reset_password/${token}`
  const mailOptions = {
    from: 'youremail@gmail.com',
    to: this.email,
    subject: userConstants.RESET_PASSWORD,
    html: userConstants.TEXT_SEND_TO_EMAIL(url)
  };
  const transporter = {
    service: 'gmail',
    auth: {
        user: process.env.USER_GMAIL,
        pass: process.env.PASS_GMAIL
    }
  }
  return sendMail({transporter, mailOptions});
};

UserSchema.plugin(uniqueValidator);

const User = mongoose.model("user", UserSchema);
export default User;
