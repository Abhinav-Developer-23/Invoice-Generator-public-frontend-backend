"use client";
import { Fragment, useState } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import {
  invoiceFormSchema,
  TInvoiceFormSchema,
} from "@/lib/schema/invoiceFormSchema";
import { ItemData } from "@/lib/schema/itemData";
import { sendInvoiceJsonRequest } from "@/lib/utils/apiRequestService";
export default function Home() {
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    reset,
    setError,
  } = useForm<TInvoiceFormSchema>({
    resolver: zodResolver(invoiceFormSchema),
  });

  const {
    register: register2,
    handleSubmit: handleSubmit2,
    formState: { errors: errors2, isSubmitting: isSubmitting2 },
    reset: reset2,
    setError: setError2,
  } = useForm();

  const [itemDetails, setItemDetails] = useState<ItemData[]>([]);

  const addItem = (data: any) => {
    console.log("data ", data);
    setItemDetails((prevItemDetails) => [
      ...prevItemDetails,
      { name: data.ItemName, price: data.ItemPrice },
    ]);
  
    reset2();
    console.log("clicked");
  };

  const onSubmit = async (data: TInvoiceFormSchema) => {
    console.log("submit data ", JSON.stringify(data));

    sendInvoiceJsonRequest(data.GSTNumber, data.Heading, itemDetails);
  };
  return (
    <Fragment>
      <div className="p-4 w-full ">
        <form className="max-w-3xl mx-auto  flex flex-col gap-y-2">

        {itemDetails.map((item, index) => (
            <div
              key={index}
              className="flex flex-row gap-4 justify-between bg-slate-50 p-4"
            >
              <p className="text-xl font-bold">{item.name}</p>
              <p className="text-xl font-bold">{item.price}</p>
            </div>
          ))}
          <div className="flex flex-row gap-4 justify-between">
            <input
              {...register2("ItemName", {
                required: "Item name is required",
              })}
              type="text"
              placeholder="Item Name"
              className=" py-5 px-5 w-1/3 bg-slate-100 text-center font-bold text-2xl"
              required
            ></input>
            {errors2.ItemName && (
              <p className="text-red-500">{`${errors2.ItemName.message}`}</p>
            )}
            <input
              {...register2("ItemPrice", {
                required: "Item price is required",
                pattern: {
                  value: /^[0-9]+(\.[0-9]{1,2})?$/, // Added pattern to allow up to 2 decimal places
                  message: "Item price must be a number with up to 2 decimal places",
                },
              })}
              type="text"
              placeholder="Item price"
              className=" py-5 px-5 w-1/3 bg-slate-100 text-center font-bold text-2xl"
            ></input>
            {errors2.ItemPrice && (
              <p className="text-red-500">{`${errors2.ItemPrice.message}`}</p>
            )}
          </div>
          <button
            onClick={handleSubmit2(addItem)}
            type="submit"
            className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 border border-blue-700 rounded max-w-2xl mx-auto"
          >
            Add item
          </button>

          <input
            {...register("Heading")}
            type="text"
            placeholder="Heading of document"
            className="block py-5 max-w-5xl w-full bg-slate-100 text-center font-bold text-2xl" // Add w-full for full width, font-bold for bold text, and text-2xl for bigger text
          ></input>

          {errors.Heading && (
            <p className="text-red-500">{`${errors.Heading.message}`}</p>
          )}
          <input
            {...register("GSTNumber")}
            type="text"
            placeholder="GST Number "
            className="block py-5 max-w-5xl w-full bg-slate-100 text-center font-bold text-2xl"
          ></input>
          {errors.GSTNumber && (
            <p className="text-red-500">{`${errors.GSTNumber.message}`}</p>
          )}

         
          <button
            disabled={isSubmitting}
            onClick={handleSubmit(onSubmit)}
            type="submit"
            className="text-white text-2xl bg-gradient-to-r from-cyan-400 via-cyan-500 to-cyan-600 hover:bg-gradient-to-br focus:ring-4 focus:outline-none focus:ring-cyan-300 dark:focus:ring-cyan-800 font-medium rounded-lg  px-5 py-2.5 text-center me-2 mb-2"
          >
            Submit
          </button>
        </form>
      </div>
    </Fragment>
  );
}
