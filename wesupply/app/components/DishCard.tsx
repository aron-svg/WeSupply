import Image, { StaticImageData } from "next/image";

type DishCardProps = {
  image: StaticImageData | string;
  title: string;
  description: string;
};

export default function DishCard({ image, title, description }: DishCardProps) {
  return (
    <div className="flex flex-col overflow-hidden rounded-2xl bg-white shadow-lg transition hover:shadow-xl">
      <div className="relative h-96 w-full">
        <Image
          src={image}
          alt={title}
          fill
          sizes="(max-width: 768px) 100vw, 33vw"
          className="object-cover"
          priority
        />
      </div>
      <div className="flex flex-col gap-2 p-6">
        <h3 className="text-2xl font-semibold text-gray-900">{title}</h3>
        <p className="text-base text-gray-600">{description}</p>
      </div>
    </div>
  );
}
