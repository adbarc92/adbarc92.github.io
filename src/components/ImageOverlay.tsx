import React, { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import background from '../assets/background.webp';

const ImageOverlay = () => {
  const [activeSpot, setActiveSpot] = useState(null);

  const hotspots = [
    {
      id: 'castle',
      title: 'Dark Castle',
      description:
        'An ominous castle perched atop the mountain, its spires reaching into the clouded sky.',
      position: 'left-48 top-48',
    },
    {
      id: 'dragon',
      title: 'Projects',
      description:
        'A fearsome dragon with outstretched wings, silhouetted against the massive full moon.',
      position: 'left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2',
    },
    {
      id: 'knight',
      title: 'About Me',
      description:
        'A warrior wielding a glowing blue sword, ready to face the dragon.',
      position: 'left-1/2 bottom-24 -translate-x',
    },
    {
      id: 'moon',
      title: 'Projects',
      description:
        'A warrior wielding a glowing blue sword, ready to face the dragon.',
      position: 'left-1/2 top-1/4 -translate-x-1/2 -translate-y-1/2',
    },
  ];

  return (
    <div className="w-full max-w-4xl mx-auto relative">
      <Card className="bg-slate-900 text-white overflow-hidden">
        <CardContent className="p-0 relative">
          {/* Base Image */}
          <img
            src={background}
            alt="Epic background photo"
            className="w-full h-auto"
          />

          {/* Interactive Hotspots */}
          {hotspots.map((spot) => (
            <div key={spot.id} className={`absolute ${spot.position} group`}>
              {/* Hotspot Button */}
              <button
                className="w-12 h-12 rounded-full bg-white/10 backdrop-blur-sm border-2 border-white/50
                         hover:bg-white/20 transition-all duration-300 cursor-pointer"
                onMouseEnter={() => setActiveSpot(spot.id)}
                onMouseLeave={() => setActiveSpot(null)}
                aria-label={`View info about ${spot.title}`}
              >
                <span className="block w-2 h-2 bg-white/80 rounded-full mx-auto" />
              </button>

              {/* Info Popup */}
              <div
                className={`absolute z-10 w-64 p-4 rounded-lg bg-black/80 backdrop-blur-md border border-white/20
                         transition-all duration-300 ${
                           activeSpot === spot.id
                             ? 'opacity-100 visible'
                             : 'opacity-0 invisible'
                         }
                         ${
                           spot.id === 'castle'
                             ? 'left-full ml-4'
                             : spot.id === 'dragon'
                             ? 'left-1/2 -translate-x-1/2 top-full mt-4'
                             : 'right-full mr-4'
                         }`}
              >
                <h3 className="text-lg font-bold mb-2">{spot.title}</h3>
                <p className="text-sm text-gray-300">{spot.description}</p>
              </div>
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  );
};

export default ImageOverlay;
