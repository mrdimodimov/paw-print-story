import BrandLogo from "@/components/BrandLogo";
import { useNavigate } from "react-router-dom";
import { useEffect } from "react";
import { Heart } from "lucide-react";
import { BRAND } from "@/lib/brand";

const TermsOfService = () => {
  const navigate = useNavigate();

  useEffect(() => {
    document.title = "Terms of Service | VellumPet";
    window.scrollTo(0, 0);
  }, []);

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b border-border/50">
        <div className="tribute-container flex items-center justify-between py-4">
          <BrandLogo size="sm" onClick={() => navigate("/")} />
        </div>
      </header>

      <article className="tribute-section">
        <div className="tribute-container max-w-2xl">
          <h1 className="mb-8 text-3xl font-bold text-foreground md:text-4xl">Terms of Service</h1>
          <p className="mb-6 text-sm text-muted-foreground">Last updated: March 19, 2026</p>

          <section className="mb-10">
            <h2 className="mb-3 text-xl font-semibold text-foreground">Overview</h2>
            <p className="text-foreground/90 leading-relaxed">
              VellumPet is a service that helps you create memorial tributes for your pets. By using VellumPet, you agree to the following terms. They're written to be clear and fair.
            </p>
          </section>

          <section className="mb-10">
            <h2 className="mb-3 text-xl font-semibold text-foreground">Use of Service</h2>
            <p className="text-foreground/90 leading-relaxed">
              You agree to use VellumPet for its intended purpose — creating pet memorial tributes. Please don't submit harmful, offensive, or illegal content. We reserve the right to remove content that violates this.
            </p>
          </section>

          <section className="mb-10">
            <h2 className="mb-3 text-xl font-semibold text-foreground">Content Ownership</h2>
            <p className="text-foreground/90 leading-relaxed">
              You own the memories, stories, and photos you provide. By using VellumPet, you give us permission to process your content in order to generate your tribute. We won't use your content for anything else.
            </p>
          </section>

          <section className="mb-10">
            <h2 className="mb-3 text-xl font-semibold text-foreground">Payments</h2>
            <p className="text-foreground/90 leading-relaxed">
              VellumPet offers one-time payments for premium tribute features. There are no subscriptions or recurring charges. All payments are processed securely through Stripe.
            </p>
          </section>

          <section className="mb-10">
            <h2 className="mb-3 text-xl font-semibold text-foreground">Refunds</h2>
            <p className="text-foreground/90 leading-relaxed">
              If you're not happy with your tribute, you can request a full refund within 7 days of purchase. Just reach out to us and we'll take care of it — no complicated process.
            </p>
          </section>

          <section className="mb-10">
            <h2 className="mb-3 text-xl font-semibold text-foreground">Availability</h2>
            <p className="text-foreground/90 leading-relaxed">
              We work hard to keep VellumPet running smoothly, but we can't guarantee uninterrupted access at all times. The service may change or improve over time as we continue to make it better.
            </p>
          </section>

          <section className="mb-10">
            <h2 className="mb-3 text-xl font-semibold text-foreground">Limitation of Liability</h2>
            <p className="text-foreground/90 leading-relaxed">
              VellumPet is provided "as is." We do our best to deliver a meaningful experience, but we're not liable for any indirect or incidental damages arising from your use of the service.
            </p>
          </section>

          <section className="mb-10">
            <h2 className="mb-3 text-xl font-semibold text-foreground">Public Tributes</h2>
            <p className="text-foreground/90 leading-relaxed">
              If you choose to make your tribute public, it will be accessible via a shared link. You can change this setting at any time. By default, tributes are private.
            </p>
          </section>

          <section className="mb-10">
            <h2 className="mb-3 text-xl font-semibold text-foreground">Changes to These Terms</h2>
            <p className="text-foreground/90 leading-relaxed">
              We may update these terms from time to time. If we make significant changes, we'll do our best to let you know. Continued use of VellumPet after changes means you accept the updated terms.
            </p>
          </section>

          <section className="mb-10">
            <h2 className="mb-3 text-xl font-semibold text-foreground">Contact Us</h2>
            <p className="text-foreground/90 leading-relaxed">
              Questions? Reach out at{" "}
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

export default TermsOfService;