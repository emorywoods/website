import { notFound } from "next/navigation";
import ListingDetail from "./ListingDetail";

const units = {
  "539-webster-unit-1": {
    address: "539 Webster Drive",
    unit: "Unit No. 1",
    city: "Decatur, GA 30033",
    type: "2 Bedroom Apartment",
    badge: "2 BR",
    price: "$1,850 / mo",
    sqft: "1,040 SF",
    bedrooms: 2,
    bathrooms: 1,
    available: "",
    description: "Brand new renovated 2 bedroom apartment located near Emory University. Beautifully renovated interiors with stainless steel appliances, spacious green spaces, and professional management — all within one of Atlanta's most sought-after corridors.",
    features: ["Stainless steel appliances", "Renovated interiors", "Spacious green spaces", "Central HVAC", "Professional maintenance", "Covered carport"],
    nearby: ["Emory University — 5 min", "CDC Headquarters — 7 min", "Emory University Hospital — 4 min", "VA Medical Center — 6 min", "MARTA Transit — 8 min", "I-85 Highway — 10 min"],
    contact: { phone: "(404) 634-3777", email: "leasing@emorywoods.com" },
    image: "/2bedroom_render.png",
    applyUrl: "mailto:leasing@emorywoods.com?subject=Interest%20in%202%20Bedroom%20Renovated%20Apartment&body=Hello,%0A%0AI am interested in starting a rental application for the 2 Bedroom Renovated Apartment at 539 Webster Drive, Unit No. 1, Decatur, GA 30033.%0A%0APlease let me know the next steps to proceed.%0A%0AThank you.",
  },
  "2148-north-decatur-unit-1": {
    address: "2148 North Decatur Road",
    unit: "Unit No. 1",
    city: "Decatur, GA 30033",
    type: "Studio Apartment",
    badge: "Studio",
    price: "$880 / mo",
    sqft: "360 SF",
    bedrooms: 0,
    bathrooms: 1,
    available: "",
    description: "Renovated studio apartment located near Emory University. Efficiently designed for modern living with updated finishes, stainless steel appliances, and easy access to Emory's campus, the CDC, and I-85.",
    features: ["Stainless steel appliances", "Renovated interiors", "Central HVAC", "Professional maintenance", "Community amenities", "On-site parking"],
    nearby: ["Emory University — 5 min", "CDC Headquarters — 7 min", "Emory University Hospital — 4 min", "VA Medical Center — 6 min", "MARTA Transit — 8 min", "I-85 Highway — 10 min"],
    contact: { phone: "(404) 634-3777", email: "leasing@emorywoods.com" },
    image: "/studio_render.png",
    applyUrl: "mailto:leasing@emorywoods.com?subject=Interest%20in%20Studio%20Renovated%20Apartment&body=Hello,%0A%0AI am interested in starting a rental application for the Renovated Studio Apartment at 2148 North Decatur Road, Unit No. 1, Decatur, GA 30033.%0A%0APlease let me know the next steps to proceed.%0A%0AThank you.",
  },
  "551-webster-unit-6": {
    address: "551 Webster Drive",
    unit: "Unit No. 6",
    city: "Decatur, GA 30033",
    type: "3 Bedroom Townhome",
    badge: "3 BR",
    price: "$2,250 / mo",
    sqft: "1,265 SF",
    bedrooms: 3,
    bathrooms: 2,
    available: "",
    description: "Brand new renovated 3 bedroom townhome apartment located near Emory University. Multi-level layout with wooded views, generous living spaces, and premium finishes throughout — ideal for families or shared living.",
    features: ["Multi-level layout", "Wooded views", "Hardwood floors", "Central HVAC", "Professional maintenance", "Covered carport"],
    nearby: ["Emory University — 5 min", "CDC Headquarters — 7 min", "Emory University Hospital — 4 min", "VA Medical Center — 6 min", "MARTA Transit — 8 min", "I-85 Highway — 10 min"],
    contact: { phone: "(404) 634-3777", email: "leasing@emorywoods.com" },
    image: "/3bedroom_render.png",
    applyUrl: "mailto:leasing@emorywoods.com?subject=Interest%20in%203%20Bedroom%20Renovated%20Townhome&body=Hello,%0A%0AI am interested in starting a rental application for the 3 Bedroom Renovated Townhome at 551 Webster Drive, Unit No. 6, Decatur, GA 30033.%0A%0APlease let me know the next steps to proceed.%0A%0AThank you.",
  },
  "2122-powell-unit-5": {
    address: "2122 Powell Lane",
    unit: "Unit No. 5",
    city: "Decatur, GA 30033",
    type: "2 Bedroom Townhome Apartment",
    badge: "2 BR",
    price: "$1,225 / mo",
    sqft: "1,040 SF",
    bedrooms: 2,
    bathrooms: 1,
    available: "",
    description: "Spacious 2 bedroom, 1 bath townhome apartment located near Emory University. Beautifully renovated interiors with stainless steel appliances, spacious green spaces, and the comfort and convenience of professional management — all within one of Atlanta's most sought-after corridors.",
    features: ["Stainless steel appliances", "Renovated interiors", "Townhome layout", "Spacious green spaces", "Professional maintenance", "On-site parking"],
    nearby: ["Emory University — 5 min", "CDC Headquarters — 7 min", "Emory University Hospital — 4 min", "VA Medical Center — 6 min", "MARTA Transit — 8 min", "I-85 Highway — 10 min"],
    contact: { phone: "(404) 634-3777", email: "leasing@emorywoods.com" },
    image: "/2bedroom_render.png",
    applyUrl: "mailto:leasing@emorywoods.com?subject=Interest%20in%202%20Bedroom%20Townhome%20Apartment&body=Hello,%0A%0AI am interested in starting a rental application for the 2 Bedroom Townhome Apartment at 2122 Powell Lane, Unit No. 5, Decatur, GA 30033.%0A%0APlease let me know the next steps to proceed.%0A%0AThank you.",
  },
} as const;

export function generateStaticParams() {
  return Object.keys(units).map((slug) => ({ slug }));
}

export default function ListingPage({ params }: { params: { slug: string } }) {
  const listing = units[params.slug as keyof typeof units];
  if (!listing) notFound();
  return <ListingDetail listing={listing} />;
}
