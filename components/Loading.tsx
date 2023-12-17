import React from "react";

const Loading = ({
  isSmall,
  isWhite,
}: {
  isSmall: boolean;
  isWhite: boolean;
}) => {
  return (
    <div
      className={`"${isSmall ? "w-3 h-3 border" : "w-10 h-10 border-4"} ${
        isWhite ? "border-white" : "border-[#EDF1D6]"
      } rounded-full animate-spin border-t-transparent"`}
    ></div>
  );
};

export default Loading;
