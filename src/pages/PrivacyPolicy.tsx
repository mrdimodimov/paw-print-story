import BrandLogo from "@/components/BrandLogo";
import { useNavigate } from "react-router-dom";
import { useEffect } from "react";
import { Heart } from "lucide-react";
import { BRAND } from "@/lib/brand";

const PrivacyPolicy = () => {
  const navigate = useNavigate();

  useEffect(() => {
    document.title = "Privacy Policy | VellumPet";
    window.scrollTo(0, 0);
  }, []);

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b border-border/50">
        <div className="tribute-container flex items-center justify-between py-4">
          <button
            onClick={() => navigate("/")}
            className="flex items-center gap-2 hover:opacity-80 transition-opacity">
            
            <PawIcon className="h-6 w-6 text-primary" />
            <span className="font-display text-xl font-semibold text-foreground">
              {BRAND.name}
            </span>
          </button>
        </div>
      </header>

      <article className="tribute-section">
        <div className="tribute-container max-w-2xl">
          <h1 className="mb-8 text-3xl font-bold text-foreground md:text-4xl">Privacy Policy</h1>
          <p className="mb-6 text-sm text-muted-foreground">Last updated: March 19, 2026</p>

          <section className="mb-10">
            <h2 className="mb-3 text-xl font-semibold text-foreground">Introduction</h2>
            <p className="text-foreground/90 leading-relaxed">
              VellumPet helps you create beautiful memorial tributes for the pets you've loved. This policy explains what information we collect, how we use it, and how we keep it safe. We believe in being straightforward — no complicated legal language, just honest answers.
            </p>
          </section>

          <section className="mb-10">
            <h2 className="mb-3 text-xl font-semibold text-foreground">Information We Collect</h2>
            <ul className="list-disc pl-6 space-y-2 text-foreground/90 leading-relaxed">
              <li>Pet details and memories you share with us (name, breed, stories, personality traits)</li>
              <li>Photos you upload of your pet</li>
              <li>Your email address, if you choose to provide it</li>
              <li>Basic usage data to help us understand how people use the site</li>
            </ul>
          </section>

          <section className="mb-10">
            <h2 className="mb-3 text-xl font-semibold text-foreground">How We Use Your Information</h2>
            <p className="mb-3 text-foreground/90 leading-relaxed">We use the information you provide to:</p>
            <ul className="list-disc pl-6 space-y-2 text-foreground/90 leading-relaxed">
              <li>Generate your pet's tribute story</li>
              <li>Create memorial pages and downloadable PDFs</li>
              <li>Send you your tribute via email, if requested</li>
              <li>Improve the overall product experience</li>
            </ul>
          </section>

          <section className="mb-10">
            <h2 className="mb-3 text-xl font-semibold text-foreground">Your Memories Are Private</h2>
            <p className="rounded-lg border border-primary/20 bg-primary/5 p-4 text-foreground/90 leading-relaxed font-medium">
              Your memories are private and never used for AI training. The stories and photos you share are used only to create your tribute — nothing more.
            </p>
          </section>

          <section className="mb-10">
            <h2 className="mb-3 text-xl font-semibold text-foreground">Sharing</h2>
            <p className="text-foreground/90 leading-relaxed">
              We do not sell your personal data to anyone. If you choose to make your tribute public, it will be visible to others via a shared link. Private tributes remain private.
            </p>
          </section>

          <section className="mb-10">
            <h2 className="mb-3 text-xl font-semibold text-foreground">Data Storage</h2>
            <p className="text-foreground/90 leading-relaxed">
              Your data is stored securely using industry-standard protection measures. We take reasonable steps to keep your information safe from unauthorized access.
            </p>
          </section>

          <section className="mb-10">
            <h2 className="mb-3 text-xl font-semibold text-foreground">Payments</h2>
            <p className="text-foreground/90 leading-relaxed">
              All payments are processed securely through Stripe. VellumPet does not store your credit card details — Stripe handles all payment information directly.
            </p>
          </section>

          <section className="mb-10">
            <h2 className="mb-3 text-xl font-semibold text-foreground">Your Control</h2>
            <p className="text-foreground/90 leading-relaxed">
              You can request the deletion of your data at any time by contacting us. We'll remove your tribute, photos, and any associated information.
            </p>
          </section>

          <section className="mb-10">
            <h2 className="mb-3 text-xl font-semibold text-foreground">Contact Us</h2>
            <p className="text-foreground/90 leading-relaxed">
              If you have any questions about this policy, reach out to us at{" "}
              <a className="text-primary underline hover:opacity-80" href="mailto:hello@vellumpet.com">
                hello@vellumpet.com
              </a>.
            </p>
          </section>
        </div>
      </article>

      <footer className="border-t border-border/50 py-8 text-center text-sm text-muted-foreground">
        <div className="tribute-container">
          <p>Made with <Heart className="inline h-3 w-3 text-primary" /> by {BRAND.name}</p>
        </div>
      </footer>
    </div>);

};

export default PrivacyPolicy;