
import React from 'react';
import Header from '@/components/Header';
import HeroSection from '@/components/HeroSection';
import WhyLearnSection from '@/components/WhyLearnSection';
import RoadmapSection from '@/components/RoadmapSection';
import SubtopicsSection from '@/components/SubtopicsSection';
import KeyTakeawaysSection from '@/components/KeyTakeawaysSection';
import FaqSection from '@/components/FaqSection';
import RelatedTopicsSection from '@/components/RelatedTopicsSection';
import Footer from '@/components/Footer';

const Index = () => {
  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-grow">
        <HeroSection />
        <WhyLearnSection />
        <RoadmapSection />
        <SubtopicsSection />
        <KeyTakeawaysSection />
        <FaqSection />
        <RelatedTopicsSection />
      </main>
      <Footer />
    </div>
  );
};

export default Index;
