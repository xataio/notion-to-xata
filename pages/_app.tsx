import { FeedbackButton } from "../components/FeedbackButton";
import "../styles/globals.scss";

const App = ({ Component, pageProps }) => {
  return (
    <>
      <Component {...pageProps} />
      <FeedbackButton />
    </>
  );
};

export default App;
