import { Suspense } from "react";
import { Loader2 } from "lucide-react";
import OrdersPageContent from "./OrdersPageContent";

export default function OrdersPage() {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-[40vh] items-center justify-center text-[#8b5e34]">
          <Loader2 className="h-8 w-8 animate-spin" />
        </div>
      }
    >
      <OrdersPageContent />
    </Suspense>
  );
}
