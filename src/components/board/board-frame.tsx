import { Crown, Star } from "lucide-react";
import type { Synagogue } from "@/types/domain";

interface BoardFrameProps {
  synagogue: Pick<Synagogue, "name" | "address">;
  headerEnd?: React.ReactNode;
  subheading?: React.ReactNode;
  footerStart?: React.ReactNode;
  footerEnd?: React.ReactNode;
  frameClassName?: string;
  children: React.ReactNode;
}

// Presentational chrome of the board: ornaments, gold frame, synagogue header
// and footer. Used by the live board and by the admin preview.
export function BoardFrame({ synagogue, headerEnd, subheading, footerStart, footerEnd, frameClassName = "min-h-screen p-[3vw]", children }: BoardFrameProps) {
  return (
    <>
      <div className="board-ornament board-ornament-right" aria-hidden="true"><Star /></div>
      <div className="board-ornament board-ornament-left" aria-hidden="true"><Star /></div>
      <div className={`board-frame relative flex flex-col ${frameClassName}`}>
        <header className="flex items-start justify-between gap-6 border-b border-[color:var(--board-gold-muted)] pb-5">
          <div>
            <p className="board-kicker text-2xl">{synagogue.address}</p>
            <div className="board-title-lockup mt-1">
              <Crown className="board-title-crown" aria-hidden="true" />
              <h1 className="text-4xl font-black leading-none md:text-7xl">{synagogue.name}</h1>
            </div>
            {subheading ? <p className="mt-1 text-xl text-board-foreground/65 md:text-2xl">{subheading}</p> : null}
          </div>
          {headerEnd}
        </header>
        <div className="grid min-h-0 flex-1 place-items-stretch overflow-hidden py-8">{children}</div>
        <footer className="flex items-center justify-between border-t border-[color:var(--board-gold-muted)] pt-4 text-2xl text-board-foreground/70">
          <div>{footerStart}</div>
          <div>{footerEnd}</div>
        </footer>
      </div>
    </>
  );
}
