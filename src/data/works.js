export const allWorks = [
  {
    id: 1,
    title: "Pyramid Lamp",
    description: "Nickel Coated Pyramid Night Lamp, 110v ~ 220v, Dimmable LED Chip, perfect to set a mood or to keep a low light on corridors or children rooms",
    shortDescription: "Nightlight, perfect to set a mood",
    images: [
      "https://lh3.googleusercontent.com/d/16t_Ik07NHfKO6aIjHAFIz993FpPbpUP4",
      "https://lh3.googleusercontent.com/d/153KnKgPgSp8D8wj81fO3sxYWyTlkjUzX"
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
      "https://lh3.googleusercontent.com/d/1d7lUphjywDeCjeSKK9yemc9GDylRReVd",
      "https://lh3.googleusercontent.com/d/1qzGnHO_mECEVIEpqAwtbeDXbC6zlcrfE"
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
      "https://lh3.googleusercontent.com/d/1AnlbPiChROgNLlxseH02zgfqmA0GejqK",
      "https://lh3.googleusercontent.com/d/1876gykLxgC7PUIrlVYq7L13Oj0uKWcM2"
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
  {
    id: 4,
    title: "Japanese Triangular Necklace",
    shortDescription: "A playful piece, works great with v-cut dresses",
    description: "While it was originally created to be pendantless, stones or spikes can be added for greater styling.",
    images: [
      "https://lh3.googleusercontent.com/d/1RrznwdLGH_AOGi1NxC5LLUveil64Rhk-",
      "https://lh3.googleusercontent.com/d/11rJMLOhuOoODyLRLO3TmI5boXBrkKrvj"
    ],
    details: {
      materials: "Stainless Steel",
      dimensions: "Begins at35cm, adjustable length",
      weight: "82 grams",
      weaveType: "Japanese 8 in 2 variation",
      yearCreated: "2005"
    },
    category: "jewelry",
    featured: "true"
  },
  {
    id: 5,
    title: "The Dice Bag",
    shortDescription: "Multi-use belt pouch. Stuff it with whatever you want, carry it where ever you go",
    description: "Lined with black velvet to keep your dice protected and scratchless, this pouch can be used in a utility belt to hold any objects you desire. Coins, dice, glasses, a beverage can or bottle, your imagination is the limit. The interior lining can be changed with suede, soft leather, or almosst any other fabric.",
    images: [
      "https://lh3.googleusercontent.com/d/1X5BCicjr6ACqOYOvab1ieA5OmTd-Mdh9"
    ],
    details: {
      materials: "Stainless Steel, Velvet",
      dimensions: "500cm3",
      weight: "125 grams",
      weaveType: "European 4 in 1",
      yearCreated: "2004"
    },
    category: "jewelry",
    featured: "true"
  },
  {
    id: 6,
    title: "Ipod Protective Sleeve",
    shortDescription: "The ultimate Ipod protector",
    description: "Firstly made with the original Ipod sleeve, it was later produced with black velvet. This protective case is almost rigid, fits perfectly and lasts forever.",
    images: [
      "https://lh3.googleusercontent.com/d/1F2MthwoFerorvFieOFm4JfLTl5opsGRs"
    ],
    details: {
      materials: "Stainless Steel",
      dimensions: "59 x 112 x 7.9 mm",
      weight: "150 grams",
      weaveType: "European 6 in 1",
      yearCreated: "2004"
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
