import { FC, PropsWithChildren, ReactNode } from "react"
import { Box, Dialog, DialogProps, Stack, Typography } from "@mui/material"


export const TitleDescriptionActionDialog: FC<
  PropsWithChildren<
    {
      title: string
      description?: string
      action: ReactNode
    } & DialogProps
  >
> = ({
  title,
  children,
  action,
  description,
  ...props
}) => {
  return (
    <Dialog {...props}>
      <Stack sx={{ p: 4, minWidth: 320 }} spacing={4}>
        <Stack gap={1}>
          <Typography variant="h6">{title}</Typography>
          {description && (
            <Typography variant="body1">{description}</Typography>
          )}
        </Stack>
        <Box>{children}</Box>
        <Box>{action}</Box>
      </Stack>
    </Dialog>
  )
}
