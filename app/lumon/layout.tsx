type LayoutProps = {
  children: React.ReactNode;
};

export default function Layout(props: LayoutProps) {
  return (
    <div className="flex h-screen flex-col items-center justify-center">
      {props.children}
    </div>
  );
}
