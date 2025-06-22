function Loader() {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-secondary/80 backdrop-blur-sm">
      <div className="h-16 w-16 animate-spin rounded-full border-8 border-solid border-accent border-t-transparent"></div>
    </div>
  );
}

export default Loader;