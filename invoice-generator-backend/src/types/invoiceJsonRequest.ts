import { invoiceItem } from "./invoiceItem"
export type invoiceJsonRequest={
 heading:string,
 itemList :invoiceItem[],
 gstNumber:string


}