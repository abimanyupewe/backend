import jwt from "jsonwebtoken";
import userModel from "../models/userModels.js";
import validator from "validator";
import bcrypt from "bcrypt";

const createToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET);
};

const loginUser = async (req, res) => {try {
    const { email, password } = req.body;
    const user = await userModel.findOne({ email });
    if (!user) {
      // jika user tidak ditemukan
      return res.json({ success: false, message: "User doesn't exists" });
    }

    // mencocokan passowrd yang sudah berbentuk hash dari register
    const isMatch = await bcrypt.compare(password, user.password);

    if (isMatch) {
      // akan di generate ulang token yang di inputkan user dan nanti akan dibandingkan dengan token yang sudah ada dalam db regsiter
      const token = createToken(user._id);
      res.json({ success: true, token });
    } else {
      res.json({ success: false, message: "Invalid credentials" });
    }
  } catch (error) {
    console.log(error);
    res.json({ success: false, message: error.message });
  }
};

const registerUser = async (req, res) => {
  try {
    const { name, email, password } = req.body;

    const exists = await userModel.findOne({ email });

    // check user
    if (exists) {
      return res.json({ success: false, message: "User already exists" });
    }

    if (!validator.isEmail(email)) {
      return res.json({
        success: false,
        message: "Invalid email format, please enter a valid email",
      });
    }

    if (password.length < 8) {
      return res.json({
        success: false,
        message: "Password must be at least 8 characters long",
      });
    }

    // Password must contain at least one uppercase letter
    if (!/[A-Z]/.test(password)) {
      return res.json({
        success: false,
        message: "Password must contain at least one uppercase letter",
      });
    }

    // Password must contain at least one special character
    if (!/[!@#$%^&*(),.?":{}|<>]/.test(password)) {
      return res.json({
        success: false,
        message: "Password must contain at least one special character",
      });
    }

    // hashed password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const newUser = new userModel({
      name,
      email,
      password: hashedPassword,
    });

    const user = await newUser.save();
    // create token
    const token = createToken(user._id);

    // debug
    res.json({
      success: true,
      message: "User registered successfully",
      token,
    });
  } catch (error) {
    console.log(error);
    res.json({
      success: false,
      message: error.message,
    });
  }
};

export { loginUser, registerUser };
