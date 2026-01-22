import { LucideIcon } from "lucide-react";

type FeatureItemProps = {
  icon: LucideIcon;
  title: string;
  description: string;
};

export default function FeatureItem({ icon: Icon, title, description }: FeatureItemProps) {
  return (
    <div className="flex gap-2">
      <div className="flex h-16 w-16 flex-shrink-0 items-center justify-center rounded-lg bg-emerald-100">
        <Icon className="h-8 w-8 text-emerald-600" />
      </div>
      <div className="flex flex-col gap-1">
        <h3 className="text-lg font-semibold text-gray-900">{title}</h3>
        <p className="max-w-xs text-sm text-gray-600">{description}</p>
      </div>
    </div>
  );
}
