// Renders a responsive 16:9 embed for a Vimeo / YouTube / Loom URL, or a
// placeholder when no URL is configured yet. Wire real URLs in src/lib/steps.ts.
export function VideoEmbed({ url }: { url: string | null }) {
  if (!url) {
    return (
      <div className="flex aspect-video w-full items-center justify-center rounded-xl border border-line bg-white">
        <span className="eyebrow text-textlight">Video coming soon</span>
      </div>
    );
  }

  return (
    <div className="aspect-video w-full overflow-hidden rounded-xl border border-line bg-black">
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
