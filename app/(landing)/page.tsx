"use client";
import axios from "axios";
import React, { useEffect, useState } from "react";

const DashboardPage = () => {
  const [loading, setLoading] = useState<boolean>(false);
  const [data, setData] = useState<any>([]);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const response = await axios.get("/api/schedule");
        setData(response.data);
      } catch (error) {
        console.error("Error during fetching dashboard:", error);
        alert("An error occurred during fetching dashboard");
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  console.log(data);

  return (
    <div>
      DashboardPage
      <div className="">
        {data.map((item: any) => (
          <div key={item.STT}>
            <h3>{item.name}</h3>
            <p>{item.teacher}</p>
          </div>
        ))}
      </div>
    </div>
  );
};

export default DashboardPage;
