import { useEffect, useState } from "react";

interface BIPEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed" }>;
}

export function InstallPrompt() {
  const [evt, setEvt] = useState<BIPEvent | null>(null);
  const [hidden, setHidden] = useState(false);
  const [iosHint, setIosHint] = useState(false);

  useEffect(() => {
    const handler = (e: Event) => {
      e.preventDefault();
      setEvt(e as BIPEvent);
    };
    window.addEventListener("beforeinstallprompt", handler);

    // iOS Safari hint (no beforeinstallprompt support)
    const ua = window.navigator.userAgent;
    const isIOS = /iPhone|iPad|iPod/i.test(ua);
    const standalone =
      window.matchMedia("(display-mode: standalone)").matches ||
      // @ts-expect-error iOS
      window.navigator.standalone === true;
    if (isIOS && !standalone && !sessionStorage.getItem("dem-ios-hint-closed")) {
      setIosHint(true);
    }

    return () => window.removeEventListener("beforeinstallprompt", handler);
  }, []);

  if (hidden) return null;

  if (evt) {
    return (
      <div className="install-banner">
        <span>📲</span>
        <span>Installer DEM sur votre téléphone</span>
        <button
          onClick={async () => {
            await evt.prompt();
            await evt.userChoice;
            setEvt(null);
          }}
        >
          Installer
        </button>
        <button className="close" onClick={() => setHidden(true)} aria-label="Fermer">
          ✕
        </button>
      </div>
    );
  }

  if (iosHint) {
    return (
      <div className="install-banner">
        <span>📲</span>
        <span>
          Pour installer : <strong>Partager</strong> → <strong>Sur l'écran d'accueil</strong>
        </span>
        <button
          className="close"
          onClick={() => {
            sessionStorage.setItem("dem-ios-hint-closed", "1");
            setIosHint(false);
          }}
          aria-label="Fermer"
        >
          ✕
        </button>
      </div>
    );
  }

  return null;
}