import React from "react";
import Icon from "./Icon";
import { MdAdd, MdDelete, MdEdit, MdKeyboardArrowDown } from "react-icons/md";
import Tasks from "./Tasks";
import { taskListType } from "../Types";

type Props = {
  singleTaskList: taskListType;
};

function SingleTaskList({ singleTaskList }: Props) {
  const { id, editMode, tasks, title } = singleTaskList;

  return (
    <div>
      <div
        className="bg-[#82b8c9] w-full md:w-[400px] gap-4 
      drop-shadow-md rounded-md min-h-[150px]"
      >
        <div
          className="flex flex-wrap items-center justify-center md:gap-4 bg-gradient-to-tr from-myBlue to-myPink bg-opacity-70
         p-3 text-white text-center m-h-[30px] overflow-hidden"
        >
          <p className=" flex-1 text-left  md:text-center">{title}</p>
          <div>
            <Icon IconName={MdEdit} />
            <Icon IconName={MdDelete} />
            <Icon IconName={MdKeyboardArrowDown} />
          </div>
        </div>
        <Tasks />
      </div>
      <Icon
        IconName={MdAdd}
        className="absolute -mt-10 ml-5 p-2 drop-shadow-lg hover:bg-myPink"
        reduceOpacityOnHover={false}
        loading
      />
    </div>
  );
}

export default SingleTaskList;
