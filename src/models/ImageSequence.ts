import { atom, useRecoilState } from "recoil"

export type ImageInfo = {
  fileId: number
  file: File
  element: HTMLImageElement
  width: number
  height: number
  name: string
  url: string
  crop: {
    x: number
    y: number
    width: number
    height: number
  }
}

// SplitImageInfo
export class VItemInfo {
  name: string
  isFlipX: boolean = false
  imageKeyFrames: number[] = []

  constructor(name: string = "") {
    this.name = name;
  }
  update(updates: Partial<VItemInfo>): VItemInfo {
    const updatedInstance = new VItemInfo()
    return Object.assign(updatedInstance, this, updates)
  }

  isValid(): boolean {
    if (!this.name) return false;
    return true;
  }
}

const imageListState = atom<ImageInfo[]>({
  key: "imageListState",
  default: [],
});


const useImage = () => {
  const [images, setImages] = useRecoilState(imageListState);

  const imageBulkCreate = async (files: File[]): Promise<ImageInfo[]>  => {
    const loadImage = (file: File): Promise<ImageInfo> => {
      return new Promise((resolve) => {
        const url = URL.createObjectURL(file);
        const img = new window.Image();
        img.onload = () => {
          const newImage: ImageInfo = {
            fileId: files.indexOf(file),
            file,
            element: img,
            width: img.width,
            height: img.height,
            name: file.name,
            url,
            crop: {
              x: 0,
              y: 0,
              width: img.width,
              height: img.height,
            },
          };
          setImages((prevImages) => [...prevImages, newImage]);
          resolve(newImage);
        };
        img.src = url;
      });
    };
    const imagesPromises = files.map(file => loadImage(file));
    return await Promise.all(imagesPromises);
  }

  const imageDestroy = (destroyImage :ImageInfo) => {
    setImages(
      (prevImageSeqs) => {
        URL.revokeObjectURL(destroyImage.url) //　Imageオブジェクトの解放
        return images.filter(image => destroyImage != image)
      }
    )
  }

  const imageBulkDestroy = (destroyImages :ImageInfo[]) => {
    setImages(
      (prevImageSeqs) => {
        destroyImages.forEach(image => URL.revokeObjectURL(image.url))
        return prevImageSeqs.filter(image => !destroyImages.includes(image))
      }
    )
  }

  return {
    images,
    imageBulkCreate,
    imageDestroy,
    imageBulkDestroy,
  }
}

export class ImageItemBase {
  info: VItemInfo;
  images: ImageInfo[];

  constructor(images: ImageInfo[], info: VItemInfo) {
    this.images = images;
    this.info = info;
  }
}

export class ImageSeq extends ImageItemBase{
  constructor(images: ImageInfo[], info: VItemInfo) {
    super(images, info);
  }
}

// 画像データ用のRecoil State（Atom）
const imageSeqListState = atom<ImageSeq[]>({
  key: "ImageSeqListState",
  default: [],
});

const useImageSequence = () => {
  const [imageSeqs, setImageSeqs] = useRecoilState(imageSeqListState);
  const { imageBulkCreate, imageBulkDestroy } = useImage()

  const imageSeqCreateFromFiles = async (files: File[], vItemInfo: VItemInfo)  => {
    const newImageSeq: ImageSeq = {
      images: await imageBulkCreate(files),
      info: vItemInfo,
    }
    setImageSeqs((prevImageSeqs) => [...prevImageSeqs, newImageSeq])
  }

  const imageSeqCreate = (imageSeq: ImageSeq)  => {
    setImageSeqs((prevImageSeqs) => [...prevImageSeqs, imageSeq])
    return imageSeq
  }

  const imageSeqUpdate = (prev: ImageSeq, update: ImageSeq) => {
    setImageSeqs(
      (prevImageSeqs) => {
        return [
          ...imageSeqs.filter(imageSeq => prev != imageSeq),
          update
        ]
      }
    )
  }

  const imageSeqDestroy = (destroyImageSeq :ImageSeq) => {
    setImageSeqs(
      (prevImageSeqs) => {
        imageBulkDestroy(destroyImageSeq.images)
        return prevImageSeqs.filter(imageSeq => destroyImageSeq != imageSeq)
      }
    )
  }

  const imageSeqBulkDestroy = (destroyImageSeqs :ImageSeq[]) => {

    setImageSeqs(
      (prevImageSeqs) => {
        destroyImageSeqs.forEach(imageSeq => imageBulkDestroy(imageSeq.images))
        return prevImageSeqs.filter(imageSeq => !destroyImageSeqs.includes(imageSeq))
      }
    )
  }

  return {
    imageSeqs,
    imageSeqCreate,
    imageSeqCreateFromFiles,
    imageSeqUpdate,
    imageSeqDestroy,
    imageSeqBulkDestroy,
  }
}

