function Loader() {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-white bg-opacity-75">
      <div className="h-16 w-16 animate-spin rounded-full border-8 border-solid border-blue-500 border-t-transparent"></div>
    </div>
  );
}

export default Loader;