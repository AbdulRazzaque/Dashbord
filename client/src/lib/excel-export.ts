import * as XLSX from "xlsx";
import type { Order } from "@/types";

export const exportOrdersToExcel = (orders: Order[], filename = "orders") => {
  // Prepare data for Excel export
  const excelData = orders.map((order) => ({
    "Order ID": order.refId,
    Status: order.status,
    "Total Amount": `SAR ${order.totalAmount.toFixed(2)}`,
    "Payment Method": order.paymentMethod,
    "Payment Status": order.isPaid ? "Paid" : "Unpaid",
    "Customer Name": `${order.userId.firstName} ${order.userId.lastName}`,
    "Customer Mobile": order.userId.mobileNo,
    "Delivery Person": order.deliveryPersonId
      ? `${order.deliveryPersonId.firstName} ${order.deliveryPersonId.lastName}`
      : "Not Assigned",
    Address: `${order.address.flatBuildingCompany}, ${order.address.streetArea}, ${order.address.state}, ${order.address.pincode}, ${order.address.country}`,
    "Order Date": new Date(order.createdAt).toLocaleDateString(),
    "Created At": new Date(order.createdAt).toLocaleString(),
    "Updated At": new Date(order.updatedAt).toLocaleString(),
    "Is Active": order.isActive ? "Yes" : "No",
    "Items Count": order.details.length,
    "Items Details": order.details
      .map(
        (item) =>
          `${item.productId.name} (Qty: ${item.quantity}, Price: SAR ${item.price})`
      )
      .join("; "),
  }));

  // Create workbook and worksheet
  const workbook = XLSX.utils.book_new();
  const worksheet = XLSX.utils.json_to_sheet(excelData);

  // Auto-size columns
  const columnWidths = Object.keys(excelData[0] || {}).map((key) => ({
    wch: Math.max(
      key.length,
      ...excelData.map((row) => String(row[key as keyof typeof row]).length)
    ),
  }));
  worksheet["!cols"] = columnWidths;

  // Add worksheet to workbook
  XLSX.utils.book_append_sheet(workbook, worksheet, "Orders");

  // Generate filename with timestamp
  const timestamp = new Date().toISOString().split("T")[0];
  const finalFilename = `${filename}_${timestamp}.xlsx`;

  // Save file
  XLSX.writeFile(workbook, finalFilename);
};
