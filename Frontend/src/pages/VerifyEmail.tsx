import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import axios from "axios";

import api from "../services/api"; // <-- apne axios instance ka path check kar lena

export default function VerifyEmail() {
  const { token } = useParams();
  const navigate = useNavigate();

  const [status, setStatus] = useState<"loading" | "success" | "error">(
    "loading",
  );
  const [message, setMessage] = useState("Verifying your email...");

  useEffect(() => {
    if (!token) {
      setStatus("error");
      setMessage("Verification token is missing.");
      return;
    }

    const verifyEmail = async () => {
      try {
        const res = await api.get(`/auth/verify/${token}`);

        setStatus("success");
        setMessage(
          res.data.message || "Email verified successfully!",
        );

        setTimeout(() => {
          navigate("/login");
        }, 2500);
      } catch (err: unknown) {
        setStatus("error");

        if (axios.isAxiosError(err)) {
          setMessage(
            err.response?.data?.message ??
              "Verification link is invalid or expired.",
          );
        } else {
          setMessage("Something went wrong.");
        }
      }
    };

    verifyEmail();
  }, [token, navigate]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#0f0f0f] text-white px-4">
      <div className="bg-[#1a1a1a] rounded-xl p-8 w-full max-w-md text-center shadow-xl">
        <h1 className="text-3xl font-bold mb-4">
          Email Verification
        </h1>

        {status === "loading" && (
          <div className="space-y-4">
            <div className="w-12 h-12 border-4 border-red-500 border-t-transparent rounded-full animate-spin mx-auto"></div>
            <p>{message}</p>
          </div>
        )}

        {status === "success" && (
          <div className="space-y-4">
            <div className="text-6xl">✅</div>
            <p className="text-green-400">{message}</p>
            <p className="text-gray-400 text-sm">
              Redirecting to login...
            </p>
          </div>
        )}

        {status === "error" && (
          <div className="space-y-4">
            <div className="text-6xl">❌</div>
            <p className="text-red-400">{message}</p>

            <button
              onClick={() => navigate("/login")}
              className="mt-4 bg-red-600 hover:bg-red-700 px-5 py-2 rounded-lg transition"
            >
              Go to Login
            </button>
          </div>
        )}
      </div>
    </div>
  );
}