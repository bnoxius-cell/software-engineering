const mongoose = require("mongoose");
require("dotenv").config();
const Artwork = require("./server/models/Artwork");

const seedArtworks = [
  {
    title: "Digital Masterpiece",
    artist: "Tony Kishore",
    description: "A stunning digital artwork showcasing modern design principles and vibrant colors.",
    imageUrl: "/assets/images/artwork1.png",
    medium: "Digital Art",
    genre: "Digital Art",
    year: 2024,
    featured: true
  },
  {
    title: "Nature's Beauty",
    artist: "Adrian Reniva",
    description: "Capturing the essence of nature through a contemporary lens.",
    imageUrl: "/assets/images/artwork2.png",
    medium: "Digital Photography",
    genre: "Photography",
    year: 2024,
    featured: true
  },
  {
    title: "Urban Landscape",
    artist: "Patrick Ronda",
    description: "An exploration of city life and modern architecture.",
    imageUrl: "/assets/images/artwork4.png",
    medium: "Illustration",
    genre: "Illustration",
    year: 2024,
    featured: false
  },
  {
    title: "Artistic Expression",
    artist: "Tony Kishore",
    description: "A unique blend of colors and emotion in digital form.",
    imageUrl: "/assets/images/artwork5.png",
    medium: "Digital Art",
    genre: "Digital Art",
    year: 2024,
    featured: false
  },
  {
    title: "Colorful Dreams",
    artist: "Adrian Reniva",
    description: "Vibrant colors meet imaginative design in this captivating piece.",
    imageUrl: "/assets/images/artwork6.png",
    medium: "Digital Illustration",
    genre: "Illustration",
    year: 2024,
    featured: false
  },
  {
    title: "Geometric Harmony",
    artist: "Patrick Ronda",
    description: "Perfect balance of shapes and proportions.",
    imageUrl: "/assets/images/artwork7.png",
    medium: "Abstract",
    genre: "Abstract",
    year: 2024,
    featured: false
  },
  {
    title: "Photographic Moment",
    artist: "Tony Kishore",
    description: "A moment in time captured with artistic vision.",
    imageUrl: "/assets/images/photograph.jpg",
    medium: "Photography",
    genre: "Portrait",
    year: 2024,
    featured: false
  }
];

async function runSeed() {
  try {
    // Connect to MongoDB
    const mongoURL = process.env.MONGO_URI || "mongodb://localhost:27017/thesis";
    await mongoose.connect(mongoURL);
    console.log("✓ Connected to MongoDB");

    // Clear existing artworks
    await Artwork.deleteMany({});
    console.log("✓ Cleared existing artworks");

    // Insert seed data
    const result = await Artwork.insertMany(seedArtworks);
    console.log(`✓ Successfully seeded ${result.length} artworks`);

    // Disconnect
    await mongoose.disconnect();
    console.log("✓ Disconnected from MongoDB");
  } catch (err) {
    console.error("✗ Error seeding database:", err);
    process.exit(1);
  }
}

runSeed();
