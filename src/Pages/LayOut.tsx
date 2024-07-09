import React from "react";
import { Outlet } from "react-router";
import Header from "../Components/Header";

type Props = {};

function LayOut({}: Props) {
  return (
    <div className=" flex flex-col">
      <Header />
      <div className="bg-pattern max-h-[100vh]">
        <Outlet />
      </div>
    </div>
  );
}

export default LayOut;


