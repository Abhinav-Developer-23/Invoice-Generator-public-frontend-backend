import { Fragment } from "react";
import HomeSideBar from "@/components/homePageSidebar";

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <Fragment>
      <HomeSideBar>{children}</HomeSideBar>
    </Fragment>
  );
}
