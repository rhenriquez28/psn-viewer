import Link from "next/link";

const Layout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  return (
    <div className="flex flex-col h-screen justify-between">
      <Navbar />
      <main>{children}</main>
      <Footer />
    </div>
  );
};

export default Layout;

const Navbar = () => {
  return (
    <div className="py-4 px-8 flex justify-between items-center w-full top-0 bg-gray-800 text-zinc-300 shadow-md">
      <Link href={"/"}>
        <div className="font-normal text-2xl cursor-pointer">PSN Viewer</div>
      </Link>
      <div className="w-28">social share placeholder</div>
    </div>
  );
};

const Footer = () => {
  return (
    <div className="bg-gray-800 text-zinc-300 decoration-2 mt-9 p-6">
      <div>Made by Roy Henriquez</div>
      <div>
        Roy Henriquez and PSN Viewer are not affiliated with Sony or PlayStation
        in any way.
      </div>
      <a
        className="block max-w-max underline"
        href="https://platprices.com/"
        target="_blank"
        rel="noreferrer"
      >
        Game info provided by PlatPrices
      </a>
      <a
        className="underline"
        href="https://www.flaticon.com/free-icons/trophy"
        target="_blank"
        title="trophy icons"
        rel="noreferrer"
      >
        Trophy icons created by Creative Stall Premium - Flaticon
      </a>
    </div>
  );
};
