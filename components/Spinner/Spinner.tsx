import { FC } from "react";
import styles from "./Spinner.module.css";

export const Spinner: FC = () => (
  <div className={styles.spinner}>
    <div></div>
    <div></div>
    <div></div>
    <div></div>
  </div>
);
