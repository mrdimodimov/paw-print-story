import PawIcon from "@/components/PawIcon";
import { useNavigate, useSearchParams } from "react-router-dom";
import { motion } from "framer-motion";
import { Globe, Link, Check, Copy } from "lucide-react";
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

          // Resolve slug from DB if not in URL
          if (!slug && data.tributeId) {
            const { data: tribute } = await supabase
              .from("tributes")
              .select("slug")
              .eq("id", data.tributeId)
              .single();
            if (tribute?.slug) setResolvedSlug(tribute.slug);
          }
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
  }, [sessionId, slug, navigate]);

  const memorialUrl = resolvedSlug
    ? `${window.location.origin}/memorial/${resolvedSlug}`
    : `${window.location.origin}/tribute/${resolvedTributeId}`;

  const handleCopyLink = () => {
    navigator.clipboard.writeText(memorialUrl);
    setCopied(true);
    toast.success("Link copied!");
    setTimeout(() => setCopied(false), 2000);
  };

  const handleViewPage = () => {
    if (resolvedSlug) {
      navigate(`/memorial/${resolvedSlug}`);
    } else {
      navigate(`/tribute/${resolvedTributeId}`);
    }
  };

  if (verifying) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center bg-background px-4">
        <motion.div
          animate={{ scale: [1, 1.15, 1] }}
          transition={{ repeat: Infinity, duration: 1.5 }}
          className="mb-6 rounded-full bg-accent p-6"
        >
          <PawIcon className="h-10 w-10 text-primary" />
        </motion.div>
        <p className="font-display text-xl text-foreground">Verifying your payment…</p>
        <p className="mt-2 text-sm text-muted-foreground">This will only take a moment.</p>
      </div>
    );
  }

  if (!paid) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center bg-background px-4">
        <div className="w-full max-w-md rounded-2xl border border-border bg-card p-8 text-center shadow-card md:p-10">
          <PawIcon className="mx-auto mb-4 h-8 w-8 text-muted-foreground" />
          <h1 className="font-display text-xl font-semibold text-foreground">
            Payment not confirmed
          </h1>
          <p className="mt-2 text-sm text-muted-foreground">
            If you completed the payment, it may take a moment to process. If the issue persists, please contact support.
          </p>
          <Button className="mt-6" onClick={() => navigate("/")}>
            Return Home
          </Button>
        </div>
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
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
          className="mx-auto mb-5 flex h-16 w-16 items-center justify-center rounded-full bg-accent"
        >
          <PawIcon className="h-8 w-8 text-primary" />
        </motion.div>

        <h1 className="font-display text-2xl font-bold text-foreground md:text-3xl">
          Your memorial page is ready to share
        </h1>
        <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
          Your full tribute is now unlocked. Share it with family and friends so they can visit, react, and leave their own memories.
        </p>

        <div className="mt-8 space-y-3">
          <Button
            size="lg"
            className="w-full gap-2 text-base"
            onClick={handleCopyLink}
          >
            {copied ? (
              <><Check className="h-5 w-5" /> Copied!</>
            ) : (
              <><Copy className="h-5 w-5" /> Copy Link</>
            )}
          </Button>

          <Button
            variant="outline"
            size="lg"
            className="w-full gap-2"
            onClick={handleViewPage}
          >
            <Globe className="h-5 w-5" /> View Page
          </Button>
        </div>

        <p className="mt-6 text-xs text-muted-foreground/60">
          Powered by {BRAND.name}
        </p>
      </motion.div>
    </div>
  );
};

export default PaymentSuccess;
