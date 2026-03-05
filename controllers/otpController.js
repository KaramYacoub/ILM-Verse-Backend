const express = require("express");
const path = require("path");
const SQL = require("../models/Connections/SQL-Driver"); // your Sequelize instance
const initModels = require("../models/index"); // path to index.js
const models = initModels(SQL); // initialize models
const bcrypt = require("bcryptjs");
const { admin, teacher, otp } = models;
const { Sequelize } = require("sequelize");

const nodemailer = require("nodemailer");

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: "ilmverse2025@gmail.com",
    pass: "tfcl toag lrbx zkro",
  },
});
function generateOTP() {
  const length = 6;
  const characters =
    "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
  let otp = "";
  for (let i = 0; i < length; i++) {
    const randomIndex = Math.floor(Math.random() * characters.length);
    otp += characters[randomIndex];
  }
  return otp;
}
exports.sendOTP = async (req, res) => {
  try {
    const { email } = req.body;
    const otp_code = generateOTP();

    const isAdmin = await admin.findOne({ where: { email } });
    const isTeacher = await teacher.findOne({ where: { email } });

    let userType = null;
    let name = null;
    if (isAdmin) {
      userType = "admin";
      name = `${isAdmin.first_name} ${isAdmin.last_name}`;
    } else if (isTeacher) {
      userType = "teacher";
      name = `${isTeacher.first_name} ${isTeacher.last_name}`;
    } else {
      return res.status(400).json({
        status: "failure",
        message: "User not found!",
      });
    }

    const otpEntry = await otp.create({
      email,
      otp_code,
      type: userType,
    });

    const htmlContent = `
  <div style="
    font-family: Arial, sans-serif; 
    max-width: 600px; 
    margin: auto; 
    border: 1px solid #fac67a; 
    padding: 30px; 
    background-color: #8a0e31; 
    border-radius: 10px;
    color: #fac67a;
  ">
    <div style="text-align: center;">
      <h2 style="margin-bottom: 15px;">Hello, ${name}</h2>
      <p style="font-size: 20px; margin: 20px 0; font-weight: bold; color: #fac67a;">
        Your One-Time Password (OTP) code is:
      </p>
      <div style="
        font-size: 36px; 
        font-weight: bold; 
        background-color: #fac67a; 
        color: #8a0e31; 
        padding: 15px 25px; 
        border-radius: 12px; 
        display: inline-block; 
        letter-spacing: 8px;
        user-select: all;
      ">
        ${otp_code}
      </div>
      <p style="margin-top: 30px; font-size: 15px; font-weight: 600; color: #fac67a;">
        ⚠️ <strong>Warning:</strong> Do not share this OTP with anyone to keep your account secure.
      </p>
      <p style="font-size: 14px; margin-top: 20px; line-height: 1.5; color: #fac67a;">
        This OTP is valid for 5 minutes. If you did not request this code, please ignore this email or contact our support team immediately.
      </p>
      <hr style="margin: 30px 0; border-color: #fac67a; opacity: 0.3;" />
      <p style="font-size: 13px; opacity: 0.8; text-align: center; color: #fac67a;">
        &copy; 2025 ILM-Verse Technical Team. All rights reserved.
      </p>
    </div>
  </div>
`;

    const mailOptions = {
      from: "ilmverse2025@gmail.com",
      to: email,
      subject: "Your OTP Code from ILM-Verse",
      html: htmlContent,
    };

    await transporter.sendMail(mailOptions);
    console.log(otpEntry.id);
    setTimeout(async () => {
      try {
        await otp.destroy({ where: { id: otpEntry.id } });
        console.log(`OTP for ${email} deleted after 60 seconds.`);
      } catch (err) {
        console.error("Error deleting OTP:", err.message);
      }
    }, 60 * 1000);

    res.status(201).json({
      status: "success",
      message: "OTP sent successfully to your email.",
    });
  } catch (error) {
    res.status(500).json({
      error: error.message,
    });
  }
};
exports.updatePassword = async (req, res) => {
  try {
    const { email, otp_code, newPassword } = req.body;

    const findOTP = await otp.findOne({ where: { email: email } });
    if (!findOTP) {
      return res.status(400).json({
        status: "failure",
        message: "otp expired",
      });
    }
    if (findOTP.otp_code === otp_code) {
      const newHashedPassword = await bcrypt.hash(newPassword, 3);
      if (findOTP.type === "admin") {
        const updatedAdmin = await admin.update(
          { password: newHashedPassword },
          {
            where: {
              email: email,
            },
          }
        );
      } else {
        await teacher.update(
          { password: newHashedPassword },
          {
            where: {
              email: email,
            },
          }
        );
      }
    } else {
      return res.status(400).json({
        status: "failure",
        message: "Wrong OTP",
      });
    }
    res.status(200).json({
      status: "success",
      message: "password changed successfully",
    });
  } catch (error) {
    res.status(500).json({
      error: error.message,
    });
  }
};
