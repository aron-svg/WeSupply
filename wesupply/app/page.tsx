import Image from "next/image";
import Link from "next/link";
import logo from "@/public/logo.png";
import meals from "@/public/healthy.png";
import StepCard from "@/app/components/StepCard";
import DishCard from "@/app/components/DishCard";
import FeatureItem from "@/app/components/FeatureItem";
import CalorieTracker from "@/app/components/CalorieTracker";
import BudgetTracker from "@/app/components/BudgetTracker";
import Salmon from "@/public/salmon.png";
import teriyaki from "@/public/teriyaki.png";
import Pasta from "@/public/pasta.png";
import { Activity, Target, BarChart3, TrendingUp, Wallet, DollarSign, PiggyBank, ShoppingCart } from "lucide-react";

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
          <Link href="/login/create" className="cursor-pointer bg-black text-white px-6 py-3 rounded-lg w-fit hover:bg-gray-600 transition">
            Get Started – It's Free
          </Link>
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
        
        <div className="flex w-full">
          <div className="flex-1 flex justify-center">
            <div className="grid gap-0 md:grid-cols-1">
              <FeatureItem
                icon={Activity}
                title="Automatic Calorie Tracking"
                description="Every meal comes with precise nutritional information. We automatically calculate your daily intake and help you stay within your target range."
              />
              <FeatureItem
                icon={Target}
                title="Personalized Goals"
                description="Whether you're trying to lose weight, build muscle, or maintain a healthy lifestyle, we adjust portion sizes and ingredients to match your objectives."
              />
              <FeatureItem
                icon={BarChart3}
                title="Visual Progress Reports"
                description="See your journey come to life with detailed charts showing calories consumed, macros balanced, and milestones achieved over time."
              />
              <FeatureItem
                icon={TrendingUp}
                title="Smart Recommendations"
                description="Our AI learns from your eating patterns and suggests adjustments to help you reach your goals faster and more sustainably."
              />
            </div>
          </div>
          
          <div className="flex-1 flex justify-center">
            <CalorieTracker
              dailyGoal={2000}
              todaysMeals={[
                { name: "Breakfast", calories: 350 },
                { name: "Lunch", calories: 550 },
                { name: "Snack", calories: 880 },
                { name: "Dinner", calories: 80 }
              ]}
            />
          </div>
        </div>
        
        
      </section>
      <section className="w-full px-16 pb-16 mt-20">
        <h2 className="text-4xl text-center font-bold text-black mb-4">-Stay Within Your Budget-</h2>
        <p className="text-lg max-w-[50%] mx-auto text-center text-black mb-10">
         Healthy eating shouldn't break the bank. WeSupply helps you track
          your grocery spending and optimizes your meal
          plans to respect your budget while maintaining nutritional value.
        </p>
        
        <div className="flex w-full">
          <div className="flex-1 flex justify-center">
            <BudgetTracker
              weeklyBudget={75.00}
              items={[
                { name: "Salmon Fillet", details: "2 portions • $6.50/lb", price: 20.00 },
                { name: "Organic Chicken", details: "1.5 lbs • $5.99/lb", price: 8.99 },
                { name: "Quinoa", details: "2 cups • Bulk", price: 4.50 },
               
                { name: "Fresh Fruits", details: "Berries, Avocado, Lemon", price: 10.25 }
              ]}
              taxRate={0.05}
            />
          </div>
          
          <div className="flex-1 flex justify-center">
            <div className="grid gap-0 md:grid-cols-1">
              <FeatureItem
                icon={Wallet}
                title="Smart Budget Management"
                description="Set your weekly or monthly food budget, and we'll create meal plans that fit perfectly within your financial constraints."
              />
              <FeatureItem
                icon={DollarSign}
                title="Cost-Per-Meal Breakdown"
                description="See exactly how much each meal costs. We break down ingredient prices so you always know where your money goes."
              />
              <FeatureItem
                icon={PiggyBank}
                title="Budget Optimization"
                description="Our AI suggests ingredient substitutions and seasonal alternatives to help you save money without compromising nutrition or taste."
              />
              <FeatureItem
                icon={ShoppingCart}
                title="Shopping List Generator"
                description="Get organized shopping lists with estimated costs, helping you plan your grocery trips and avoid overspending."
              />
            </div>
          </div>
        </div>
        
        
      </section>

      <section className="w-full px-16 pb-16 mt-20">
        <div className="flex flex-col items-center justify-center text-center">
          <Image
            src={logo}
            alt="WeSupply logo"
            width={150}
            height={150}
            className="mb-6"
          />
          <h2 className="text-4xl font-bold text-black mb-4">
            Your Journey to Better Eating Starts Here
          </h2>
          <p className="text-lg text-black max-w-2xl mb-8">
            Join thousands of users who have transformed their health with personalized meal plans. 
            Start your free trial today and discover how AI can revolutionize your nutrition.
          </p>
          <Link href="/login/create" className="cursor-pointer bg-black text-white px-8 py-4 rounded-lg text-lg hover:bg-gray-600 transition">
            Get Started – It's Free
          </Link>
        </div>
      </section>
    </div>
  );
}
