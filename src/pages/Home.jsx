import React from "react";
import Navbar from "../components/Navbar";
import Hero from "../components/Hero";
import Information from "../components/Information";
import Footer from "../components/Footer";
import Leaning from "../components/Leaning";

function Home() {
  return (
    <div>
        <Navbar />
      <Hero />
         <Information />
        <Leaning /> 
        <Footer />
    </div>
  );
}

export default Home;
