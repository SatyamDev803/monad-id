export function Footer() {
  return (
    <footer className="border-t border-border/50 bg-card">
      <div className="mx-auto max-w-6xl px-6 py-8">
        <div className="flex flex-col items-center justify-between gap-4 md:flex-row">
          <p className="text-sm text-muted-foreground">
            MonadID — Zero-Knowledge Identity on Monad
          </p>
          <div className="flex gap-6 text-sm text-muted-foreground">
            <a
              href="https://testnet.monadexplorer.com/address/0x2541a918E3274048b18e9841D6391b64CDdCC4b0"
              target="_blank"
              rel="noopener noreferrer"
              className="transition-colors hover:text-foreground"
            >
              Explorer
            </a>
            <a
              href="https://monad.xyz"
              target="_blank"
              rel="noopener noreferrer"
              className="transition-colors hover:text-foreground"
            >
              Monad
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}
