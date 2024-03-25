import React, { useState } from 'react';
import HeroImage from '../../assets/svgs/hero5.svg';
import { Typewriter } from 'react-simple-typewriter';

import { useNavigate } from 'react-router-dom';
import SearchBar from '@/components/SearchBar';
import TopImage from '../../assets/HeroSceneryImage.png';

const Hero = () => {
  const navigate = useNavigate(); // Hook to navigate
  const handleType = (count) => {
    // access word count number
    // console.log(count);
  };
  const handleDone = () => {
    // console.log(`Done after 5 loops!`);
  };

  return (
      
      <div className="relative flex gap-12 bg-light-blue px-24 py-12 pb-48 font-poppins">
        <div className="flex flex-col items-center justify-center gap-12">
          <div className="flex h-16 w-full ">
            {' '}
            <div className="text-5xl font-bold">
              Uncover The Secrets of{' '}
              <Typewriter
                words={['Calgary', 'Edmonton', 'Banff', 'Canmore']}
                loop={5}
                cursor
                cursorStyle="_"
                typeSpeed={70}
                deleteSpeed={50}
                delaySpeed={1000}
                onLoopDone={handleDone}
                onType={handleType}
              />
            </div>
          </div>

          <div className="text-lg font-normal text-secondary-text">
            Craft your dream trip with personalized recommendations and
            interactive maps tailored just for you. and more
          </div>
        </div>
        {/* <SearchBar /> */}
        <img src={HeroImage} className="h-96"></img>
      </div>
  );
};

export default Hero;
