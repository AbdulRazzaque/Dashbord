export interface UserData {
  _id: string;
  firstName: string;
  lastName: string;
  email: string;
  avatar: string;
  password: string;
  mobileNo: number;
  role: string;
  status: string;
  isVerified?: boolean;
  isActive?: boolean;
  stripeCustomerId?: string;
  designation?: string;
  FCMToken?: string;
  address: [
    {
      id: string;
      flatBuildingCompany: string;
      streetArea: string;
      landmark: string;
      pincode: string;
      cityDistrict: string;
      country: string;
      state: string;
      firstName: string;
      lastName: string;
      phoneCountryCode: string;
      phone: number;
      tag: string;
      isDefault: boolean;
    }
  ];
  addedBy?: UserData;
  createdAt: Date;
  updatedAt: Date;
}

export interface CategoryData {
  _id: string;
  name: string;
  description: string;
  image: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  status: string;
  createdBy: {
    firstName: string;
    lastName: string;
    avatar?: string;
  };
}

export interface SubCategory {
  _id: string;
  name: string;
  description: string;
  image: string;
  categoryId: CategoryData;
  status: string;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
  createdBy: {
    firstName: string;
    lastName: string;
    avatar?: string;
  };
}

export interface ProductData {
  _id: string;
  name: string;
  description: string;
  categoryId: CategoryData;
  subCategoryId: SubCategory;
  createdBy: UserData;
  brandId: Brand;
  status: string;
  isApproved: boolean;
  isActive: boolean;
  isFeatured: boolean;
  featureImg: string;
  images: string[];
  variants: {
    quantity: number;
    sku: string;
    mrp: number;
    rate: number;
    discount: number;
    attributes: [{ attributeId: IAttribute; value: string }];
    setDetails: {
      isSet: boolean;
      setLabel: string;
      setSize: number;
      distribution: [
        {
          color: string;
          sizes: [
            {
              size: string;
              qty: number;
            }
          ];
        }
      ];
    };
  }[];
  createdAt: Date;
  updatedAt: Date;
}

export interface Details {
  productId: ProductData;
  quantity: number;
  price: number;
  total: number;
  attributes: [{ id: string; name: string; value: string }];
}

export interface Order {
  _id: string;
  refId: string;
  paymentMethod: string;
  status: string;
  totalAmount: number;
  details: Details[];
  userId: UserData;
  deliveryPersonId: UserData;
  orderBy: UserData;
  assignedTo: UserData;
  address: {
    flatBuildingCompany: string;
    streetArea: string;
    landmark: string;
    pincode: string;
    cityDistrict: string;
    country: string;
    state: string;
    firstName: string;
    lastName: string;
    phoneCountryCode: string;
    phone: number;
    tag: string;
    isDefault: boolean;
  };
  isPaid: boolean;
  paymentId: string;
  paymentStatus: string;
  isActive: boolean;
  isRequestingDeliveryPerson: boolean;
  note: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface Brand {
  _id: string;
  name: string;
  image: string;
  createdBy: UserData;
  status: string;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface IAttribute {
  _id: string;
  name: string; // like sizes
  values: string[]; // For predefined values like sizes: ["S", "M", "L"]
  isActive: boolean;
  createdBy: UserData;
  createdAt: Date;
  updatedAt: Date;
}

export interface ILocation {
  _id: string;
  deliveryCharge: number;
  estDeliveryTime: number;
  estDeliveryTimeUnit: string;
  formatted_address: string;
  lat: number;
  lng: number;
  minOrderAmount: number;
  isActive: boolean;
  createdBy: UserData;
  createdAt: Date;
  updatedAt: Date;
}

export interface ILanding {
  _id: string;
  images: string[];
  status: string;
  isActive: boolean;
  createdBy: UserData;
  createdAt: Date;
  updatedAt: Date;
}

export interface Counts {
  totalSales: number;
  todaysOrders: number;
  completedOrders: number;
  pendingOrders: number;
}

export interface Notification {
  _id: string;
  recipientId: UserData;
  recipientRole: string;
  orderId: Order;
  type: string;
  message: string;
  isRead: boolean;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface RetailerDetails {
  _id: string;
  businessName: string;
  businessAddress: string;
  businessDescription: string;
  taxId: string;
  businessLicense: string;
  isVerified: boolean;
  userId: UserData;
  verifiedBy: UserData;
  createdAt: Date;
  updatedAt: Date;
}

export interface Transection {
  _id: string;
  orderId: Order;
  refId: string;
  userId: UserData;
  gateway: string;
  sessionId: string;
  paymentIntentId: string;
  paymentMethodTypes: string;
  amount: number;
  currency: string;
  status: "pending" | "paid" | "failed" | "refunded" | "cancelled";
  paymentUrl: string;
  receiptUrl: string;
  email: string;
  refund: {
    refundId: string;
    chargeId: string; // Stripe charge ID
    amount: number; // Amount refunded
    currency: string; // Currency of refund
    status: string;
    createdAt: Date;
    reason: string;
  };
  createdAt: Date;
  updatedAt: Date;
}

export interface PickupAddress {
  flatBuildingCompany: string;
  streetArea: string;
  landmark: string;
  pincode: string;
  cityDistrict: string;
  country: string;
  state: string;
  firstName: string;
  lastName: string;
  phoneCountryCode: string;
  phone: number;
}

export interface ReturnOrderRequest {
  refId: string;
  orderId: Order;
  items: Details[];
  pickupAddress: PickupAddress;
  reason: string;
}

export interface ReturnOrder extends ReturnOrderRequest {
  _id: string;
  userId: UserData;
  status: string;
  refundAmount: number;
  pickupTrackingId: string;
  approvedBy?: UserData;
  approvedAt?: Date;
  completedAt?: Date;
  attachments: string[];
  createdAt: Date;
  updatedAt: Date;
}
