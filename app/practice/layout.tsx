export default function PracticeLayout({
  children,
}: {
  children: React.ReactNode
}) {
  // Trang practice có layout riêng, fullscreen không có navbar/sidebar
  return <>{children}</>
}
