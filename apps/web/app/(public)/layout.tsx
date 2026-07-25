import { ToastProvider } from "@/components/ui/toast";

export default function PublicLayout({ children }: { children: React.ReactNode }) {
  return (
    <ToastProvider>
      <main className="mx-auto max-w-5xl px-6 py-8">{children}</main>
    </ToastProvider>
  );
}
