import { useState } from "react";
import { SplashScreen } from "./SplashScreen";
import { Login } from "./Login";

const Index = () => {
  const [showSplash, setShowSplash] = useState(true);

  if (showSplash) {
    return <SplashScreen onComplete={() => setShowSplash(false)} />;
  }

  return <Login />;
};

export default Index;
