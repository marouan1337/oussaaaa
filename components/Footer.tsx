import Link from "next/link";
import { Github, Twitter, Linkedin } from "lucide-react";

export default function Footer() {
  return (
    <footer className="bg-gray-100 dark:bg-gray-800 mt-auto py-6">
      <div className="container mx-auto px-4 md:px-6 flex flex-col md:flex-row items-center justify-between">
        <p className="text-sm text-gray-500 dark:text-gray-400 mb-4 md:mb-0">
          © {new Date().getFullYear()} Gestion Immobilière. Tous droits réservés.
        </p>
        <div className="flex items-center gap-4">
          <Link href="#" className="text-gray-500 hover:text-gray-700 dark:hover:text-gray-300" prefetch={false}>
            <Github className="h-5 w-5" />
            <span className="sr-only">GitHub</span>
          </Link>
          <Link href="#" className="text-gray-500 hover:text-gray-700 dark:hover:text-gray-300" prefetch={false}>
            <Twitter className="h-5 w-5" />
            <span className="sr-only">Twitter</span>
          </Link>
          <Link href="#" className="text-gray-500 hover:text-gray-700 dark:hover:text-gray-300" prefetch={false}>
            <Linkedin className="h-5 w-5" />
            <span className="sr-only">LinkedIn</span>
          </Link>
        </div>
      </div>
    </footer>
  );
}
