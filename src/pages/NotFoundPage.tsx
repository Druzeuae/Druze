import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Logo } from "@/components/common/Logo";

export default function NotFoundPage() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-6 p-6 text-center">
      <Logo size="lg" />
      <div>
        <h1 className="text-3xl font-extrabold text-primary">404</h1>
        <p className="mt-2 text-muted-foreground">This page doesn't exist.</p>
      </div>
      <Button asChild>
        <Link to="/">Go home</Link>
      </Button>
    </div>
  );
}
