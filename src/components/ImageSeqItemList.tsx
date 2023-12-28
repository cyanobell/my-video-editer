import React from "react"
import { ImageSeq, useApi } from "@/models/ImageSequence"
import { Button, Grid, Stack, Typography } from "@mui/material"
import Image from "next/image"
import { ImageSeqUploadDialog, ItemControlIcons } from "@/components/ImageSeqUploadDialog"
import { ImageSplitUploadDialog } from "@/components/ImageSplitUploadDialog"

export const ImageSeqItemList: React.FC = ({}) => {
  const api = useApi()
	const [isSeqDialogOpen, setIsSeqDialogOpen] = React.useState(false)
	const [isSplitDialogOpen, setIsSplitDialogOpen] = React.useState(false)

  return (
    <Stack
      sx={{
        minWidth: 300,
      }}
    >
      <Typography variant="h5">アイテムリスト</Typography>

      <Stack  direction="row" spacing={2}>
        <Button variant="contained" component="label" onClick={() => setIsSeqDialogOpen(true)}>追加(連番画像)</Button>
        <Button variant="contained" component="label" onClick={() => setIsSplitDialogOpen(true)}>追加(合成画像)</Button>
      </Stack>
      <Grid container spacing={1}>
        {api.imageSeqs.map((imageSeq, index) => (
          <Grid key={index} item sx={{ margin: 1, maxWidth: 120, maxHeight: 160 }}>
            <Typography>{imageSeq.info.name}</Typography>
            <Typography>{imageSeq.images.length}枚</Typography>
            <Image
              src={imageSeq.images[0].url}
              alt={`uploaded ${index}`}
              width={imageSeq.images[0].width}
              height={imageSeq.images[0].height}
              style={{maxWidth: 120, maxHeight: 120  }}
            />
          </Grid>
        ))}
      </Grid>
			<ImageSeqUploadDialog
				open={isSeqDialogOpen}
				onClose={() => {setIsSeqDialogOpen(false)}}
			/>
      <ImageSplitUploadDialog
        open={isSplitDialogOpen}
        onClose={() => {setIsSplitDialogOpen(false)}}
      />
    </Stack>
  )
}
