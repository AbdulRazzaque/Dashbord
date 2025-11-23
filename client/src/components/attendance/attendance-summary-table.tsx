"use client";
import React from "react";

type SummaryRow = {
  id: number;
  emp: number;
  name: string;
  checkIn: string | null | Date;
  checkOut: string | null | Date;
  totalMinutes: number;
  netMinutes: number;
  status: string;
};

interface Props {
  data: SummaryRow[];
  isLoading?: boolean;
  page?: number;
  setPage?: (page: number) => void;
  rowsPerPage?: number;
  totalEmployee?: number;
}

const toDate = (v: string | Date | null) => (v ? new Date(v) : null);
const formatTime = (v: string | Date | null) => {
  const d = toDate(v);
  return d ? d.toLocaleTimeString() : "-";
};
const formatHours = (minutes: number) => {
  const m = Math.max(0, Math.round(minutes));
  const h = Math.floor(m / 60);
  const rem = m % 60;
  return `${h}h ${rem}m`;
};
const getStatusColor = (status: string) => {
  switch (status) {
    case "Present":
      return "bg-green-100 text-green-800 border border-green-200";
    case "Out":
      return "bg-blue-100 text-blue-800 border border-blue-200";
    case "Late":
      return "bg-yellow-100 text-yellow-800 border border-yellow-200";
    case "Early Out":
      return "bg-orange-100 text-orange-800 border border-orange-200";
    default:
      return "bg-gray-100 text-gray-800 border border-gray-200";
  }
};

export default function AttendanceSummaryTable({
  data,
  isLoading,
  page = 1,
  setPage,
  rowsPerPage = 10,
  totalEmployee = 0,
}: Props) {
  return (
    <div className="w-full">
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Employee
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Check In/Out
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Total Hours
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Net Hours
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Status
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {isLoading ? (
              <tr>
                <td className="px-6 py-4" colSpan={8}>Loading...</td>
              </tr>
            ) : data.length === 0 ? (
              <tr>
                <td className="px-6 py-4" colSpan={8}>No data found</td>
              </tr>
            ) : (
              data.map((employee) => (
                <tr key={employee.id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div>
                      <div className="text-sm font-medium text-gray-900">{employee.name}</div>
                      {/* position removed per new requirements */}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900 space-y-1">
                      <div className="flex items-center space-x-1">
                        <span className="text-green-600">●</span>
                        <span>In: {formatTime(employee.checkIn)}</span>
                      </div>
                      <div className="flex items-center space-x-1">
                        <span className="text-red-600">●</span>
                        <span>Out: {formatTime(employee.checkOut)}</span>
                      </div>
                      {/* Late badge omitted; status covers it */}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {formatHours(employee.totalMinutes)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-semibold text-gray-900">
                      {formatHours(employee.netMinutes)}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(employee.status)}`}>
                      {employee.status}
                    </span>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      <div className="flex items-center justify-between p-4">
        <span>
          Showing {data.length === 0 ? 0 : (page - 1) * rowsPerPage + 1}-
          {(page - 1) * rowsPerPage + data.length} of {totalEmployee}
        </span>
        <div className="flex gap-2">
          <button
            disabled={page <= 1 || !setPage}
            onClick={() => setPage && setPage(page - 1)}
            className="px-3 py-1 border rounded disabled:opacity-50"
          >Prev</button>
          <button
            disabled={page * rowsPerPage >= totalEmployee || !setPage}
            onClick={() => setPage && setPage(page + 1)}
            className="px-3 py-1 border rounded disabled:opacity-50"
          >Next</button>
        </div>
      </div>
    </div>
  );
}
