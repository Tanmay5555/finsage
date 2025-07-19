import DashboardLayout from "@/components/layouts/DashboardLayout";
import ReceiptUploader from "@/components/receipt/ReceiptUploader";

export default function ReceiptPage() {
  return (
    <DashboardLayout>
      <div className="space-y-4">
        <h1 className="text-2xl font-bold ">Receipt Scanner</h1>
        <p className="text-muted-foreground">Upload your receipt and extract text using AI.</p>
        <ReceiptUploader />
      </div>
    </DashboardLayout>
  );
}
