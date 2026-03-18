import { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { motion } from "framer-motion";
import { PawPrint, Download, Globe, Link, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { BRAND } from "@/lib/brand";

const PaymentSuccess = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const sessionId = searchParams.get("session_id");
  const slug = searchParams.get("slug");
  const tributeId = searchParams.get("id");

  const [verifying, setVerifying] = useState(true);
  const [paid, setPaid] = useState(false);
  const [copied, setCopied] = useState(false);
  const [resolvedTributeId, setResolvedTributeId] = useState(tributeId || "");
  const [resolvedSlug, setResolvedSlug] = useState(slug || "");

  useEffect(() => {
    if (!sessionId) {
      navigate("/");
      return;
    }

    const verify = async () => {
      try {
        const { data, error } = await supabase.functions.invoke("verify-payment", {
          body: { sessionId },
        });

        if (error) throw error;

        if (data?.paid) {
          setPaid(true);
          if (data.tributeId) setResolvedTributeId(data.tributeId);
          toast.success("Payment confirmed! Your tribute is unlocked 🤍");
        } else {
          toast.error(data?.error || "Payment could not be verified.");
        }
      } catch (err) {
        console.error("Verification error:", err);
        toast.error("Could not verify payment. Please contact support.");
      } finally {
        setVerifying(false);
      }
    };

    verify();
  }, [sessionId, navigate]);

  const handleCopyLink = () => {
    const url = resolvedSlug
      ? `${window.location.origin}/memorial/${resolvedSlug}`
      : `${window.location.origin}/tribute/${resolvedTributeId}`;
    navigator.clipboard.writeText(url);
    setCopied(true);
    toast.success("Link copied!");
    setTimeout(() => setCopied(false), 2000);
  };

  const tributeUrl = resolvedSlug
    ? `/tribute/s/${resolvedSlug}`
    : `/tribute/${resolvedTributeId}`;

  if (verifying) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center bg-background px-4">
        <motion.div
          animate={{ scale: [1, 1.15, 1] }}
          transition={{ repeat: Infinity, duration: 1.5 }}
          className="mb-6 rounded-full bg-accent p-6"
        >
          <PawPrint className="h-10 w-10 text-primary" />
        </motion.div>
        <p className="font-display text-xl text-foreground">Verifying your payment…</p>
        <p className="mt-2 text-sm text-muted-foreground">This will only take a moment.</p>
      </div>
    );
  }

  if (!paid) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center bg-background px-4">
        <p className="font-display text-xl text-foreground">Payment not confirmed</p>
        <p className="mt-2 text-sm text-muted-foreground">
          If you believe this is an error, please contact support.
        </p>
        <Button className="mt-6" onClick={() => navigate("/")}>
          Return Home
        </Button>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-background px-4">
      <motion.div
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-md rounded-2xl border border-border bg-card p-8 text-center shadow-card md:p-10"
      >
        <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-accent">
          <PawPrint className="h-8 w-8 text-primary" />
        </div>

        <h1 className="font-display text-2xl font-bold text-foreground md:text-3xl">
          Your tribute is ready 🤍
        </h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Thank you for honoring your pet's memory. Your full tribute is now unlocked.
        </p>

        <div className="mt-8 space-y-3">
          <Button size="lg" className="w-full text-base" onClick={() => navigate(tributeUrl)}>
            <Globe className="mr-2 h-5 w-5" /> View Tribute Page
          </Button>

          <Button
            variant="outline"
            size="lg"
            className="w-full"
            onClick={handleCopyLink}
          >
            {copied ? (
              <><Check className="mr-2 h-4 w-4" /> Copied!</>
            ) : (
              <><Link className="mr-2 h-4 w-4" /> Copy Link</>
            )}
          </Button>
        </div>

        <p className="mt-6 text-xs text-muted-foreground">
          Powered by {BRAND.name}
        </p>
      </motion.div>
    </div>
  );
};

export default PaymentSuccess;
