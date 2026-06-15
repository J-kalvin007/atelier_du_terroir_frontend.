export default function PlaceholderPanel({
  title,
  description,
}: {
  title: string;
  description: string;
}) {
  return (
    <div className="rounded-[1.8rem] border border-[#e8dece] bg-white p-8 shadow-[0_18px_60px_rgba(66,49,23,0.08)]">
      <p className="text-xs font-semibold uppercase tracking-[0.24em] text-[#8b5e34]">Section admin</p>
      <h2 className="mt-3 text-2xl font-semibold text-[#1e261d]">{title}</h2>
      <p className="mt-3 max-w-3xl text-sm leading-7 text-[#5b6756]">{description}</p>
    </div>
  );
}
