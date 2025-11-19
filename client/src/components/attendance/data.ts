export interface DataRows {
  id: number;
  name: string;
  description: string;
  status: string;
  image?: string;
  createdAt?: string;
}

export const users:DataRows[] = [
  {
    id: 1,
    name: "Casual Test",
    description: "Comfortable and relaxed clothing for everyday activities.",
    status: "active",
    image:
      "https://img.freepik.com/free-photo/young-handsome-hipster-man-standing_285396-1515.jpg?ga=GA1.1.1840529326.1725314483&semt=ais_hybrid",
    createdAt: "Nov 25, 2024",
  },
  {
    id: 2,
    name: "test Wear",
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
