import {AbsoluteFill, interpolate, useCurrentFrame} from 'remotion';
import { Sequence } from "remotion";
import React from "react"
import { Box } from "@mui/material"
import { ImageSeq } from "@/models/ImageSequence"
import Image from "next/image";

const ImageSeqMove: React.FC<{imageSeq: ImageSeq }> = ({ imageSeq }) => {
  const frame = useCurrentFrame();
  const opacity = interpolate(frame, [0, 20], [0, 1], {
    extrapolateRight: "clamp",
  })

  return imageSeq.images.map((image, index) => {
    return (
      <Sequence from={5 * index} durationInFrames={5 * (index + 1) } key={index}>
        <Box
          sx={{
            position: "absolute",
            width: image.width,
            height: image.height,
          }}
        >
          <Image
            src={image.url}
            alt={"uploaded"}
            width={image.width}
            height={image.height}
          />
        </Box>
      </Sequence>
    )
  })
}

export type ImageVideoRendererProps = {
  title: string;
  imageSeqs?: ImageSeq[];
}

export const ImageVideoRenderer:React.FC<ImageVideoRendererProps> = (
  {title, imageSeqs}
) => {
  return (
    <AbsoluteFill>
      {imageSeqs?.map((imageSeq, index) => {
        return <ImageSeqMove imageSeq={imageSeq} key={index}/>
      })}
    </AbsoluteFill>
  );
};