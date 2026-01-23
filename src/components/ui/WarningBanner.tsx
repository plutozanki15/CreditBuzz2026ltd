import { AlertTriangle } from "lucide-react";

export const WarningBanner = () => {
  return (
    <div className="warning-banner flex items-center justify-center gap-2">
      <AlertTriangle className="w-4 h-4 text-violet" />
      <span className="text-foreground/90">
        <span className="text-violet font-semibold">Official ZenFi</span>
        {" — Only valid on "}
        <span className="text-teal font-medium">www.ZenFi.com</span>
        {". Any other version is fake and must be reported immediately."}
      </span>
    </div>
  );
};
