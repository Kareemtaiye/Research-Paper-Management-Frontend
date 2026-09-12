// services/auth.ts

import { useAuth } from "@/context/AuthContext";
import { useToast } from "@/context/ToastContext";
import { toastApiError } from "@/utils/apiError";
import axios from "axios";

const BASE_API_URL = import.meta.env.VITE_API_URL;

export function VerifyBanner() {
  const { toast } = useToast();
  const { user } = useAuth();

  const accessToken = localStorage.getItem("access_token");

  async function resendVerification(email?: string) {
    try {
      await axios.post(
        `${BASE_API_URL}/auth/resend-verification`,
        { email },
        {
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
        },
      );

      toast("Verification email sent", "success");
    } catch (err) {
      toastApiError(err, toast, "Failed to resend verification email");
    } finally {
    }
  }

  return user && !user.email_verified ? (
    <div
      style={{
        background: "rgba(245,158,11,0.08)",
        border: "0.5px solid rgba(245,158,11,0.2)",
        padding: "8px 20px",
        fontSize: 12,
        color: "#fbbf24",
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
      }}
    >
      <span>⚠ Your email is not verified. Some features may be limited.</span>
      <button
        onClick={() => resendVerification(user.email)}
        style={{
          color: "#fbbf24",
          background: "none",
          border: "none",
          fontSize: 12,
          cursor: "pointer",
          textDecoration: "underline",
        }}
      >
        Resend verification email
      </button>
    </div>
  ) : (
    <></>
  );
}
//   {
//     user && !user.email_verified && (
//       <div
//         style={{
//           background: "rgba(245,158,11,0.08)",
//           border: "0.5px solid rgba(245,158,11,0.2)",
//           padding: "8px 20px",
//           fontSize: 12,
//           color: "#fbbf24",
//           display: "flex",
//           alignItems: "center",
//           justifyContent: "space-between",
//         }}
//       >
//         <span>⚠ Your email is not verified. Some features may be limited.</span>
//         <button
//           onClick={() => resendVerification(user.email)}
//           style={{
//             color: "#fbbf24",
//             background: "none",
//             border: "none",
//             fontSize: 12,
//             cursor: "pointer",
//             textDecoration: "underline",
//           }}
//         >
//           Resend verification email
//         </button>
//       </div>
//     );
//   }
// }
