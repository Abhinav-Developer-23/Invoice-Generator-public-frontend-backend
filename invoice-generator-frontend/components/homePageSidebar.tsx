import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { Fragment } from "react";

interface HomeSideBarProps {
  children: React.ReactNode;
}

export default function HomeSideBar({ children }: HomeSideBarProps) {
  return (
    <Fragment>
      <div className=" w-1/4 inline-block ">
        <Card className="w-full h-screen flex flex-col bg-slate-600">
          <Link href="/home/createInvoiceJson">
            <Button className="w-full items-center bg-cyan-500 h-16 text-3xl font-bold text-white font-mono my-11 rounded-none">
              Create invoice
            </Button>
          </Link>
          <Link href="/home/createInvoiceCsv">
            <Button className="w-full items-center bg-cyan-500 h-16 text-3xl font-bold text-white font-mono rounded-none">
              Create Invoice with CSV
            </Button>
          </Link>
        </Card>
      </div>
      <div className=" w-3/4 inline-block">{children}</div>
    </Fragment>
  );
}
