import {
  Table,
  TableBody,
  TableCaption,
  TableCell,

  TableRow,
} from "@/components/ui/table";
import Link from "next/link";
import { Fragment } from "react";

const invoices = [
  {
    item: "item1",
    price: "24",
  },
  {
    item: "item2",
    price: "45",
  },
  {
    item: "item1",
    price: "67",
  },
];

export function TableDemo() {
  return (
<Fragment>
    <p className="text-center text-3xl font-bold text-blue-500">Example table format</p>
    <Table className="max-w-5xl mx-auto">
    <TableCaption>
        <Link href="https://docs.google.com/spreadsheets/d/1N6SztgPd0wmixjd9YdD5o9LzajPEZIWPQTKp4O5PNhc/edit?usp=sharing" target="_blank">
            Example Invoice link
        </Link>
    </TableCaption>
      <TableBody>
        {invoices.map((invoice, index) => (
          <TableRow key={index}>
            <TableCell className="text-center ">{invoice.item}</TableCell>
            <TableCell className="text-center ">{invoice.price}</TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
    </Fragment>
  );
}
