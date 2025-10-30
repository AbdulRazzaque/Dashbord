export interface DataRows {
  id: number;
  name: string;
  description: string;
  status: string;
  image?: string;
  createdAt?: string;
  category: string;
}

export const users = [
  {
    id: 1,
    name: "T-shirts",
    description: "Comfortable and relaxed clothing for everyday activities.",
    status: "active",
    image:
      "https://img.freepik.com/free-photo/man-wearing-t-shirt-gesturing_23-2149393641.jpg?ga=GA1.1.1840529326.1725314483&semt=ais_hybrid",
    createdAt: "Nov 25, 2024",
    category: "Casual Wear",
  },
  {
    id: 2,
    name: "Formal Wear",
    description:
      "Elegant and professional clothing for office settings and formal occasions.",
    status: "active",
    image:
      "https://img.freepik.com/premium-photo/young-handsome-businessman-wearing-suit_220507-607.jpg?ga=GA1.1.1840529326.1725314483&semt=ais_hybrid",
    createdAt: "Nov 25, 2024",
    category: "Suits",
  },
  {
    id: 3,
    name: "Hoodies",
    description:
      "Clothing designed for fitness, sports, and physical activities.",
    status: "active",
    image:
      "https://img.freepik.com/premium-photo/portrait-young-adult-wearing-hoodie-mockup_414708-429.jpg?ga=GA1.1.1840529326.1725314483&semt=ais_hybrid",
    createdAt: "Nov 25, 2024",
    category: "Activewear",
  },
  {
    id: 4,
    name: "Kurtas",
    description: "Traditional clothing that reflects cultural heritage.",
    status: "active",
    image:
      "https://img.freepik.com/premium-photo/man-black-robe-stands-front-green-background_278224-220.jpg?ga=GA1.1.1840529326.1725314483&semt=ais_hybrid",
    createdAt: "Nov 25, 2024",
    category: "Ethnic Wear",
  },
];

// import { faker } from "@faker-js/faker";

// export const users1 = [
//   {
//     id: 1,
//     user: {
//       name: "Lindsay Walton",
//       avatar: faker.image.avatarLegacy(),
//       title: "Front-end Developer",
//       email: "lindsay.walton@example.com",
//     },
//     title: "Front-end Developer",
//     email: "lindsay.walton@example.com",
//     role: "member",
//     action: null,
//     details: {
//       city: faker.location.cardinalDirection(),
//       experience: " 2 Years",
//       post: faker.company.buzzAdjective(),
//     },
//   },
//   {
//     id: 2,
//     user: {
//       name: "Courtney Henry	",
//       avatar: faker.image.avatarLegacy(),
//       title: "Designer",
//       email: "courtney.henry@example.com",
//     },
//     title: "Designer",
//     email: "courtney.henry@example.com",
//     role: "admin",
//     action: null,
//     details: {
//       city: faker.location.cardinalDirection(),
//       experience: " 2 Years",
//       post: faker.company.buzzAdjective(),
//     },
//   },
//   {
//     id: 3,
//     user: {
//       name: "Tom Cook	",
//       avatar: faker.image.avatarLegacy(),
//       title: "Director of Product	",
//       email: "tom.cook@example.com	",
//     },
//     title: "Director of Product",
//     email: "tom.cook@example.com	",
//     role: "member",
//     action: null,
//     details: {
//       city: faker.location.cardinalDirection(),
//       experience: " 2 Years",
//       post: faker.company.buzzAdjective(),
//     },
//   },
//   {
//     id: 4,
//     user: {
//       name: "Whitney Francis",
//       avatar: faker.image.avatarLegacy(),
//       title: "Copywriter	",
//       email: "whitney.francis@example.com	",
//     },
//     title: "Copywriter",
//     email: "whitney.francis@example.com	",
//     role: "admin",
//     action: null,
//     details: {
//       city: faker.location.cardinalDirection(),
//       experience: " 2 Years",
//       post: faker.company.buzzAdjective(),
//     },
//   },
//   {
//     id: 5,
//     user: {
//       name: "Leonard Krasner",
//       avatar: faker.image.avatarLegacy(),
//       title: "Senior Designer		",
//       email: "leonard.krasner@example.com	",
//     },
//     title: "Senior Designer	",
//     email: "leonard.krasner@example.com	",
//     role: "owner",
//     action: null,
//     details: {
//       city: faker.location.cardinalDirection(),
//       experience: " 2 Years",
//       post: faker.company.buzzAdjective(),
//     },
//   },
//   {
//     id: 6,
//     user: {
//       name: "Floyd Miles	",
//       avatar: faker.image.avatarLegacy(),
//       title: "Principal Designer		",
//       email: "floyd.miles@example.com		",
//     },
//     title: "Principal Designer	",
//     email: "floyd.miles@example.com	",
//     role: "member",
//     action: null,
//     details: {
//       city: faker.location.cardinalDirection(),
//       experience: " 2 Years",
//       post: faker.company.buzzAdjective(),
//     },
//   },
// ];
