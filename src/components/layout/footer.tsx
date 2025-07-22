export function Footer() {
  return (
    <footer className="flex flex-col sm:flex-row items-center justify-between gap-4 px-8 py-8 border-t border-border text-sm bg-background/80 relative z-10">
      <span>&copy; {new Date().getFullYear()} Trash Mboa - Douala. Tous droits réservés.</span>
      <div className="flex gap-6">
        <a href="#accessibilite" className="hover:underline underline-offset-4">Accessibilité</a>
        <a href="#confidentialite" className="hover:underline underline-offset-4">Confidentialité</a>
      </div>
    </footer>
  );
} 