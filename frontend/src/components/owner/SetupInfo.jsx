import { Link } from "react-router-dom";
import {
  Store,
  MapPin,
  Clock,
  Image as ImageIcon,
  ArrowRight,
  PlusCircle,
  CheckCircle2,
} from "lucide-react";

const STEPS = [
  {
    number: 1,
    title: "Restaurant Details",
    description:
      "Create your restaurant profile — name, email, phone, and description.",
    required: true,
    path: "/owner/add-restaurant-details",
    icon: Store,
  },
  {
    number: 2,
    title: "Location Details",
    description:
      "Add your address and GPS coordinates so customers can find you.",
    required: false,
    path: "/owner/add-location-details",
    icon: MapPin,
  },
  {
    number: 3,
    title: "Operation Details",
    description:
      "Set your opening and closing hours so customers know when you're live.",
    required: false,
    path: "/owner/add-operation-details",
    icon: Clock,
  },
  {
    number: 4,
    title: "Branding",
    description: "Upload your restaurant's logo and banner image.",
    required: false,
    path: "/owner/add-branding-details",
    icon: ImageIcon,
  },
];

const StepCard = ({ step }) => {
  const Icon = step.icon;
  return (
    <div className="bg-white border border-gray-200 rounded-2xl p-5 sm:p-6 flex flex-col sm:flex-row sm:items-center gap-4 shadow-sm hover:shadow-md transition-shadow">
      <div className="flex items-center gap-4 flex-1 min-w-0">
        <div className="h-11 w-11 rounded-full bg-orange-500 text-white flex items-center justify-center font-semibold shrink-0">
          {step.number}
        </div>

        <div className="min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="w-7 h-7 rounded-lg bg-orange-50 text-orange-500 flex items-center justify-center shrink-0">
              <Icon size={15} />
            </span>
            <h3 className="text-base font-semibold text-gray-900">
              {step.title}
            </h3>
            <span
              className={`text-[11px] font-semibold px-2 py-0.5 rounded-full ${
                step.required
                  ? "bg-orange-100 text-orange-700"
                  : "bg-gray-100 text-gray-500"
              }`}
            >
              {step.required ? "Required" : "Optional"}
            </span>
          </div>
          <p className="text-sm text-gray-500 mt-1">{step.description}</p>
        </div>
      </div>

      <Link
        to={step.path}
        className="flex items-center justify-center gap-2 bg-orange-50 hover:bg-orange-100 text-orange-600 text-sm font-semibold px-4 py-2.5 rounded-xl transition-colors whitespace-nowrap shrink-0"
      >
        Go to step
        <ArrowRight size={15} />
      </Link>
    </div>
  );
};

export default function SetupInfo() {
  return (
    <div className="w-full flex items-center justify-center px-4 py-8">
      <div className="w-full max-w-3xl bg-white shadow-xl rounded-3xl p-8 border border-gray-100">
        {/* Header */}
        <div className="mb-8 text-center">
          <h1 className="text-3xl font-bold text-gray-900">
            Restaurant Setup
          </h1>
          <p className="text-gray-500 mt-2">
            Complete these steps to get your restaurant live and accepting
            orders.
          </p>
        </div>

        {/* Add new restaurant CTA */}
        <div className="bg-orange-500 rounded-2xl p-6 mb-8 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h2 className="text-white text-lg font-semibold">
              Setting up a new restaurant?
            </h2>
            <p className="text-orange-50 text-sm mt-1">
              Start fresh with the restaurant details step.
            </p>
          </div>
          <Link
            to={STEPS[0].path}
            className="flex items-center justify-center gap-2 bg-white text-orange-600 font-semibold text-sm px-5 py-3 rounded-xl hover:bg-orange-50 transition-colors whitespace-nowrap"
          >
            <PlusCircle size={16} />
            Add New Restaurant
          </Link>
        </div>

        {/* Steps list */}
        <div className="mb-2">
          <h2 className="text-sm font-semibold text-gray-400 uppercase tracking-wider mb-4">
            Setup Steps
          </h2>
          <div className="flex flex-col gap-4">
            {STEPS.map((step) => (
              <StepCard key={step.number} step={step} />
            ))}
          </div>
        </div>

        {/* Info note */}
        <div className="mt-8 bg-gray-50 border border-gray-200 rounded-2xl p-4 flex items-start gap-3">
          <CheckCircle2 size={18} className="text-orange-500 mt-0.5 shrink-0" />
          <p className="text-sm text-gray-500">
            Only <span className="font-semibold text-gray-700">Restaurant Details</span>{" "}
            is required to start. You can complete Location, Operation, and
            Branding details any time — jump into any step above to pick up
            where you left off.
          </p>
        </div>
      </div>
    </div>
  );
}