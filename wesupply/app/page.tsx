import Image from "next/image";
import logo from "@/public/logo.png";
import meals from "@/public/healthy.png";
import StepCard from "@/app/components/StepCard";
import DishCard from "@/app/components/DishCard";
import Salmon from "@/public/salmon.png";
import teriyaki from "@/public/teriyaki.png";
import Pasta from "@/public/pasta.png";

export default function Home() {
  return (
    <div className="flex min-h-screen flex-col bg-zinc-50 font-sans bg-gradient-to-b from-emerald-100 to-white">
      <header className="flex items-center px-10 py-6">
        <Image src={logo} alt="WeSupply logo" width={120} priority />
      </header>

      <main className="flex flex-1 w-full flex-row items-center justify-between px-16">
        <div className="flex w-1/2 flex-col justify-center px-16">
          <h1 className="text-8xl text-black font-bold mb-4">Personalized Meals</h1>
          <p className="text-xl text-black mb-8">
            Personalized recipes tailored to your taste & goals
          </p>
          <button className="cursor-pointer bg-black text-white px-6 py-3 rounded-lg w-fit hover:bg-gray-600 transition">
            Get Started – It’s Free
          </button>
        </div>

        <div className="w-2/5">
          <Image
            src={meals}
            alt="Beautiful dish"
            width={800}
            height={800}
            className="h-full w-full object-cover"
            priority
          />
        </div>
      </main>

      <section className="w-full px-16 pb-16 mt-20">
        <h2 className="text-4xl text-center font-bold text-black mb-4">-How It Works-</h2>
        <p className="text-lg text-center text-black mb-10">
          Create your perfect meal in minutes.
        </p>
        <div className="grid gap-10 md:grid-cols-4">
          <StepCard
            step="1"
            title="Set Your Preferences"
            description="Tell us your dietary goals & habits."
          />
          <StepCard
            step="2"
            title="AI Designs Your Meal"
            description="Our AI creates a unique recipe fit for you"
          />
          <StepCard
            step="3"
            title="Enjoy & Adjust"
            description="View and follow your custom meal plan"
          />
          <StepCard
            step="4"
            title="Enjoy & Track"
            description="Cook, eat, & track your progress"
          />
          
        </div>
      </section>
       <section className="w-full px-16 pb-16 mt-20">
        <h2 className="text-4xl text-center font-bold text-black mb-4">-Delicious AI-Created Dishes-</h2>
        <p className="text-lg text-center text-black mb-10">
          Custom meals made just for you
        </p>
        <div className="grid gap-8 md:grid-cols-3">
          <DishCard
            image={Salmon}
            title="Grilled Salmon with Veggies"
            description="Perfectly balanced & nutritious"
          />
          <DishCard
            image={teriyaki}
            title="Chicken Teriyaki Bowl"
            description="Protein-packed & delicious"
          />
          <DishCard
            image={Pasta}
            title="Mediterranean Pasta"
            description="Fresh ingredients, bold flavors"
          />
        </div>
      </section>
        <section className="w-full px-16 pb-16 mt-20">
        <h2 className="text-4xl text-center font-bold text-black mb-4">-Track Your Progress & Reach Your Goals-</h2>
        <p className="text-lg max-w-[50%] mx-auto text-center text-black mb-10">
          WeSupply doesn't just give you recipes—we help you succeed. 
          Our intelligent tracking system monitors your 
          calorie intake, macronutrients, and progress towards your health goals.
        </p>
        
         <div className="flex w-1/2 flex-col justify-center px-16">
          <h1 className="text-8xl text-black font-bold mb-4">Personalized Meals</h1>
          <p className="text-xl text-black mb-8">
            Personalized recipes tailored to your taste & goals
          </p>
          <button className="cursor-pointer bg-black text-white px-6 py-3 rounded-lg w-fit hover:bg-gray-600 transition">
            Get Started – It’s Free
          </button>
        </div>

        <div className="w-2/5">
          <Image
            src={meals}
            alt="Beautiful dish"
            width={800}
            height={800}
            className="h-full w-full object-cover"
            priority
          />
        </div>
        
      </section>
    </div>
  );
}
