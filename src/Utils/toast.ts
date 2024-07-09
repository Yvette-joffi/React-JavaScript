import { toast } from "react-toastify";
import { setLoadingType } from "../Types";

export const toastErr = (msg: string, setLoading?: setLoadingType) => {
  toast.error(msg);
  if (setLoading) setLoading(false);
};

export const toastScc = (msg: string, setLoading?: setLoadingType) => {
  toast.success(msg);
  if (setLoading) setLoading(false);
};

export const toastWarn = (msg: string, setLoading?: setLoadingType) => {
  toast.warning(msg);
  if (setLoading) setLoading(false);
};

export const toastInfo = (msg: string, setLoading?: setLoadingType) => {
  toast.info(msg);
  if (setLoading) setLoading(false);
};
