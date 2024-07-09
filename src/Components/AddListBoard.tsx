import React, { useState } from "react";
import Button from "./Button";
import Icon from "./Icon";
import { MdAdd } from "react-icons/md";
import { useDispatch } from "react-redux";
import { AppDispatch } from "../Redux/Store";
import { BE_addTaskList } from "../Backend/Queries";

const AddListBoard = () => {
  const [addLoading, setAddLoading] = useState(false);
  const dispatch = useDispatch<AppDispatch>();

  const handleTaskList = () => {
    BE_addTaskList(dispatch, setAddLoading);
  };

  return (
    <>
      <Button
        text="Add New ListBoard"
        onClick={handleTaskList}
        secondary
        className="hidden md:flex"
        loading={addLoading}
      />
      <Icon
        onClick={handleTaskList}
        IconName={MdAdd}
        className="block md:hidden"
        loading={addLoading}
      />
    </>
  );
};

export default AddListBoard;
