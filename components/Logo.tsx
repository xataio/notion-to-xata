import clsx from "clsx";
import { FC, useEffect, useState } from "react";

type Props = {
  width?: number;
};

export const Logo: FC<Props> = ({ width = 56 }) => {
  const [isVideoFinished] = useState(false);

  return (
    <div className="relative">
      <img
        src="/img/logo.svg"
        alt="Logo"
        style={{ height: width }}
        className={clsx(
          "absolute transition duration-500",
          isVideoFinished ? "opacity-100" : "opacity-0"
        )}
      />
      <video
        autoPlay
        playsInline
        muted
        controls={false}
        //onEnded={() => setIsVideoFinished(true)}
        loop={false}
        height={width}
        style={{ height: width }}
        className={clsx(
          "transition duration-500",
          isVideoFinished ? "opacity-0" : "opacity-100"
        )}
      >
        <source src="/img/logo.mov" type='video/mp4; codecs="hvc1"' />
        <source src="/img/logo.webm" type='video/webm; codecs="vp8"' />
      </video>
    </div>
  );
};
