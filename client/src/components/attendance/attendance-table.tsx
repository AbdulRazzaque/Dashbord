import React from 'react'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Switch } from '@radix-ui/react-switch';
import { Button } from '../ui/button';
import { Icon } from "@iconify/react";
import { BioTimePunch } from '@/types';
import DeleteCategory from '../category/delete-category';
import { useRouter } from "next/navigation";
// import { changeCategoryStatus } from '@/lib/http/api';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { AxiosError } from 'axios';
import toast from 'react-hot-toast';
import { DataRows } from './data';


interface PageProps {
  data: BioTimePunch[];
  isLoading?: boolean;
  page?: number;
  setPage?: (page: number) => void;
  rowsPerPage?: number;
  totalEmployee?: number;
}


const AttendanceTable = ({ data, isLoading, page = 1, setPage, rowsPerPage = 10, totalEmployee = 0 }: PageProps) => {
  return (
    <div className="w-full">
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead className="font-semibold">Employee</TableHead>
          <TableHead>Punch Time</TableHead>
          <TableHead>State</TableHead>
          <TableHead>Terminal</TableHead>
          <TableHead>Verify</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {isLoading ? (
          <TableRow>
            <TableCell colSpan={5}>Loading...</TableCell>
          </TableRow>
        ) : data.length === 0 ? (
          <TableRow>
            <TableCell colSpan={5}>No punches found</TableCell>
          </TableRow>
        ) : (
          data.map((item: BioTimePunch) => {
            const raw: any = (item as any).raw || item;
            return (
              <TableRow key={item.id}>
                <TableCell className="font-medium text-card-foreground/80">
                  <div className="flex gap-3 items-center">
                    <Avatar className="rounded-full">
                      <AvatarImage src={raw.avatar || ''} />
                      <AvatarFallback>
                        {(raw.first_name || 'NA').slice(0, 2).toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                    <span className="text-sm text-card-foreground">
                      {raw.first_name || raw.name || 'Unknown'}
                    </span>
                  </div>
                </TableCell>
                <TableCell>
                  {item.punch_time
                    ? new Date(item.punch_time).toLocaleString()
                    : '-'}
                </TableCell>
                <TableCell>{raw.punch_state_display || '-'}</TableCell>
                <TableCell>{raw.terminal_alias || raw.terminal_sn || '-'}</TableCell>
                <TableCell>{raw.verify_type_display || '-'}</TableCell>
              </TableRow>
            );
          })
        )}
      </TableBody>
    </Table>
      <div className="flex items-center justify-between p-4">
      <span>
        Showing {(data.length === 0 ? 0 : (page - 1) * rowsPerPage + 1)}-
        {(page - 1) * rowsPerPage + data.length} of {totalEmployee}
      </span>
      <div className="flex gap-2">
        <Button
          variant="outline"
            size="sm"
          disabled={page <= 1 || !setPage}
          onClick={() => setPage && setPage(page - 1)}
          className="px-3 py-1 border rounded disabled:opacity-50"
        >Prev</Button>
        <Button
        variant="outline"
            size="sm"
          disabled={page * rowsPerPage >= totalEmployee || !setPage}
          onClick={() => setPage && setPage(page + 1)}
          className="px-3 py-1 border rounded disabled:opacity-50"
        >Next</Button>
      </div>
    </div>
    </div>
  );
}

export default AttendanceTable