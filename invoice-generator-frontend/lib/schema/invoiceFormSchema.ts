import { z } from "zod";

export const invoiceFormSchema = z
  .object({
    Heading: z.string().min(3, "Heading must be at least 3 characters"),
    GSTNumber: z.string().min(15, "GST must be at least 15 characters")
  })

export type TInvoiceFormSchema = z.infer<typeof invoiceFormSchema>;
