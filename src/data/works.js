/**
 * WORKS DATA MODULE
 * =================
 * 
 * This module serves as the central data repository for The Chain Lair portfolio website,
 * containing all artwork and product information displayed throughout the application.
 * 
 * PURPOSE:
 * - Centralized data management for all portfolio pieces
 * - Consistent data structure across the application
 * - Easy maintenance and updates of product information
 * - Support for filtering and categorization
 * 
 * TECHNICAL ARCHITECTURE:
 * - ES6 module exports for modern JavaScript compatibility
 * - Structured data objects with consistent schema
 * - Utility functions for data retrieval and filtering
 * - Google Drive integration for image hosting
 * 
 * DATA STRUCTURE:
 * Each work item contains:
 * - Unique identifier and basic information
 * - Multiple image URLs for gallery display
 * - Detailed specifications and materials
 * - Categorization and featured status
 * 
 * EXPORTS:
 * - allWorks: Complete array of all portfolio pieces
 * - featuredWorks: Filtered array of featured pieces only
 * - getWorkById: Utility function for individual item retrieval
 */

// =============================================================================
// MAIN WORKS DATA ARRAY
// =============================================================================
// Complete collection of all portfolio pieces with detailed information
// Each item follows a consistent schema for reliable data access
export const allWorks = [
  // FEATURED ARTWORK #1 - PYRAMID LAMP
  // Modern lighting piece combining functionality with artistic design
  {
    id: 1, // Unique identifier for routing and data retrieval
    title: "Pyramid Lamp", // Display name for the artwork
    description: "Nickel Coated Pyramid Night Lamp, 110v ~ 220v, Dimmable LED Chip, perfect to set a mood or to keep a low light on corridors or children rooms", // Full product description
    shortDescription: "Nightlight, perfect to set a mood", // Brief description for gallery cards
    images: [ // Array of Google Drive hosted images
      "https://lh3.googleusercontent.com/d/16t_Ik07NHfKO6aIjHAFIz993FpPbpUP4",
      "https://lh3.googleusercontent.com/d/153KnKgPgSp8D8wj81fO3sxYWyTlkjUzX"
    ],
    details: { // Structured technical specifications
      materials: "Niquel Coated Steel", // Primary materials used
      dimensions: "30cm x 30cm x 27 cm", // Physical measurements
      weight: "147 grams", // Item weight
      weaveType: "Modified Captive Inverted Round", // Chainmaille technique used
      yearCreated: "2022" // Year of creation
    },
    category: "art", // Category classification for filtering
    featured: "true" // Featured status for homepage display
  },

  // FEATURED ARTWORK #2 - EUROPEAN 4-IN-1 BOOK BAG
  // Functional chainmaille bag combining medieval techniques with modern utility
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
      weaveType: "European 4 in 1", // Classic chainmaille pattern
      closureType: "Magnetic", // Additional specification for bags
      yearCreated: "2013"
    },
    category: "jewelry", // Category includes wearable accessories
    featured: "true"
  },

  // FEATURED ARTWORK #3 - V-CUT COIF
  // Medieval-inspired head protection with modern appeal
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

  // FEATURED ARTWORK #4 - JAPANESE TRIANGULAR NECKLACE
  // Elegant jewelry piece showcasing Japanese chainmaille techniques
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
      dimensions: "Begins at35cm, adjustable length", // Adjustable sizing feature
      weight: "82 grams",
      weaveType: "Japanese 8 in 2 variation", // Specialized Japanese technique
      yearCreated: "2005"
    },
    category: "jewelry",
    featured: "true"
  },

  // FEATURED ARTWORK #5 - THE DICE BAG
  // Multi-purpose utility pouch with velvet lining
  {
    id: 5,
    title: "The Dice Bag",
    shortDescription: "Multi-use belt pouch. Stuff it with whatever you want, carry it where ever you go",
    description: "Lined with black velvet to keep your dice protected and scratchless, this pouch can be used in a utility belt to hold any objects you desire. Coins, dice, glasses, a beverage can or bottle, your imagination is the limit. The interior lining can be changed with suede, soft leather, or almosst any other fabric.",
    images: [
      "https://lh3.googleusercontent.com/d/1X5BCicjr6ACqOYOvab1ieA5OmTd-Mdh9"
    ],
    details: {
      materials: "Stainless Steel, Velvet", // Multiple materials listed
      dimensions: "500cm3", // Volume measurement for containers
      weight: "125 grams",
      weaveType: "European 4 in 1",
      yearCreated: "2004"
    },
    category: "jewelry",
    featured: "true"
  },

  // FEATURED ARTWORK #6 - IPOD PROTECTIVE SLEEVE
  // Vintage tech protection with chainmaille craftsmanship
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

// =============================================================================
// FEATURED WORKS FILTER
// =============================================================================
// Automatically filters the main works array to include only featured pieces
// Used by the homepage FeaturedWorks component to display highlighted items
// Returns: Array of work objects where featured property equals true
export const featuredWorks = allWorks.filter(work => work.featured);

// =============================================================================
// UTILITY FUNCTION - GET WORK BY ID
// =============================================================================
// Retrieves a specific work item by its unique identifier
// Used by ProductDetail component for individual item display
// 
// PARAMETERS:
// @param {string|number} id - The unique identifier of the work item
// 
// RETURNS:
// @returns {Object|undefined} - The matching work object or undefined if not found
// 
// USAGE:
// - Called from ProductDetail component via URL parameters
// - Handles both string and number ID formats through parseInt conversion
// - Returns undefined for non-existent IDs (handled by component error states)
export const getWorkById = (id) => {
  return allWorks.find(work => work.id === parseInt(id));
};
