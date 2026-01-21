type FeatureItemProps = {
  icon: string;
  title: string;
  description: string;
};

export default function FeatureItem({ icon, title, description }: FeatureItemProps) {
  return (
    <div className="flex gap-4">
      <div className="flex h-16 w-16 flex-shrink-0 items-center justify-center rounded-lg bg-emerald-100 text-2xl">
        {icon}
      </div>
      <div className="flex flex-col gap-1">
        <h3 className="text-lg font-semibold text-gray-900">{title}</h3>
        <p className="text-sm text-gray-600">{description}</p>
      </div>
    </div>
  );
}
