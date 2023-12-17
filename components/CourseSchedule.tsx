import React from "react";

const CourseSchedule = ({ data }) => {
  return (
    <div>
      <h2>Course Schedule</h2>
      <div className="">
        {data.map((course) => (
          <div key={course.STT}>
            <h3>{course.name}</h3>
            <p>{course.teacher}</p>
          </div>
        ))}
      </div>
    </div>
  );
};

export default CourseSchedule;
