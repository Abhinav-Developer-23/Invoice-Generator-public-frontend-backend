"use client";
import { ChangeEvent, Fragment, useState } from "react";
import { sendCsvRequest } from "@/lib/utils/apiRequestService";
import { useForm } from "react-hook-form";
import {TableDemo} from "@/components/table";
export default function Home() {
  const [file, setFile] = useState<File>();
  const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const selectedFile = e.target.files[0];
      const fileExtension = selectedFile.name.split(".").pop();
      if (fileExtension === "csv") {
        setFile(selectedFile);
      } else {
        setFile(undefined);
        alert("Please select a .csv file.");
      }
    }
  };

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    reset,
    setError,
  } = useForm();

  const onSubmit = (data: any) => {
    if (!file) {
      return;
    }

    sendCsvRequest("abcd", "gold", file);
  };

  return (
    <Fragment>
    
    <div className="max-w-full  ">
      <form className="mx-auto my-auto flex flex-col gap-y-2  ">
      <TableDemo />
        <div className="flex flex-row mx-auto">
          <div className="inline">
            <input
              type="text"
              {...register("Heading", { minLength: 3 })}
              placeholder="Heading of document"
              className=" py-5 m-5   bg-slate-100 text-center font-bold text-2xl"
            />
            {errors.Heading && (
              <p className="text-red-600 text-center">
                Heading must be at least 3 characters long.
              </p>
            )}
          </div>
          <div className="inline">
            <input
              type="text"
              {...register("GSTNumber", { minLength: 15 })}
              placeholder="GST number"
              className=" py-5 m-5   bg-slate-100 text-center font-bold text-2xl"
            />
            {errors.GSTNumber && errors.GSTNumber.type === "minLength" && (
              <p className="text-red-600">
                GST number must be at least 15 characters long.
              </p>
            )}
          </div>
        </div>
        <input type="file" onChange={handleFileChange} accept=".csv" className="mx-auto my-auto py-2 px-4 mt-4 text-xl" />
        <button className="bg-green-500 px-4 py-4 text-white font-bold text-lg w-48 mx-auto my-6" type="submit" onClick={handleSubmit(onSubmit)}>
          Submit
        </button>
      </form>
      </div>
    </Fragment>
  );
}
