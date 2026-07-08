// Renders a responsive 16:9 embed for a Vimeo / YouTube / Loom URL, or a
// placeholder when no URL is configured yet. Wire real URLs in src/lib/steps.ts.
export function VideoEmbed({ url }: { url: string | null }) {
  if (!url) {
    return (
      <div className="flex aspect-video w-full items-center justify-center border border-ink/15 bg-ink/[0.03]">
        <span className="eyebrow text-ink/40">Video coming soon</span>
      </div>
    );
  }

  return (
    <div className="aspect-video w-full overflow-hidden border border-ink/15 bg-black">
      <iframe
        src={url}
        title="Setup walkthrough"
        className="h-full w-full"
        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; fullscreen"
        allowFullScreen
      />
    </div>
  );
}
