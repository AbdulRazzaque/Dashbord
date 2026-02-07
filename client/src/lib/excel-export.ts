import * as XLSX from "xlsx";

export interface ReportEmployeeForExport {
  id: string;
  name: string;
  employeeId: string;
  emp_code: number;
}

export interface ReportDailyRecordForExport {
  date: string;
  employeeId: string;
  status: string;
}

/**
 * Export attendance matrix to Excel: one row per employee, columns = Name, Employee ID, Emp Code, Day 1 .. Day N.
 * Only days 1 up to today (for current month) are included; future dates are omitted.
 * Cell values: P (Present), A (Absent), or blank for other statuses.
 */
export function exportAttendanceMatrixToExcel(
  employees: ReportEmployeeForExport[],
  dailyRecords: ReportDailyRecordForExport[],
  year: number,
  month: number,
  filenamePrefix = "attendance-report"
): void {
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const now = new Date();
  const todayYear = now.getFullYear();
  const todayMonth = now.getMonth();
  const todayDate = now.getDate();
  const isFutureMonth = year > todayYear || (year === todayYear && month > todayMonth);
  const isCurrentMonth = year === todayYear && month === todayMonth;
  const lastDayToShow = isFutureMonth ? 0 : isCurrentMonth ? todayDate : daysInMonth;

  const recordsByEmployee = new Map<string, Map<number, string>>();
  for (const r of dailyRecords) {
    const day = new Date(r.date).getDate();
    if (!recordsByEmployee.has(r.employeeId)) recordsByEmployee.set(r.employeeId, new Map());
    recordsByEmployee.get(r.employeeId)!.set(day, r.status);
  }

  const rows = employees.map((emp) => {
    const row: Record<string, string | number> = {
      "Employee Name": emp.name,
      "Employee ID": emp.employeeId,
      "Emp Code": emp.emp_code,
    };
    for (let d = 1; d <= lastDayToShow; d++) {
      const status = recordsByEmployee.get(emp.id)?.get(d);
      row[`Day ${d}`] =
        status === "present" ? "P" : status === "absent" ? "A" : "";
    }
    return row;
  });

  const workbook = XLSX.utils.book_new();
  const worksheet = XLSX.utils.json_to_sheet(rows);

  const headerKeys = rows[0] ? Object.keys(rows[0]) : ["Employee Name", "Employee ID", "Emp Code"];
  const colWidths = headerKeys.map((k, i) => ({
    wch: i < 3 ? Math.max(12, k.length) : 6,
  }));
  worksheet["!cols"] = colWidths;

  const monthName = new Date(year, month, 1).toLocaleString("default", { month: "short" });
  const sheetName = `Attendance ${monthName} ${year}`.slice(0, 31);
  XLSX.utils.book_append_sheet(workbook, worksheet, sheetName);

  const timestamp = new Date().toISOString().split("T")[0];
  const finalFilename = `${filenamePrefix}_${monthName}_${year}_${timestamp}.xlsx`;
  XLSX.writeFile(workbook, finalFilename);
}

export const exportOrdersToExcel = (orders:any[], filename = "orders") => {
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
    "Order Date": order.createdAt ? new Date(order.createdAt).toLocaleDateString() : "N/A",
    "Created At": order.createdAt ? new Date(order.createdAt).toLocaleString() : "N/A",
    "Updated At": order.updatedAt ? new Date(order.updatedAt).toLocaleString() : "N/A",
    "Is Active": order.isActive ? "Yes" : "No",
    "Items Count": order.details.length,
    "Items Details": order.details
      .map(
        (item: any) =>
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
