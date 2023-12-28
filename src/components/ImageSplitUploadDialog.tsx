import React, { useEffect } from "react"
import { Box, Button, Container, Dialog, DialogProps, Grid, Stack, TextField, Typography } from "@mui/material"
import Image from "next/image";
import { ImageInfo, VItemInfo, useApi, ImageSplit } from "@/models/ImageSequence"
import { TitleDescriptionActionDialog } from "@/components/Dialogs"
import { OkCancelButtons } from "@/components/DialogButtons"
import DeleteIcon from '@mui/icons-material/Delete'
import KeyboardDoubleArrowLeftIcon from '@mui/icons-material/KeyboardDoubleArrowLeft'
import KeyboardDoubleArrowRightIcon from '@mui/icons-material/KeyboardDoubleArrowRight'
import { useRecoilState } from "recoil"

// Propsの型定義
interface ItemControlIconsProps<P> {
  onDelete: (item: P) => void;
  onLeft: (item: P) => void;
  onRight: (item: P) => void;
  item: P;
}

// コンポーネントの型定義
export const ItemControlIcons = <P extends {}>({
  onDelete,
  onLeft,
  onRight,
  item,
}: ItemControlIconsProps<P>): React.ReactElement  => {

  const iconSx = {
    ":hover": {
      color: "blue",
      cursor: "pointer",
    },
  }
  return (
    <Stack flex={1} gap={0.5}>
      <Stack direction="row" flex={1}>
        <Stack flex={1}>
          <KeyboardDoubleArrowLeftIcon
            onClick={() => onLeft(item)}
            sx={iconSx}
          >
          </KeyboardDoubleArrowLeftIcon>
        </Stack>
        <Stack flex={1}>
          <KeyboardDoubleArrowRightIcon
            onClick={() => onRight(item)}
            sx={iconSx}
          >
          </KeyboardDoubleArrowRightIcon>
        </Stack>
        <Stack direction="row" justifyContent="end">
          <DeleteIcon
            onClick={() => onDelete(item)}
            sx={{...iconSx,
              ":hover": {
                color: "red",
              },
            }}
          >
          </DeleteIcon>
        </Stack>
      </Stack>
    </Stack>
  )
}

export const ImageSplitUploadDialog: React.FC<{
  open: boolean
  onClose: () => void
}> = ({open, onClose}) => {
  const api = useApi()
  const [validationMeses, setValidationMes] = React.useState<string[]>([])
  const [imageSplits, setImageSplits] = React.useState<ImageSplit>();
  const [splitNum, setSplitNum] = React.useState<number | undefined>(1);
  const [name, setName] = React.useState<string>("");

  const onChangeImageSeqInfo = (updates: Partial<VItemInfo>) => {
    setImageSplits(prevState => {
      if(!prevState) return prevState
      return new ImageSplit(prevState.sourceImage, prevState.info.update(updates))
    })
  }

  const onUploadImages = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      if(imageSplits) api.imageSplitDestroy(imageSplits)
      const images = await api.imageBulkCreate([Array.from(e.target.files)[0]])
      setImageSplits(new ImageSplit(images[0], new VItemInfo()))
    }
  }

  useEffect(() => {
    const validationMeses: string[] = []

    if(!imageSplits?.info.isValid()) {
      validationMeses.push("アイテム情報を入力してください。")
    }
    if(!splitNum || splitNum < 1) {
      validationMeses.push("分割数は1以上を指定してください。")
    }
    setValidationMes(validationMeses)
  }, [imageSplits, splitNum])

  return (
    <TitleDescriptionActionDialog
      title="アイテム追加"
      description="連続する画像のコマを読み込みます。"
      action={
        <OkCancelButtons
          onClickOk={() => {
            if(!imageSplits) return onClose()
            setImageSplits(undefined)
            onClose()
          }}
          isOkDisabled={!!validationMeses.length || !imageSplits}
          onClickCancel={() => {
            if(imageSplits) api.imageSplitDestroy(imageSplits)
            setImageSplits(undefined)
            onClose()
          }}
        />
      }
      open={open}
      fullWidth
      maxWidth="lg"
    >
      <Box sx={{
        width: 960,
        height: 540,
      }}>
        <Stack direction="row" spacing={4}>
          <TextField
            id="outlined-basic"
            label="名前"
            variant="outlined"
            value={name}
            onChange={(e) => {
              setName(e.target.value)
              onChangeImageSeqInfo({ name: e.target.value })
            }}
          />
        </Stack>
        <Stack direction="row" spacing={4}>
          <Button variant="contained" component="label" style={{ margin: 8 }}>
            画像を追加
            <input multiple hidden type="file" onChange={onUploadImages} />
          </Button>
        </Stack>
        <Stack direction="row" spacing={4}>
          <TextField
            id="outlined-basic"
            label="分割数(横)"
            type="number"
            variant="outlined"
            value={splitNum}
            onChange={(e) => {
              const splitNum = Number(e.target.value)
              setSplitNum(splitNum)
              if(splitNum < 1) return
              if(!imageSplits) return

              const newImageSplit = imageSplits.copyAndSetSplitNum(splitNum, 1)
              api.imageSplitUpdate(imageSplits, newImageSplit)
              setImageSplits(imageSplits)
              console.log(splitNum)
              console.log(imageSplits)
            }}
          />
        </Stack>
        {imageSplits && (
          <Grid item sx={{ margin: 4, maxWidth: 120, maxHeight: 160 }}>
            <Image
              src={imageSplits.sourceImage.url}
              alt={`uploaded `}
              width={imageSplits.sourceImage.width}
              height={imageSplits.sourceImage.height}
              style={{maxWidth: 120, maxHeight: 120  }}
            />
            <Typography >size: {imageSplits.sourceImage.width}x{imageSplits.sourceImage.height}</Typography>
            <Typography variant="body1" noWrap textOverflow="ellipsis">
              {imageSplits.sourceImage.name}
            </Typography>
          </Grid>
        )}
        <Grid container spacing={1}>
          {imageSplits?.images.map((image, index) => (
            <Grid key={index} item sx={{ margin: 4, maxWidth: 120, maxHeight: 160 }}>
              <Image
                src={image.url}
                alt={`uploaded ${index}`}
                width={image.width}
                height={image.height}
                style={{maxWidth: 120, maxHeight: 120  }}
              />
            </Grid>
          ))}
        </Grid>
      </Box>
      <Stack direction="row" spacing={2} justifyContent="end">
        <Stack direction="column" spacing={2}>
          {validationMeses.map((mes, index) => (
            <Typography key={index} variant="body1" color={"red"}>
              {mes}
            </Typography>
          ))}
        </Stack>
      </Stack>
    </TitleDescriptionActionDialog>
  );
};