export class ImageSplit extends ImageItemBase{
  sourceImage: ImageInfo;
  constructor(sourceImage: ImageInfo, info: VItemInfo, images: ImageInfo[] = []) {
    if (images.length == 0) images.push(sourceImage)
    super(images, info);
    this.sourceImage = sourceImage;
  }

  copyAndSetSplitNum(splitNumX: number, splitNumY: number) {
    const newImages: ImageInfo[] = Array(splitNumX * splitNumY).fill(null).map(() => {
      return { ...this.sourceImage };
    })

    newImages.forEach((image, index) => {
      const { width, height } = image
      const splitWidth = width / splitNumX
      const splitHeight = height / splitNumY
      const splitX = index % splitNumX
      const splitY = Math.floor(index / splitNumX)
      image.crop = {
        x: splitX * splitWidth,
        y: splitY * splitHeight,
        width: splitWidth,
        height: splitHeight,
      }
    })

    return new ImageSplit(this.sourceImage, this.info, newImages)
  }
}

const imageSplitListState = atom<ImageSplit[]>({
  key: "ImageSplitListState",
  default: [],
});

const useImageSplit = () => {
  const [imageSplits, setImageSplits] = useRecoilState(imageSplitListState);
  const { imageBulkCreate, imageDestroy, imageBulkDestroy } = useImage()

  const imageSplitCreateFromFile = async (file: File, vItemInfo: VItemInfo)  => {
    const newImageSplit = new ImageSplit(
      (await imageBulkCreate([file]))[0],
      vItemInfo,
    )
    setImageSplits((prevImageSplits) => [...prevImageSplits, newImageSplit])
  }

  const imageSplitCreate = (imageSplit: ImageSplit)  => {
    setImageSplits((prevImageSplits) => [...prevImageSplits, imageSplit])
    return imageSplit
  }

  const imageSplitUpdate = (prev :ImageSplit,update :ImageSplit) => {
    setImageSplits(
      (prevImageSplits) => {
        return [
          ...imageSplits.filter(imageSplit => prev != imageSplit),
          update
        ]
      }
    )
  }

  const imageSplitDestroy = (destroyImageSplit :ImageSplit) => {
    setImageSplits(
      (prevImageSplits) => {
        imageDestroy(destroyImageSplit.sourceImage)
        return prevImageSplits.filter(imageSplit => destroyImageSplit != imageSplit)
      }
    )
  }

  const imageSplitBulkDestroy = (destroyImageSplits :ImageSplit[]) => {
    setImageSplits(
      (prevImageSplits) => {
        destroyImageSplits.forEach(imageSplit => imageBulkDestroy([imageSplit.images[0]]))
        return prevImageSplits.filter(imageSplit => !destroyImageSplits.includes(imageSplit))
      }
    )
  }

  return {
    imageSplits,
    imageSplitCreate,
    imageSplitCreateFromFile,
    imageSplitUpdate,
    imageSplitDestroy,
    imageSplitBulkDestroy,
  }
}

export const useApi = () => {
  return {
    ...useImage(),
    ...useImageSequence(),
    ...useImageSplit(),
  }
}
