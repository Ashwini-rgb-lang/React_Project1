// One-off script to seed the car_types collection with the same
// defaults used by the original get_car_types.php static fallback.
// Usage: npm run seed
require('dotenv').config();
const mongoose = require('mongoose');
const CarType = require('./models/CarType');

const MONGO_URI = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/car_rental';

const carTypes = [
  { typeName: 'Sedan', description: 'Comfortable & fuel-efficient for daily drives.', imagePath: '/img/sedan.jpg' },
  { typeName: 'SUV', description: 'Space for family & friends with premium comfort.', imagePath: '/img/suv.jpg' },
  { typeName: 'Hatchback', description: 'Easy to drive & park; budget-friendly.', imagePath: '/img/hatchback.jpg' },
  { typeName: 'Luxury', description: 'Turn heads with performance-driven supercars.', imagePath: '/img/luxury.jpg' },
  { typeName: 'Van', description: 'Spacious vehicle for group travel.', imagePath: '/img/van.jpg' },
  { typeName: 'BMW', description: 'Premium luxury car experience.', imagePath: '/img/bmw.jpg' },
];

async function seed() {
  await mongoose.connect(MONGO_URI);
  console.log('Connected. Seeding car types...');

  for (const ct of carTypes) {
    await CarType.updateOne({ typeName: ct.typeName }, ct, { upsert: true });
  }

  console.log(`Seeded ${carTypes.length} car types.`);
  await mongoose.disconnect();
  process.exit(0);
}

seed().catch((err) => {
  console.error(err);
  process.exit(1);
});
