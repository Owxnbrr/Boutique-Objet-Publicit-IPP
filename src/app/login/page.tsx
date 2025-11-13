import AuthSwitcher from "@/components/AuthSwitcher";

export default function LoginPage() {
  // Le layout enveloppe déjà avec <main className="container">,
  // on rend juste le composant dans la page.
  return <AuthSwitcher mode="login" />;
}
