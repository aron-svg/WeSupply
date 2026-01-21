type StepCardProps = {
  step: string;
  title: string;
  description: string;
};

export default function StepCard({ step, title, description }: StepCardProps) {
  return (
    <div className="flex flex-col items-center text-center gap-4">
      <div className="flex h-24 w-24 items-center justify-center rounded-full bg-emerald-100 text-3xl font-medium text-emerald-700">
        {step}
      </div>
      <div className="space-y-2">
        <h3 className="text-xl font-semibold text-gray-900">{title}</h3>
        <p className="text-lg text-gray-600">{description}</p>
      </div>
    </div>
  );
}
