// src/app/[slug]/layout.tsx

export default function BarbeariaLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      {children}
    </>
  );
}