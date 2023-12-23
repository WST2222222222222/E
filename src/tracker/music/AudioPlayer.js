import { useRef, useState } from 'react';
import { tracks } from './data/tracks';
import DisplayTrack from './DisplayTrack';
import Controls from './Controls'

const AudioPlayer = () => {
    const [currentTrack, setCurrentTrack] = useState(tracks[0]);

    const audioRef = useRef();
  
    return (
      <div className="audio-player">
        <div className="inner">
          <DisplayTrack
            currentTrack={currentTrack}
            audioRef={audioRef}
          />
          <Controls audioRef={audioRef} />
        </div>
      </div>
    );
  };
  export default AudioPlayer;