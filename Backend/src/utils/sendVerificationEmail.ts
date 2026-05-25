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

  console.log(
    "generated token:",
    verifyToken
  );

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

  console.log(
    "token saved in db"
  );

  // ======================================
  // VERIFY URL
  // ======================================

  const verifyUrl =

    `http://localhost:5000/api/verify/${verifyToken}`;

  // ======================================
  // SEND EMAIL
  // ======================================

  await transporter.sendMail({

    from:
      process.env.EMAIL_USER,

    to: email,

    subject:
      "Verify your email",

    html: `

      <h2>
        Verify Your Email
      </h2>

      <p>
        Click below to verify
        your account:
      </p>

      <a href="${verifyUrl}">
        Verify Email
      </a>
    `,
  });

  console.log(
    "email sent successfully"
  );
};

export default
sendVerificationEmail;