import React, { useEffect } from "react"
import { Box, Button, Container, Dialog, DialogProps, Grid, Stack, TextField, Typography } from "@mui/material"
import Image from "next/image";
import { ImageInfo, VItemInfo, useApi } from "@/models/ImageSequence"
import { TitleDescriptionActionDialog } from "@/components/Dialogs"
import { OkCancelButtons } from "@/components/DialogButtons"
import DeleteIcon from '@mui/icons-material/Delete'
import KeyboardDoubleArrowLeftIcon from '@mui/icons-material/KeyboardDoubleArrowLeft'
import KeyboardDoubleArrowRightIcon from '@mui/icons-material/KeyboardDoubleArrowRight'

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

export const ImageSeqUploadDialog: React.FC<{
  open: boolean
  onClose: () => void
}> = ({open, onClose}) => {
  const api = useApi()
  const [loadingImages, setLoadingImages] = React.useState<ImageInfo[]>([])
  const [validationMeses, setValidationMes] = React.useState<string[]>([])
  const [vItemInfo, setVItemInfo]
    = React.useState<VItemInfo>(new VItemInfo())

  const onChangeImageSeqInfo = (updates: Partial<VItemInfo>) => {
    setVItemInfo(prevState => prevState.update(updates))
  }
  const onUploadImages = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const images = await api.imageBulkCreate(Array.from(e.target.files))
      setLoadingImages(prevState => [
        ...prevState,
        ...images,
      ])
    }
  }

  const onDeleteImage = async (destroyImage: ImageInfo) => {
    api.imageDestroy(destroyImage)
    const newImages = loadingImages.filter(image => destroyImage != image)
    setLoadingImages(newImages)
  }

  const onLeft = (image: ImageInfo) => {
    const index = loadingImages.indexOf(image)
    if(index === 0){
      return
    }
    const newImages = [...loadingImages]
    newImages[index] = loadingImages[index - 1]
    newImages[index - 1] = image
    setLoadingImages(newImages)
  }

  const onRight = (image: ImageInfo) => {
    const index = loadingImages.indexOf(image)
    if(index >= loadingImages.length - 1){
      return
    }
    const newImages = [...loadingImages]
    newImages[index] = loadingImages[index + 1]
    newImages[index + 1] = image
    setLoadingImages(newImages)
  }

  useEffect(() => {
    const validationMeses: string[] = []
    const firstImage: ImageInfo | undefined = loadingImages[0]
    if(!loadingImages.every(image => image.width === firstImage.width && image.height === firstImage.height)) {
      validationMeses.push("全ての画像を同じサイズにしてください。")
    }

    if(!vItemInfo.isValid()) {
      validationMeses.push("アイテム情報を入力してください。")
    }
    setValidationMes(validationMeses)
  }, [loadingImages, vItemInfo])

  return (
    <TitleDescriptionActionDialog
      title="アイテム追加"
      description="連続する画像のコマを読み込みます。"
      action={
        <OkCancelButtons
          onClickOk={() => {
            api.imageSeqCreate({
              images: loadingImages,
              info: vItemInfo
            })
            setLoadingImages([])
            onClose()
          }}
          isOkDisabled={!!validationMeses.length || loadingImages.length === 0}
          onClickCancel={() => {
            api.imageBulkDestroy(loadingImages)
            setLoadingImages([])
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
        <Stack direction="row" spacing={2}>
          <TextField
            id="outlined-basic"
            label="名前"
            variant="outlined"
            value={vItemInfo.name}
            onChange={(e) => onChangeImageSeqInfo({ name: e.target.value })}
          />
        </Stack>
        <Button variant="contained" component="label" style={{ margin: 8 }}>
          画像を追加
          <input multiple hidden type="file" onChange={onUploadImages} />
        </Button>
        <Grid container spacing={1}>
          {loadingImages.map((image, index) => (
            <Grid key={index} item sx={{ margin: 4, maxWidth: 120, maxHeight: 160 }}>
              <ItemControlIcons
                onDelete={onDeleteImage}
                onLeft={onLeft}
                onRight={onRight}
                item={image}
              />
              <Image
                src={image.url}
                alt={`uploaded ${index}`}
                width={image.width}
                height={image.height}
                style={{maxWidth: 120, maxHeight: 120  }}
              />
              <Typography >size: {image.width}x{image.height}</Typography>
              <Typography variant="body1" noWrap textOverflow="ellipsis">
                {image.name}
              </Typography>
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

