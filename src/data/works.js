export const allWorks = [
  {
    id: 1,
    title: "Pyramid Lamp",
    description: "Nickel Coated Pyramid Night Lamp, 110v ~ 220v, Dimmable LED Chip, perfect to set a mood or to keep a low light on corridors or children rooms",
    shortDescription: "Nightlight, perfect to set a mood",
    images: [
      "/images/Pyramid 01.jpg",
      "/images/Pyramid TopView.jpg"
    ],
    details: {
      materials: "Niquel Coated Steel",
      dimensions: "30cm x 30cm x 27 cm",
      weight: "147 grams",
      weaveType: "Modified Captive Inverted Round",
      yearCreated: "2022"
    },
    category: "art",
    featured: "true"
  },
  {
    id: 2,
    title: "European 4-in-1 Book Bag",
    description: "Handcrafted chainmaille shoulder bag made with galvanized steel rings in European 4-in-1 weave. Perfect for everyday essentials or special occasions. The bag features a reinforced strap and no interior lining.",
    shortDescription: "Cross-shoulder style, great for books, laptops or tablets",
    images: [
      "/images/Bag Book1.jpg",
      "/images/Bag Book2.jpg"
    ],
    details: {
      materials: "Galvanized Steel",
      dimensions: "Case: 30cm x 25cm. Strap: 55cm.",
      weight: "350 grams",
      weaveType: "European 4 in 1",
      closureType: "Magnetic",
      yearCreated: "2013"
    },
    category: "jewelry",
    featured: "true"
  },
  {
    id: 3,
    title: "V-Cut Coif",
    shortDescription: "Steel Coif - 1-size-fits-all",
    description: "Great protection for neck and head, this galvanized steel piece is just fun to wear to your favorite larping session, or even to the supermarket.",
    images: [
      "/images/Coif1.jpg",
      "/images/Coif1mini3.jpg"
    ],
    details: {
      materials: "Galvanized Steel",
      dimensions: "Shoulders: 55cm.",
      weight: "420 grams",
      weaveType: "European 4 in 1",
      yearCreated: "2010"
    },
    category: "jewelry",
    featured: "true"
  },
  // Add more items as needed
];

export const featuredWorks = allWorks.filter(work => work.featured);

export const getWorkById = (id) => {
  return allWorks.find(work => work.id === parseInt(id));
};