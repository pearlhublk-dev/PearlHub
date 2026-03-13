import { useAppContext } from "@/context/AppContext";

interface ShareButtonsProps {
  title: string;
  description?: string;
  url?: string;
}

const ShareButtons = ({ title, description = "", url }: ShareButtonsProps) => {
  const { showToast } = useAppContext();
  const shareUrl = url || window.location.href;
  const text = `${title} - ${description}`;

  const handleNativeShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({ title, text: description, url: shareUrl });
      } catch {}
    }
  };

  const copyLink = async () => {
    await navigator.clipboard.writeText(shareUrl);
    showToast("Link copied!", "success");
  };

  const channels = [
    { icon: "📘", label: "Facebook", url: `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(shareUrl)}` },
    { icon: "🐦", label: "X", url: `https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}&url=${encodeURIComponent(shareUrl)}` },
    { icon: "💬", label: "WhatsApp", url: `https://wa.me/?text=${encodeURIComponent(text + " " + shareUrl)}` },
    { icon: "💼", label: "LinkedIn", url: `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(shareUrl)}` },
    { icon: "✉️", label: "Email", url: `mailto:?subject=${encodeURIComponent(title)}&body=${encodeURIComponent(text + "\n\n" + shareUrl)}` },
  ];

  return (
    <div className="flex items-center gap-1.5 flex-wrap">
      <span className="text-xs text-muted-foreground font-semibold mr-1">Share:</span>
      {channels.map(ch => (
        <a key={ch.label} href={ch.url} target="_blank" rel="noopener noreferrer" title={ch.label}
          className="w-8 h-8 rounded-full bg-background border border-border flex items-center justify-center text-sm hover:bg-primary/10 hover:border-primary/30 transition-all">
          {ch.icon}
        </a>
      ))}
      <button onClick={copyLink} title="Copy Link"
        className="w-8 h-8 rounded-full bg-background border border-border flex items-center justify-center text-sm hover:bg-primary/10 hover:border-primary/30 transition-all">
        🔗
      </button>
      {typeof navigator.share === "function" && (
        <button onClick={handleNativeShare} title="Share"
          className="w-8 h-8 rounded-full bg-background border border-border flex items-center justify-center text-sm hover:bg-primary/10 hover:border-primary/30 transition-all">
          📤
        </button>
      )}
    </div>
  );
};

export default ShareButtons;
