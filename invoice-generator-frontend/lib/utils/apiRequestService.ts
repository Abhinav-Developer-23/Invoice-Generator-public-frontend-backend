"use client";

import { ItemData } from "../schema/itemData";

export const sendInvoiceJsonRequest = async (
  heading: string,
  gst: string,
  itemArray: ItemData[]
) => {
  console.log("API request");

  const data = {
    heading: heading,
    gstNumber: gst,
    itemList: itemArray,
  };

  const config = {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Accept: "application/pdf",
      service :"invoice-generator"
    },
    body: JSON.stringify(data),
  };

  try {
    const response = await fetch(
      "https://vevel-https-proxy.vercel.app/createInvoiceJson",
      config
    );

    if (response.ok) {
      const blob = await response.blob();

      const url = window.URL.createObjectURL(blob);

      const link = document.createElement("a");
      link.href = url;
      link.download = "invoice.pdf";
      document.body.appendChild(link);
      link.click();

      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
    } else {
      console.log("Download failed with status", response.status);
    }
  } catch (error) {
    console.log("Error in hitting the invoice JSON API with error: ", error);
  }
};

export const sendCsvRequest = async (
  heading: string,
  gst: string,
  file: File
) => {
  const formData = new FormData();
  formData.append("csvFile", file);
  console.log("API request");
  const config = {
    method: "POST",
    headers: {
      heading: heading,
      gst: gst,
      service :"invoice-generator"
    },
    body: formData,
  };

  try {
    const response = await fetch(
      "https://vecvel-https-proxy.vercel.app/createInvoiceCsv",
      config
    );

    if (response.ok) {
      const blob = await response.blob();

      const url = window.URL.createObjectURL(blob);

      const link = document.createElement("a");
      link.href = url;
      link.download = "invoice.pdf";
      document.body.appendChild(link);
      link.click();

      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
    }
    console.log("positive response ", response);
  } catch (error) {
    console.log("Error in hitting the invoice CSV API with error: ", error);
  }
};
