import React from 'react';
import { Facebook, Twitter, Instagram, Mail, Phone, MapPin } from 'lucide-react';

const Footer = () => {
  return (
    <footer className="bg-blue-800 text-white lg:ml-72">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Company Info */}
          <div>
            <h3 className="text-lg font-semibold mb-4">Travel Planner</h3>
            <p className="text-blue-200 text-sm">Your ultimate companion for planning unforgettable journeys and adventures around the world.</p>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="text-lg font-semibold mb-4">Quick Links</h3>
            <ul className="space-y-2">
              <li><a href="#" className="text-blue-200 hover:text-white transition">Home</a></li>
              <li><a href="#" className="text-blue-200 hover:text-white transition">Destinations</a></li>
              <li><a href="#" className="text-blue-200 hover:text-white transition">About Us</a></li>
              <li><a href="#" className="text-blue-200 hover:text-white transition">Contact</a></li>
            </ul>
          </div>

          {/* Contact Info */}
          <div>
            <h3 className="text-lg font-semibold mb-4">Contact Us</h3>
            <ul className="space-y-2">
              <li className="flex items-center">
                <Phone className="w-5 h-5 mr-2" />
                <span className="text-blue-200">+1 (123) 456-7890</span>
              </li>
              <li className="flex items-center">
                <Mail className="w-5 h-5 mr-2" />
                <span className="text-blue-200">info@travelplanner.com</span>
              </li>
              <li className="flex items-center">
                <MapPin className="w-5 h-5 mr-2" />
                <span className="text-blue-200">123 Travel St, City, Country</span>
              </li>
            </ul>
          </div>

          {/* Social Media */}
          <div>
            <h3 className="text-lg font-semibold mb-4">Follow Us</h3>
            <div className="flex space-x-4">
              <a href="#" className="text-blue-200 hover:text-white transition">
                <Facebook className="w-6 h-6" />
              </a>
              <a href="#" className="text-blue-200 hover:text-white transition">
                <Twitter className="w-6 h-6" />
              </a>
              <a href="#" className="text-blue-200 hover:text-white transition">
                <Instagram className="w-6 h-6" />
              </a>
            </div>
          </div>
        </div>

        {/* Copyright */}
        <div className="mt-8 pt-8 border-t border-blue-700 text-center text-blue-300 text-sm">
          © {new Date().getFullYear()} Travel Planner. All rights reserved.
        </div>
      </div>
    </footer>
  );
};

export default Footer;
