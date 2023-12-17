import { AuthProvider } from "@/authContext";
import React from "react";

const LandingLayout = (props: { children: React.ReactNode }) => {
  return <AuthProvider>{props.children}</AuthProvider>;
};

export default LandingLayout;
