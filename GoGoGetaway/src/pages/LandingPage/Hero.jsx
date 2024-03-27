import React, { useState } from 'react';
import HeroImage from '../../assets/profile/HeroSceneryImage.png';
import { Typewriter } from 'react-simple-typewriter';
import { useNavigate } from 'react-router-dom';
import SearchBar from '@/components/SearchBar';

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
    <div className="relative h-500">
      <img
        src={HeroImage}
        style={{
          position: 'absolute',
          top: '138px',
          left: '350px',
          width: '1033.5px',
          height: '802px',
        }}
        alt="Hero Image"
      />
      <div className="absolute top-0 left-0 p-8">
        <div className="relative flex flex-col items-start justify-center gap-12 p-20">
          <div className="flex h-16 w-full">
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
            interactive maps tailored just for you. 
          </div>
        </div>
      </div>
    </div>
  );
};

export default Hero;
