import { Inter } from "next/font/google"
import { Box, Button, Stack, Typography } from "@mui/material"
import { ImageVideoRenderer } from "@/components/ImageVideoRenderer"
import { Player } from "@remotion/player"
import React from "react"
import { ImageSeqUploadDialog } from "@/components/ImageSeqUploadDialog"
import { ImageSeqItemList } from "@/components/ImageSeqItemList"
import { useApi } from "@/models/ImageSequence"

const inter = Inter({ subsets: ["latin"] })

export default function Index() {
  const api = useApi()

  return (
    <Box>
      <Stack direction="row" spacing={2}>
        <ImageSeqItemList />
        <Stack>
					<Player
						component={ImageVideoRenderer}
						durationInFrames={120}
						fps={30}
						compositionWidth={1920}
						compositionHeight={1080}
						style={{
							width: 960,
							height: 540,
						}}
						inputProps={{
							title: "Hello",
							imageSeqs: api.imageSeqs,
						}}
						autoPlay
						loop
						controls
					/>
        </Stack>
      </Stack>
    </Box>
  )
}

