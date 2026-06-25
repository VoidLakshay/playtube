import crypto
from "crypto";

import prisma
from "../lib/prisma.js";

import transporter
from "../config/nodemailer.js";



const sendVerificationEmail =
async (

  userId: string,

  email: string

) => {

  console.log(
    "verification email function running"
  );

  // ======================================
  // GENERATE TOKEN
  // ======================================

  const verifyToken =
    crypto.randomBytes(32)
    .toString("hex");

 
  // ======================================
  // SAVE TOKEN
  // ======================================

  await prisma.user.update({

    where: {
      id: userId,
    },

    data: {

      emailVerifyToken:
        verifyToken,

      emailVerifyExpiry:
        new Date(
          Date.now() +
          1000 * 60 * 60
        ),
    },
  });

 
  // ======================================
  // VERIFY URL
  // ======================================

  const verifyUrl =
    `${process.env.FRONTEND_URL || "http://localhost:5173"}/verify/${verifyToken}`;
// console.log("VERIFY URL:", verifyUrl);
  // ======================================
  // SEND EMAIL
  // ======================================
const info = await transporter.sendMail({
  from: process.env.EMAIL_USER,
  to: email,
  subject: "Verify your email",
  html: `
    <h2>Verify Your Email</h2>
    <p>Click below to verify your account.</p>
    <a href="${verifyUrl}">Verify Email</a>
  `,
});



}; 

export default sendVerificationEmail;