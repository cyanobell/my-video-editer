import { FC, PropsWithChildren } from "react"
import { Button, Stack } from "@mui/material"

export const OkCancelButtons: FC<
  PropsWithChildren<
    {
      onClickOk?: () => void
      onClickCancel?: () => void
      okLabel?: string | null
      isOkDisabled?: boolean
      cancelLabel?: string | null
    }
>> = ({
  onClickOk,
  onClickCancel,
  okLabel = "OK",
  isOkDisabled = false,
  cancelLabel = "Cancel",
}) => {
  return (
    <Stack direction="row" spacing={2} justifyContent="end">
      <Button
        onClick={onClickOk}
        variant="contained"
        component="label"
        disabled={isOkDisabled}
      >
        {okLabel}
      </Button>
      <Button
        onClick={onClickCancel}
        variant="contained"
        component="label"
        color="inherit"
        sx={{
          visibility: cancelLabel == null ? "hidden" : "visible",
        }}
      >
        {cancelLabel}
      </Button>
    </Stack>
  );
};