export interface DataRows {
  id: number;
  name: string;
  description: string;
  status: string;
  image?: string;
  createdAt?: string;
}

export const users = [
  {
    id: 1,
    name: "Casual Wear",
    description: "Comfortable and relaxed clothing for everyday activities.",
    status: "active",
    image:
      "https://img.freepik.com/free-photo/young-handsome-hipster-man-standing_285396-1515.jpg?ga=GA1.1.1840529326.1725314483&semt=ais_hybrid",
    createdAt: "Nov 25, 2024",
  },
  {
    id: 2,
    name: "Formal Wear",
    description:
      "Elegant and professional clothing for office settings and formal occasions.",
    status: "active",
    image:
      "https://img.freepik.com/free-photo/close-up-photo-young-successful-business-man-black-suit_171337-9509.jpg?ga=GA1.1.1840529326.1725314483&semt=ais_hybrid",
    createdAt: "Nov 25, 2024",
  },
  {
    id: 3,
    name: "Activewear",
    description:
      "Clothing designed for fitness, sports, and physical activities.",
    status: "active",
    image:
      "https://img.freepik.com/premium-photo/image-sportive-adult-man-30s-black-sportswear-sitting-boardwalk-seaside_171337-55090.jpg?ga=GA1.1.1840529326.1725314483&semt=ais_hybrid",
    createdAt: "Nov 25, 2024",
  },
  {
    id: 4,
    name: "Ethnic Wear",
    description: "Traditional clothing that reflects cultural heritage.",
    status: "active",
    image:
      "https://img.freepik.com/premium-photo/indian-man-traditional-wear-kurta-pyjama-cloths-male-fashion-model-sherwani-posing-standing-against-brown-grunge-background-selective-focus_466689-45391.jpg?ga=GA1.1.1840529326.1725314483&semt=ais_hybrid",
    createdAt: "Nov 25, 2024",
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
