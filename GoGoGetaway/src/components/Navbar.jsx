import React from 'react';
import { useNavigate } from 'react-router-dom';

const Navbar = () => {
  const navigate = useNavigate();
  return (
    <div className="flex justify-between bg-light-blue px-24 py-12">
      <h1 className="text-xl">GoGoGetaway</h1>
      <div className="flex items-center justify-evenly gap-16 font-poppins">
        <nav>
          <ul class="flex list-none space-x-8">
            <li>
              <a href="#" class="text-lg hover:text-blue-700">
                Home
              </a>
            </li>
            <li>
              <a href="#" class="text-lg hover:text-blue-700">
                About Us
              </a>
            </li>
            <li>
              <a href="#" class="text-lg hover:text-blue-700">
                Deals
              </a>
            </li>
          </ul>
        </nav>
        <button
          className="btn cursor-pointer bg-blue-400 text-lg"
          onClick={() => navigate('/signup')}
        >
          Sign Up
        </button>
      </div>
    </div>
  );
};

export default Navbar;