export const GTALogo = () => {
  return (
    <div className="flex flex-col items-center gap-4">
      <div className="relative pixel-box bg-card/90 px-8 py-4">
        <h1 className="font-display text-xl md:text-3xl tracking-tight pixel-text-shadow">
          <span className="gta-text-gradient">PERSON</span>
          <span className="text-foreground"> SEARCH</span>
        </h1>
      </div>
      <p className="text-primary text-base md:text-lg font-display tracking-wide uppercase pixel-text-shadow">
        ★ Find Similar Faces ★
      </p>
    </div>
  );
};
