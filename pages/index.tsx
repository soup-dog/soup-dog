import Background from "../components/Background";
import styles from "./index.module.css";


export default function IndexPage() {
    return <>
        <Background></Background>
        <div className={styles.textContainer}>
            <h1 className={styles.text}>BALLS</h1>
        </div>
    </>;
}
